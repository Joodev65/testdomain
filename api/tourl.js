export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();  

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const { image, name = 'image.jpg' } = req.body; 
    if (!image) {
      return res.status(400).json({ error: 'Missing "image" (base64)' });
    }

    const form = new URLSearchParams();
    form.append('key', '6d207e02198a847aa98d0a2a901485a5');
    form.append('action', 'upload');
    form.append('source', image); 
    form.append('format', 'json');

    const upl = await fetch('https://freeimage.host/api/1/upload', {
      method: 'POST',
      body: form,
    });
    const data = await upl.json();

    if (!upl.ok || data.status_code !== 200) {
      return res.status(400).json({
        error: data.error || 'Upload failed',
        details: data,
      });
    }

    return res.status(200).json({
      url: data.image.url,
      thumb: data.image.thumb.url,
      delete_url: data.image.delete_url,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };