// ᴅᴇᴘʟᴏʏ ᴛᴇʀᴘɪsᴀʜ

import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { t, b, m, p } = req.query;
    if (!t || !b || !m || !p) {
      return res.status(400).json({
        status: false,
        creator: "7ooModdss",
        message: "Missing parameters. Example: /api/iqc?t=12:00&b=85&m=Hello&p=Telkomsel"
      });
    }

    const url = `https://myapi.radzzoffc.tech/gen/iqc?t=${encodeURIComponent(t)}&b=${encodeURIComponent(b)}&m=${encodeURIComponent(m)}&p=${encodeURIComponent(p)}`;

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(500).json({
        status: false,
        creator: "7ooModdss",
        message: "Failed to fetch from source API"
      });
    }

    res.setHeader("Content-Type", response.headers.get("content-type") || "image/png");
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({
      status: false,
      creator: "7ooModdss",
      message: err.message
    });
  }
}
