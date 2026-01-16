import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { image } = req.query;

    if (!image) {
      return res.status(400).json({ error: "image parameter required" });
    }

    
    const apiUrl = `https://kontollu-bugil.whyux-xec.my.id/api/rmv?image=${encodeURIComponent(image)}`;

    const apiRes = await fetch(apiUrl);
    const apiJson = await apiRes.json();

    if (!apiJson.success || !apiJson.result) {
      return res.status(500).json({ error: "Failed to process image" });
    }

    
    const imgRes = await fetch(apiJson.result);
    const buffer = Buffer.from(await imgRes.arrayBuffer());

    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="result.jpg"'
    );

    return res.status(200).send(buffer);

  } catch (err) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
