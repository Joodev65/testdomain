export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { image, name = 'image.jpg' } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'Missing "image" field (base64 required)' });
    }

    if (!image.startsWith('data:image')) {
      return res.status(400).json({ error: 'Invalid base64 format' });
    }

    const form = new URLSearchParams();
    form.append('key', '6d207e02198a847aa98d0a2a901485a5');
    form.append('action', 'upload');
    form.append('source', image);
    form.append('format', 'json');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    const upl = await fetch('https://freeimage.host/api/1/upload', {
      method: 'POST',
      body: form,
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!upl.ok) {
      return res.status(upl.status).json({ 
        error: `freeimage.host error: ${upl.statusText}` 
      });
    }

    const data = await upl.json();

    if (data.status_code !== 200) {
      return res.status(400).json({
        error: data.error?.message || data.error || 'Upload failed',
        status_code: data.status_code
      });
    }

    return res.status(200).json({
      success: true,
      url: data.image.url,
      thumb: data.image.thumb?.url || null,
      delete_url: data.image.delete_url,
      filename: data.image.name
    });

  } catch (err) {
    console.error('API Error:', err);
    
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Upload timeout' });
    }

    return res.status(500).json({ 
      error: 'Server error',
      message: err.message 
    });
  }
};

export const config = { 
  api: { 
    bodyParser: { sizeLimit: '50mb' },
    responseLimit: false
  } 
};