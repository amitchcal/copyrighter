export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, error: "GEMINI_API_KEY is not configured in Vercel Environment Variables" });
  }
  const { hookText = '', niche = 'my niche', audience = 'my audience' } = req.body || {};

  const models = ['gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.8-flash'];
  const userPrompt = `Adapt and remix this viral hook template: "${hookText}" for Niche: ${niche}, Audience: ${audience}.
Return ONLY valid JSON:
[
  {
    "angle": "Direct & Punchy",
    "remixedHook": "...",
    "spokenLine": "...",
    "tip": "..."
  }
]`;

  const payload = {
    contents: [{ parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0.8,
      responseMimeType: "application/json"
    }
  };

  for (const m of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const data = await response.json();
        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (raw) {
          const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
          return res.status(200).json({ success: true, remixes: JSON.parse(cleaned) });
        }
      }
    } catch (e) {}
  }

  return res.status(500).json({ success: false, error: 'Remix generation failed' });
}
