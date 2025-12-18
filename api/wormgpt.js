import OpenAI from "openai";

export const config = {
  runtime: "nodejs"
};

const pastebinRaw = "https://pastebin.com/raw/kfuEKJJ6";

let apiKeyCache = null;
let cacheTime = 0;
const cacheTtl = 1000 * 60 * 5;

async function getApiKey() {
  const now = Date.now();
  if (apiKeyCache && now - cacheTime < cacheTtl) {
    return apiKeyCache;
  }

  const r = await fetch(pastebinRaw);
  if (!r.ok) throw new Error("gagal ambil api key");

  const key = (await r.text()).trim();
  if (!key) throw new Error("api key kosong");

  apiKeyCache = key;
  cacheTime = now;
  return key;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (req.method === "GET") {
      return res.status(200).json({
        status: true,
        message: "Only Post",
        model: "openai/gpt-oss-20b"
      });
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { message } = req.body || {};
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message wajib" });
    }

    const apiKey = await getApiKey();

    const client = new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1"
    });

    const systemPrompt = `
You are JooCodeGPT, created by Jose Timothy Or JooModdss.
Jawab singkat, jelas, bahasa Indonesia.
    `.trim();

    const response = await client.responses.create({
      model: "openai/gpt-oss-20b",
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ]
    });

    return res.status(200).json({
      success: true,
      response: response.output_text
    });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}