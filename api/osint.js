const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-API-Key');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { number, apikey } = req.query;

    if (!apikey || apikey !== 'INDAH') {
      return res.status(401).json({ 
        error: 'Invalid API Key',
        message: 'Buy access: t.me/Jcodeest4r'
      });
    }

    if (!number) {
      return res.status(400).json({ 
        error: 'Number is required',
        example: '/api/osint?number=628123456789&apikey='
      });
    }

    const cleanNumber = number.replace(/\D/g, '');

    const [api1, api2] = await Promise.allSettled([
      axios.get(
        `https://whatsapp-data1.p.rapidapi.com/number/${cleanNumber}?base64=false&telegram=false&google=false`,
        {
          headers: {
            'x-rapidapi-host': 'whatsapp-data1.p.rapidapi.com',
            'x-rapidapi-key': '972f5c568dmsh552ff4877326665p1b6e67jsn290d2652a173'
          },
          timeout: 15000
        }
      ),
      axios.get(
        `https://whatsapp-data1.p.rapidapi.com/number/no_picture/${cleanNumber}?base64=false&telegram=false&google=false`,
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
        message: 'WhatsApp account not found'
      });
    }

    const combinedData = { 
      success: true,
      number: cleanNumber,
      timestamp: new Date().toISOString(),
      ...data1,
      ...data2
    };

    res.json(combinedData);

  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to fetch WhatsApp data'
    });
  }
};