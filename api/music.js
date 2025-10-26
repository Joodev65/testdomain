// ᴅᴇᴘʟᴏʏ ᴛᴇʀᴘɪsᴀʜ

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const query = req.query?.query;
  if (!query) return res.status(400).json({ error: "Missing query parameter" });

  try {
    const apiUrl = `https://faa-jian.my.id/search/spotify?q=${encodeURIComponent(query)}`;
    const r = await fetch(apiUrl);
    const data = await r.json();

    if (!data || !data.success)
      return res.status(500).json({ error: "SpotifyV2 API error", raw: data });

    const result = data.result;

    const formatted = {
      status: true,
      title: result.title || null,
      artist: result.author || null,
      duration: result.duration || null,
      album: result.album || null,
      release_date: result.release_date || null,
      thumbnail: result.thumbnail || result.image || null,
      spotify_url: result.url || null,
      download: `https://spotifyapi.caliphdev.com/api/download/track?url=${encodeURIComponent(result.url)}`
    };

    return res.status(200).json(formatted);

  } catch (err) {
    return res.status(500).json({ error: "Server error", message: err.message });
  }
}
