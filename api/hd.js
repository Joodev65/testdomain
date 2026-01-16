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
    const apiUrl = "https://ikyyzyyrestapi.my.id/tools/upscale";

    const response = await axios.get(apiUrl, {
      params: {
        apikey: "kyzz",
        url
      },
      timeout: 0
    });

    const data = response.data;

    return res.status(200).json({
      status: true,
      creator: "JooModdss",
      result: data?.result?.result_url || null
    });

  } catch (err) {
    return res.status(500).json({
      status: false,
      creator: "JooModdss",
      error: err.response?.data || err.message
    });
  }
}
