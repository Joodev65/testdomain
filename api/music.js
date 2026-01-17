import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query, alicia, download } = req.query;

  try {
    if (alicia) {
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
 
    if (query) {
      const { data } = await axios.get(
        "https://host.optikl.ink/soundcloud/search",
        { params: { query } }
      );

      if (!data || !data.length) {
        return res.status(404).json({
          status: false,
          creator: "JooModdss",
          error: "Lagu tidak ditemukan"
        });
      }

      const top = data[0];

      const { data: dl } = await axios.get(
        "https://host.optikl.ink/soundcloud/download",
        { params: { url: top.url } }
      );

      return res.status(200).json({
        status: true,
        creator: "JooModdss",
        result: {
          title: top.title,
          thumbnail: top.thumbnail,
          source_url: top.url,
          download_url: dl.download_url || dl.url
        }
      });
    }
 
    if (download) {
      const { data } = await axios.get(
        "https://host.optikl.ink/soundcloud/download",
        { params: { url: download } }
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
      error: "Missing query / alicia / download parameter"
    });

  } catch (err) {
    return res.status(500).json({
      status: false,
      creator: "JooModdss",
      error: err.response?.data || err.message
    });
  }
}
