import axios from "axios";
import fs from "fs";
import FormData from "form-data";

async function generateImage(imgUrl) {
  let uploadedImageUrl = imgUrl;
  
  if (!imgUrl.startsWith('http')) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(imgUrl));
    
    const uploadResponse = await axios.post('https://vondyapi-proxy.com/files/', formData, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        ...formData.getHeaders()
      }
    });
    
    uploadedImageUrl = uploadResponse.data.fileUrl || uploadResponse.data.data?.fileUrl;
  }

  const conversationData = {
    messages: [
      {
        sender: "user",
        name: "You",
        message: `Create a commercialized figure of the character in the illustration, in a realistic style and environment. Place the figure on a computer desk, using a circular transparent acrylic base without any text. On the computer screen, display the ZBrush modeling process of the figure. Next to the computer screen, place a BANDAI-style toy packaging box printed with the original artwork. @@hidden {} Reference images for "inputImageUrl": [Image 1]: ${uploadedImageUrl} @@hidden`,
        files: [
          {
            type: "image_url",
            image_url: {
              url: uploadedImageUrl
            }
          }
        ],
        image: null,
        type: 1
      }
    ]
  };

  const conversationResponse = await axios.post('https://vondyapi-proxy.com/bot/4d2da86f-d279-4425-8446-851f935c40f1/conversations/', conversationData, {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
      'Referer': 'https://www.vondy.com/ai-photo-generator-image-to-image--oev9VhNA?lc=5'
    }
  });

  const conversationId = conversationResponse.data.data?.id;

  const imageGenerationData = {
    model: "text-davinci-003",
    maxTokens: 3000,
    input: "mBn00gqQNYCVaFrtprf04Y41pGZ2xoR2oBI1r+h5LLmXGdv/xRCALmS3H6DBCdP1VsTpfXngY1BQhsfTq6rUna30E7uleY6aSbfNRc292LiCq1Q522sh0C0//DshIynJhCWTkEYKWhgyhtKQdPmPbUxC92bAfU4Royr6aaipcL+nTqie3cdscS7f2uBiHO53YxKFKhUb4Q8FNarEJLrUHIFQ+4GeslATgD/NZFak9OC3Vbnl/r09knYHInkAjeGx2uX/5qD0c6P0whSDS/ZVUqjWOiw6pEbsyQORkSe0ccfYmJlTXiE627PQx5d3+xFiL7PPOEG8uQ1ywtfBHghPV+TcxsmoMLdUmmymqGo0+FoIuv5PAUeQwqgaRYMYpaj0y2RTstl9kgnJlhnFCe08dXKLr8hDThSinEoNDFgyt5RJ8nlqWunowtfQ/UNWke8vZ0lq7BS6vZh16llBiDUMkfSs8Gom9i3X/LF1ZPrznysfZxO0+PMxRdv8YSvvKLjFhjlXCMzvn3Hjobpynk5RTbc2Um1q+ypGzeLPVIsKSis+BKLwvZpLXF9OdMiyeejU1N9aKHrP+j0gq4s283/7zMvhdTAS/HGuLZNfQRJ3Hp9q1WZWazch++EoMEJ4lovTfugNMP/G9XeYsJ8QtX1Fl2u7Z46F0Favilxgii9cu9M=",
    temperature: 0.5,
    e: true,
    summarizeInput: true,
    inHTML: false,
    size: "1024x1024",
    numImages: 1,
    useCredits: false,
    titan: false,
    quality: "standard",
    embedToken: null,
    edit: "Create a commercialized figure of the character in the illustration, in a realistic style and environment. Place the figure on a computer desk, using a circular transparent acrylic base without any text. On the computer screen, display the ZBrush modeling process of the figure. Next to the computer screen, place a BANDAI-style toy packaging box printed with the original artwork.",
    inputImageUrl: uploadedImageUrl,
    seed: Math.floor(Math.random() * 1000000),
    similarityStrength: 0.8084920830340128,
    flux: true,
    pro: false,
    face: false,
    useGPT: false
  };

  const imageResponse = await axios.post('https://vondyapi-proxy.com/images/', imageGenerationData, {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36'
    }
  });

  const generatedImageUrl = imageResponse.data.data?.[0] || imageResponse.data;

  const updateData = {
    messages: [
      {
        sender: "user",
        name: "You",
        message: `Create a commercialized figure of the character in the illustration, in a realistic style and environment. Place the figure on a computer desk, using a circular transparent acrylic base without any text. On the computer screen, display the ZBrush modeling process of the figure. Next to the computer screen, place a BANDAI-style toy packaging box printed with the original artwork. @@hidden {} Reference images for "inputImageUrl": [Image 1]: ${uploadedImageUrl} @@hidden`,
        files: [
          {
            type: "image_url",
            image_url: {
              url: uploadedImageUrl
            }
          }
        ],
        image: null,
        type: 1
      },
      {
        sender: "bot",
        name: "Ai Photo Generator Image To Image",
        message: `@@ImgGen { 
  "quality":"standard", 
  "edit":"Create a commercialized figure of the character in the illustration, in a realistic style and environment. Place the figure on a computer desk, using a circular transparent acrylic base without any text. On the computer screen, display the ZBrush modeling process of the figure. Next to the computer screen, place a BANDAI-style toy packaging box printed with the original artwork.", 
  "inputImageUrl": "${uploadedImageUrl}" 
}
A commercialized figure based on the reference image, displayed on a computer desk with a circular transparent acrylic base. The computer screen shows the ZBrush modeling process of the figure. Next to the screen is a BANDAI-style toy packaging box featuring the original artwork. The overall style is realistic with detailed rendering of the figure and environment.
@@ImgGen`,
        type: 1,
        title: "Ai Photo Generator Image To Image"
      }
    ]
  };

  await axios.put(`https://vondyapi-proxy.com/bot/conversations/${conversationId}/`, updateData, {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36'
    }
  });

  return {
    generatedImageUrl: generatedImageUrl,
    uploadedImageUrl: uploadedImageUrl,
    conversationId: conversationId,
    message: 'Image generated successfully'
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { imgUrl } = req.body;
    const result = await generateImage(imgUrl);
    return res.status(200).json(result);
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({
      error: err.response?.data || err.message
    });
  }
}
