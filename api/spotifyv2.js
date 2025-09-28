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
    const apiUrl = `https://ochinpo-helper.hf.space/yt?query=${encodeURIComponent(query)}`;
    const r = await fetch(apiUrl);
    const data = await r.json();

    if (!data || !data.success)
      return res.status(500).json({ error: "SpotifyV2 API error", raw: data });

    const result = data.result;

    const formatted = {
      success: true,
      result: {
        type: result.type,
        videoId: result.videoId,
        url: result.url,
        title: result.title,
        description: result.description,
        image: result.image,
        thumbnail: result.thumbnail,
        seconds: result.seconds,
        timestamp: result.timestamp,
        duration: result.duration,
        ago: result.ago,
        views: result.views,
        author: result.author,
        download: result.download
      }
    };

    return res.status(200).json(formatted);

  } catch (err) {
    return res.status(500).json({ error: "Server error", message: err.message });
  }
}
