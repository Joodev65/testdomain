import axios from 'axios';

const HD_APIS = [
  {
    name: 'BigJPG',
    url: 'https://api.bigjpg.com/api/v1/',
    method: 'POST',
    enhancer: async (imageUrl) => {
      const formData = new FormData();
      formData.append('file', imageUrl);
      formData.append('style', 'art');
      formData.append('noise', '3');
      formData.append('x2', '1');
      
      const response = await axios.post('https://api.bigjpg.com/api/v1/', formData, {
        headers: {
          'X-API-KEY': 'dea880d351d043bcb71780fb2cfb8357', 
          ...formData.getHeaders()
        },
        timeout: 45000
      });
      
      return response.data.url;
    }
  },
  {
    name: 'Real-ESRGAN',
    url: 'https://api.real-esrgan.com/enhance',
    method: 'POST', 
    enhancer: async (imageUrl) => {
      const response = await axios.post('https://api.real-esrgan.com/enhance', {
        image: imageUrl,
        scale: 4
      }, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.data.url;
    }
  },
  {
    name: 'LetEnhance',
    url: 'https://api.letsenhance.ai/image',
    method: 'POST',
    enhancer: async (imageUrl) => {
      const response = await axios.post('https://api.letsenhance.ai/image', {
        image: imageUrl,
        scale: 2
      }, {
        timeout: 30000,
        headers: {
          'Authorization': 'Bearer free-tier-key'  
        }
      });
      
      return response.data.url;
    }
  }
];

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ 
      success: false,
      error: 'Parameter url diperlukan' 
    });
  }

  try {
    new URL(url);
  } catch (e) {
    return res.status(400).json({
      success: false,
      error: 'URL tidak valid'
    });
  }

  try {
    console.log('Processing HD enhancement for:', url);

    try {
      console.log('Trying Waifu2x...');
      const waifuResponse = await axios.get(`http://waifu2x.udp.jp/api`, {
        params: {
          url: url,
          scale: 2,
          noise: 1,
          style: 'art'
        },
        timeout: 25000
      });

      if (waifuResponse.data && (waifuResponse.data.url || waifuResponse.data.id)) {
        const hdUrl = waifuResponse.data.url || `http://waifu2x.udp.jp/result/${waifuResponse.data.id}`;
        
        return res.status(200).json({
          success: true,
          original_url: url,
          hd_url: hdUrl,
          method: 'waifu2x',
          enhanced: true
        });
      }
    } catch (waifuError) {
      console.log('Waifu2x failed:', waifuError.message);
    }

    try {
      console.log('Trying Cloudinary enhancement...');
      
      const encodedUrl = Buffer.from(url).toString('base64');
      const cloudinaryUrl = `https://res.cloudinary.com/demo/image/fetch/e_sharpen:100,e_contrast:10,q_auto:good/${encodedUrl}`;
      
      await axios.head(cloudinaryUrl, { timeout: 10000 });
      
      return res.status(200).json({
        success: true,
        original_url: url,
        hd_url: cloudinaryUrl,
        method: 'cloudinary_sharpen',
        enhanced: true,
        message: 'Image ditingkatkan kualitasnya dengan sharpening'
      });
      
    } catch (cloudinaryError) {
      console.log('Cloudinary failed:', cloudinaryError.message);
    }

    const resizedUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=2000&q=95&n=-1`;
    
    return res.status(200).json({
      success: true,
      original_url: url,
      hd_url: resizedUrl,
      method: 'weserv_resize',
      enhanced: true,
      message: 'Image di-resize dengan kualitas tinggi'
    });

  } catch (error) {
    console.error('[HD API] All methods failed:', error.message);
    
    return res.status(200).json({
      success: true,
      original_url: url,
      hd_url: url,
      method: 'original',
      enhanced: false,
      message: 'Semua service HD sedang sibuk, menggunakan gambar original'
    });
  }
};