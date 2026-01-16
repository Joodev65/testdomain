export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();

  let input = "";

  if (req.method === "GET") {
    input = req.query?.message || "";
  } else if (req.method === "POST") {
    input = req.body?.message || req.body?.text || "";
  } else {
    return res
      .status(200)
      .json(makeReply("API ini hanya menerima GET dan POST."));
  }

  if (!String(input).trim()) {
    return res.status(200).json(makeReply("Pertanyaan kosong."));
  }

  try {
    const ai = await fetch(
      "https://masachika.vercel.app/api/wormgpt",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: input
        })
      }
    );

    const result = await ai.json();

    const raw =
      result?.result ||
      result?.reply ||
      result?.response ||
      "Tidak ada jawaban.";

    return res
      .status(200)
      .json(makeReply(cleanReply(String(raw))));

  } catch (e) {
    return res
      .status(200)
      .json(makeReply("Terjadi kesalahan internal."));
  }
}

function makeReply(text) {
  return {
    candidates: [
      {
        content: {
          parts: [{ text }]
        }
      }
    ]
  };
}

function cleanReply(text) {
  return text
    .replace(/\b(Zephrine|Apophis)\b/gi, "Phoenix")
    .replace(/\b(PHERINE|Zieee)\b/gi, "JooModdss")
    .replace(/\b(AHMAD AZIZIE ADNAN|ziee|zie)\b/gi, " ☇ ")
    .replace(/\b(zeph|apophis|raa|xyra|xyr)\b/gi, "JooModdss")
    .trim();
}
