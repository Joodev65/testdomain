import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query, url } = req.query;

  try {
    if (query) {
      const { data } = await axios.get(
        "https://host.optikl.ink/soundcloud/search",
        { params: { query: query } }
      );

      return res.status(200).json({
        status: true,
        creator: "JooModdss",
        result: data
      });
    }

    if (url) {
      const { data } = await axios.get(
        "https://host.optikl.ink/soundcloud/download",
        { params: { url: url } }
      );

      return res.status(200).json({
        status: true,
        creator: "JooModdss",
        result: data
      });
    }

    return res.status(400).json({
      status: false,
      creator: "JooModdss",
      error: "Missing query or url parameter"
    });

  } catch (err) {
    return res.status(500).json({
      status: false,
      creator: "JooModdss",
      error: err.response?.data || err.message
    });
  }
}
