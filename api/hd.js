import axios from 'axios';

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
      const waifuResponse = await axios.get(`http://waifu2x.udp.jp/api`, {
        params: {
          url: url,
          scale: 2,
          noise: 1,
          style: 'art'
        },
        timeout: 30000
      });

      if (waifuResponse.data && waifuResponse.data.url) {
        return res.status(200).json({
          success: true,
          original_url: url,
          hd_url: waifuResponse.data.url,
          method: 'waifu2x'
        });
      }
    } catch (waifuError) {
      console.log('Waifu2x failed, trying alternative...');
    }

    return res.status(200).json({
      success: true,
      original_url: url,
      hd_url: url,
      method: 'original',
      message: 'HD enhancement service sedang sibuk, menggunakan gambar original'
    });

  } catch (error) {
    console.error('[HD API] Error:', error.message);
    
    return res.status(500).json({
      success: false,
      error: 'Service sedang sibuk, coba lagi nanti',
      details: error.message
    });
  }
};