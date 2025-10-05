// ᴅᴇᴘʟᴏʏ ᴛᴇʀᴘɪsᴀʜ

import fetch from "node-fetch";

export default async function handler(req, res) {
  const { domain, plta, pltc } = req.query;

  if (!domain || !plta || !pltc) {
    return res.status(400).json({
      status: false,
      message: "Missing parameters",
    });
  }

  try {
    const response = await fetch(
      `https://yume-figure.vercel.app/api/getsession?domain=${encodeURIComponent(domain)}&plta=${encodeURIComponent(plta)}&pltc=${encodeURIComponent(pltc)}`
    );

    const data = await response.json();

    data.creator = "7ooModsss";

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
}
