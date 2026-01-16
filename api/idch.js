import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  try {
    const apiRes = await axios.get(
      "http://143.198.217.184:8000/check",
      {
        params: { url },
        timeout: 15000
      }
    );

    const data = apiRes.data;

    return res.status(200).json({
      status: true,
      creator: "JooōModdss",
      result: {
        id: data.id,
        name: data.name,
        subscribers: data.subscribers
      }
    });

  } catch (err) {
    return res.status(500).json({
      status: false,
      creator: "JooōModdss",
      error: err.response?.data || err.message
    });
  }
}
