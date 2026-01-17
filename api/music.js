import axios from "axios";

const SCDL = {
  baseUrl: "https://sc.snapfirecdn.com",
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0"
  },

  async download(url) {
    if (!url) throw new Error("Missing SoundCloud URL");

    const { data: info } = await axios.post(
      `${this.baseUrl}/soundcloud`,
      { target: url, gsc: "x" },
      { headers: this.headers }
    );

    if (!info.sound?.progressive_url) {
      throw new Error("Failed to fetch progressive stream");
    }
 
    const { data: dl } = await axios.get(
      `${this.baseUrl}/soundcloud-get-dl`,
      {
        params: { target: info.sound.progressive_url },
        headers: this.headers
      }
    );

    return {
      title: info.sound.title,
      artist: info.metadata.username,
      thumb: info.metadata.artwork_url,
      direct_url: dl.url
    };
  }
};

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

      if (!search?.length) {
        return res.status(404).json({
          status: false,
          creator: "JooModdss",
          error: "Lagu tidak ditemukan"
        });
      }

      const top = search[0];

      const dl = await SCDL.download(top.url);

      return res.status(200).json({
        status: true,
        creator: "JooModdss",
        result: {
          title: dl.title,
          thumbnail: dl.thumb,
          source_url: top.url,
          download_url: dl.direct_url
        }
      });
    }

    if (download) {
      const dl = await SCDL.download(download);

      return res.status(200).json({
        status: true,
        creator: "JooModdss",
        result: {
          title: dl.title,
          thumbnail: dl.thumb,
          download_url: dl.direct_url
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
      error: err.message
    });
  }
}
