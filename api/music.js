import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query, download, alicia } = req.query;

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
      const { data: search } = await axios.get(
        "https://host.optikl.ink/soundcloud/search",
        { params: { query } }
      );

      if (!search || !search.length) {
        return res.status(404).json({
          status: false,
          creator: "JooModdss",
          error: "Lagu tidak ditemukan"
        });
      }

      const top = search[0];
      const { data: dl } = await axios.get(
        "https://aliicia.my.id/api/music",
        { params: { download: top.url } }
      );

      return res.status(200).json({
        status: true,
        creator: "JooModdss",
        result: {
          title: top.title,
          thumbnail: top.thumbnail,
          source_url: top.url,
          download_url: dl.result.download_url
        }
      });
    }
    
    if (download) {
      const { data: dl } = await axios.get(
        "https://host.optikl.ink/soundcloud/download",
        { params: { url: download } }
      );

      return res.status(200).json({
        status: true,
        creator: "JooModdss",
        result: {
          download_url: audio_url
        }
      });
    }

    return res.status(400).json({
      status: false,
      creator: "JooModdss",
      error: "Parameter query / alicia / download wajib diisi"
    });

  } catch (err) {
    return res.status(500).json({
      status: false,
      creator: "JooModdss",
      error: err.response?.data || err.message
    });
  }
}
