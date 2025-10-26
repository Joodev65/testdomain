const axios = require('axios');

const VALID_API_KEYS = ['INDAH'];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-API-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || !VALID_API_KEYS.includes(apiKey)) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid API Key. Buy access at: t.me/Jcodeest4r'
      });
    }

    const { number } = req.query;
    if (!number) {
      return res.status(400).json({ 
        error: 'Number is required',
        example: '?number=628123456789'
      });
    }

    if (!/^\d+$/.test(number)) {
      return res.status(400).json({ 
        error: 'Invalid number format',
        message: 'Number should contain only digits'
      });
    }

    const [api1, api2] = await Promise.allSettled([
      axios.get(
        `https://whatsapp-data1.p.rapidapi.com/number/${number}?base64=false&telegram=false&google=false`,
        {
          headers: {
            'x-rapidapi-host': 'whatsapp-data1.p.rapidapi.com',
            'x-rapidapi-key': '972f5c568dmsh552ff4877326665p1b6e67jsn290d2652a173'
          },
          timeout: 15000
        }
      ),
      axios.get(
        `https://whatsapp-data1.p.rapidapi.com/number/no_picture/${number}?base64=false&telegram=false&google=false`,
        {
          headers: {
            'x-rapidapi-host': 'whatsapp-data1.p.rapidapi.com', 
            'x-rapidapi-key': '972f5c568dmsh552ff4877326665p1b6e67jsn290d2652a173'
          },
          timeout: 15000
        }
      )
    ]);

    const data1 = api1.status === 'fulfilled' ? api1.value.data : null;
    const data2 = api2.status === 'fulfilled' ? api2.value.data : null;

    if ((!data1 && !data2) || (data1?.exists === false && data2?.exists === false)) {
      return res.status(404).json({ 
        error: 'Number not found',
        message: 'WhatsApp account not found or does not exist'
      });
    }

    const combinedData = { 
      success: true,
      number: number,
      ...data1,
      ...data2,
      profile_pic: data1?.profilePic || null,
      timestamp: new Date().toISOString()
    };

    delete combinedData.profilePic;

    return res.status(200).json(combinedData);

  } catch (error) {
    console.error('Osint Api Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch WhatsApp information'
    });
  }
};