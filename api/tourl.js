import axios from 'axios';
import FormData from 'form-data';

const IMGBB_API_KEY = 'b30e0f0760d2de4cbb1b7ef3ab2a39e4';

const requestCache = new Map();

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let imageUrl;
    
    if (req.method === 'GET') {
      imageUrl = req.query.url;
    } else if (req.method === 'POST') {
      imageUrl = req.body.url;
    }

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Parameter url diperlukan'
      });
    }

    try {
      new URL(imageUrl);
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: 'URL tidak valid'
      });
    }

    console.log('Processing image URL:', imageUrl);

    const cacheKey = `img_${Buffer.from(imageUrl).toString('base64')}`;
    if (requestCache.has(cacheKey)) {
      const cached = requestCache.get(cacheKey);
      console.log('Returning cached result');
      return res.status(200).json(cached);
    }

    const fileResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 15000,  
      maxContentLength: 10 * 1024 * 1024, 
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (fileResponse.data.length > 8 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        error: 'File terlalu besar (max 8MB)'
      });
    }

    const form = new FormData();
    form.append('image', Buffer.from(fileResponse.data), {
      filename: `joo_${Date.now()}.jpg`,
      contentType: 'image/jpeg'
    });
    form.append('key', IMGBB_API_KEY);
    form.append('name', `joo_${Date.now()}`);

    let imgbbResponse;
    let retry = 0;
    let lastError;

    while (retry < 2) {  
      try {
        console.log(`Upload attempt ${retry + 1} to ImgBB`);
        
        imgbbResponse = await axios.post('https://api.imgbb.com/1/upload', form, {
          headers: {
            ...form.getHeaders(),
          },
          timeout: 30000,  
        });

        if (imgbbResponse.data?.status === 200 && imgbbResponse.data?.data?.url) {
          break;
        } else {
          throw new Error(imgbbResponse.data?.error?.message || 'ImgBB upload failed');
        }
      } catch (err) {
        lastError = err;
        retry++;
        if (retry === 2) break;
        
        const delay = 1000 * retry;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    if (retry === 2 && lastError) {
      throw lastError;
    }

    const { url, thumb, delete_url, display_url, size, expiration } = imgbbResponse.data.data;

    const responseData = {
      success: true,
      message: 'Berhasil upload image ke URL',
      data: {
        url: url,
        display_url: display_url || url,
        thumbnail: thumb?.url || thumb,
        delete_url: delete_url,
        size: size,
        expiration: expiration,
        image_info: {
          name: `joo_${Date.now()}`,
          format: 'jpg',
          uploaded_at: new Date().toISOString()
        }
      }
    };

    requestCache.set(cacheKey, responseData);
    setTimeout(() => {
      requestCache.delete(cacheKey);
    }, 5 * 60 * 1000);

    console.log('Upload successful');
    return res.status(200).json(responseData);

  } catch (error) {
    console.error('[Tourl API] Error:', error.response?.data || error.message);
    
    let errorMessage = 'Unknown error occurred';
    let statusCode = 500;

    if (error.response) {
      errorMessage = error.response.data?.error?.message || 
                    error.response.statusText || 
                    'ImgBB API error';
      statusCode = error.response.status;
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout - coba gambar yang lebih kecil';
      statusCode = 408;
    } else if (error.message.includes('Invalid URL')) {
      errorMessage = 'URL tidak valid';
      statusCode = 400;
    } else if (error.message.includes('File terlalu besar')) {
      errorMessage = 'File terlalu besar (max 8MB)';
      statusCode = 400;
    } else {
      errorMessage = error.message;
    }

    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};