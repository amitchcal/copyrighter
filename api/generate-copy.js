export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, error: "GEMINI_API_KEY is not configured in Vercel Environment Variables" });
  }
  const { platform = 'reels', audience = 'everyone', topic = 'growth', result = 'success', pain = 'clichés', framework = 'The 2-Second Hook Architecture', voice = 'The Tactical Expert' } = req.body || {};

  const models = ['gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.8-flash', 'gemini-3.7-flash'];

  const sysPrompt = "You are an elite, world-class viral copywriter and short-form video director. You write high-converting, high-retention copy without AI clichés.";
  const userPrompt = `Write a complete, ready-to-publish ${platform.toUpperCase()} post/script.
Parameters:
- Target Audience: ${audience}
- Core Subject: ${topic}
- Desired Transformation: ${result}
- Pain Point / Cliché to Avoid: ${pain}
- Applied Framework: ${framework}
- Voice Style Persona: ${voice}

Formatting Guidelines:
- If IG Reels / TikTok / YT Shorts: Provide [0-3s HOOK] with Text on Screen, Visual Direction, and Spoken Voiceover. Then [AGITATE & TENSION], then [3-BEAT VALUE DELIVERY], then [IRRESISTIBLE MICRO-CTA].
- If LinkedIn: First 2 lines must be an irresistible scroll-stopping open-loop. Use clean white-space line spacing, dialogue snippets, and a peer-level high-status closing question.
- If X / Twitter: Provide a 5-tweet thread starting with a magnetic hook tweet, followed by 3 high-signal proof tweets, and a punchy closing takeaway.
- If Carousel: Provide Slide 1 (Cover Title & Subtitle), Slides 2-5 (Core Value Nuggets with design cues), and Slide 6 (Save/Share prompt).

Rules:
- NEVER use generic AI buzzwords like 'delve', 'elevate', 'game-changer', 'in today's world', 'unleash'.
- Keep cadence punchy, rhythmic, and visceral.`;

  const payload = {
    contents: [{ parts: [{ text: userPrompt }] }],
    systemInstruction: { parts: [{ text: sysPrompt }] },
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 2048
    }
  };

  let lastError = null;
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
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return res.status(200).json({ success: true, output: text });
        }
      } else {
        lastError = `HTTP ${response.status}: ${await response.text()}`;
      }
    } catch (err) {
      lastError = err.message;
    }
  }

  return res.status(500).json({ success: false, error: lastError });
}
