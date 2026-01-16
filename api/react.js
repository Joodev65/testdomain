import axios from "axios";

const JooModdss = [
  "1bc421060f5822a3c59b1e3c81c34ad79758965621a541af22cbe3c830113ab0",
  "5df0e4cd298e10895a4227dc6618eb557c068d5a674e881e75db3e8fd09e7cb7",
  "56f4af86f6e56e68f0d74cbad8139c850e8d95935007bb4989ee4d44257cf670"
];

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
      creator: "JooModdss",
    });
  }

  let { link, emoji } = req.query;
  emoji = decodeURIComponent(emoji || "").trim();

  if (!link || !emoji) {
    return res.status(400).json({
      success: false,
      message: "Parameter link dan emoji wajib",
      creator: "JooModdss",
      example: "?link=linkpost&emoji=🤡,🥶,🤯"
    });
  }

  const regex = /^https:\/\/whatsapp\.com\/channel\/[A-Za-z0-9-_]+\/\d+$/;
  if (!regex.test(link)) {
    return res.status(400).json({
      success: false,
      message: "Format link salah",
      creator: "JooModdss"
    });
  }

  const emojis = emoji
    .split(",")
    .map(e => e.trim())
    .filter(Boolean);

  if (!emojis.length) {
    return res.status(400).json({
      success: false,
      message: "Emoji tidak valid",
      creator: "JooModdss"
    });
  }

  for (let i = 0; i < JooModdss.length; i++) {
    const apiKey = JooModdss[i];

    try {
      await axios.post(
        "https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/channel/react-to-post",
        {
          post_link: link,
          reacts: emojis
        },
        {
          headers: {
            "content-type": "application/json"
          },
          params: { apiKey }
        }
      );

      return res.status(200).json({
        success: true,
        message: "React berhasil dikirim",
        creator: "JooModdss",
        token_used: i + 1,
        emoji: emojis.join("")
      });

    } catch (e) {
      const status = e.response?.status;
      const msg = e.response?.data?.message || "";

      if (status === 402 || msg.toLowerCase().includes("limit")) {
        continue; 
      }

      return res.status(500).json({
        success: false,
        message: "Gagal kirim react",
        creator: "JooModdss",
        error: msg || "Unknown error"
      });
    }
  }

  return res.status(429).json({
    success: false,
    message: "Semua API Limit",
    creator: "JooModdss"
  });
}
