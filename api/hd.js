const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Parameter url diperlukan' });
  }

  try {
    const response = await axios.get(`http://waifu2x.udp.jp/api`, {
      params: {
        url: url,
        scale: 2,
        noise: 1,
        style: 'art'
      }
    });

    return res.status(200).json({
      success: true,
      original_url: url,
      hd_url: response.data.url || `http://waifu2x.udp.jp/result/${response.data.id}`
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Service sedang sibuk, coba lagi nanti'
    });
  }
};