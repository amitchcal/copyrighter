export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.status(200).json({
    status: "online",
    platform: "vercel",
    geminiConfigured: true,
    model: "gemini-3.8-flash"
  });
}
