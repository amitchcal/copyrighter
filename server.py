import http.server
import json
import urllib.request
import urllib.error
import os
import sys
import re

PORT = 5173
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def load_env():
    env_vars = {}
    env_path = os.path.join(BASE_DIR, '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    env_vars[k.strip()] = v.strip()
    return env_vars

ENV = load_env()
GEMINI_KEY = ENV.get('GEMINI_API_KEY', '')

ACTIVE_MODELS = [
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-3.8-flash',
    'gemini-3.7-flash'
]

def clean_json_response(raw_text):
    if not raw_text:
        return ""
    cleaned = re.sub(r'^```(?:json)?\s*', '', raw_text.strip(), flags=re.MULTILINE)
    cleaned = re.sub(r'\s*```$', '', cleaned.strip(), flags=re.MULTILINE)
    return cleaned.strip()

def call_gemini(prompt, system_instruction=None, json_mode=False):
    if not GEMINI_KEY:
        raise ValueError("GEMINI_API_KEY is not configured in .env")

    last_err = None

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.8,
            "maxOutputTokens": 2048
        }
    }

    if system_instruction:
        payload["systemInstruction"] = {
            "parts": [{"text": system_instruction}]
        }

    if json_mode:
        payload["generationConfig"]["responseMimeType"] = "application/json"

    for model in ACTIVE_MODELS:
        url = f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_KEY}'
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={'Content-Type': 'application/json'}
            )
            with urllib.request.urlopen(req, timeout=20) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                candidates = data.get('candidates', [])
                if candidates and 'content' in candidates[0]:
                    parts = candidates[0]['content'].get('parts', [])
                    if parts and 'text' in parts[0]:
                        return parts[0]['text']
        except urllib.error.HTTPError as e:
            err_body = e.read().decode('utf-8', errors='replace')
            last_err = f"HTTP {e.code} ({model}): {err_body}"
            continue
        except Exception as e:
            last_err = f"Error ({model}): {str(e)}"
            continue

    raise RuntimeError(f"All Gemini models failed. Last error: {last_err}")

class CopyrighterHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def send_json(self, status_code, data):
        body_bytes = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body_bytes)))
        self.send_header('Connection', 'close')
        self.end_headers()
        self.wfile.write(body_bytes)

    def do_GET(self):
        if self.path == '/api/status':
            self.send_json(200, {
                "status": "online",
                "geminiConfigured": bool(GEMINI_KEY),
                "activeModels": ACTIVE_MODELS
            })
            return
        return super().do_GET()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        try:
            req_data = json.loads(body) if body else {}
        except Exception:
            req_data = {}

        if self.path == '/api/generate-copy':
            platform = req_data.get('platform', 'reels')
            audience = req_data.get('audience', 'everyone')
            topic = req_data.get('topic', 'growth')
            result = req_data.get('result', 'massive results')
            pain = req_data.get('pain', 'lack of traction')
            framework = req_data.get('framework', 'The 2-Second Hook Architecture')
            voice = req_data.get('voice', 'The Tactical Expert')

            sys_prompt = "You are an elite, world-class viral copywriter and short-form video director. You write high-converting, high-retention copy without AI clichés."
            user_prompt = f"""Write a complete, ready-to-publish {platform.upper()} post/script.
Parameters:
- Target Audience: {audience}
- Core Subject: {topic}
- Desired Transformation: {result}
- Pain Point / Cliché to Avoid: {pain}
- Applied Framework: {framework}
- Voice Style Persona: {voice}

Formatting Guidelines:
- If IG Reels / TikTok / YT Shorts: Provide [0-3s HOOK] with Text on Screen, Visual Direction, and Spoken Voiceover. Then [AGITATE & TENSION], then [3-BEAT VALUE DELIVERY], then [IRRESISTIBLE MICRO-CTA].
- If LinkedIn: First 2 lines must be an irresistible scroll-stopping open-loop. Use clean white-space line spacing, dialogue snippets, and a peer-level high-status closing question.
- If X / Twitter: Provide a 5-tweet thread starting with a magnetic hook tweet, followed by 3 high-signal proof tweets, and a punchy closing takeaway.
- If Carousel: Provide Slide 1 (Cover Title & Subtitle), Slides 2-5 (Core Value Nuggets with design cues), and Slide 6 (Save/Share prompt).

Rules:
- NEVER use generic AI buzzwords like 'delve', 'elevate', 'game-changer', 'in today's world', 'unleash'.
- Keep cadence punchy, rhythmic, and visceral."""

            try:
                output_text = call_gemini(user_prompt, system_instruction=sys_prompt, json_mode=False)
                self.send_json(200, {"success": True, "output": output_text})
            except Exception as e:
                self.send_json(500, {"success": False, "error": str(e)})

        elif self.path == '/api/generate-hooks':
            niche = req_data.get('niche', 'general')
            audience = req_data.get('audience', 'everyone')
            dream_result = req_data.get('dreamResult', 'massive growth')
            pain_point = req_data.get('painPoint', 'lack of results')
            tone = req_data.get('tone', 'Viral & High Energy')
            count = int(req_data.get('count', 5))

            sys_prompt = "You are a master short-form copywriter who crafts viral hooks for top creators on Instagram Reels, TikTok, and YouTube Shorts."
            user_prompt = f"""Generate {count} distinct, high-retention viral hooks for short-form video for {niche} targeting {audience} seeking {dream_result} avoiding {pain_point} with tone {tone}.
Return ONLY valid JSON matching:
[
  {{
    "id": 1,
    "hookType": "Contrarian Truth",
    "textOnScreen": "...",
    "spokenLine": "...",
    "visualCue": "...",
    "whyItWorks": "..."
  }}
]"""
            try:
                raw_text = call_gemini(user_prompt, system_instruction=sys_prompt, json_mode=True)
                hooks = json.loads(clean_json_response(raw_text))
                self.send_json(200, {"success": True, "hooks": hooks})
            except Exception as e:
                self.send_json(500, {"success": False, "error": str(e)})

        elif self.path == '/api/remix-hook':
            base_hook = req_data.get('hookText', '')
            category = req_data.get('category', 'Viral')
            niche = req_data.get('niche', 'my niche')
            audience = req_data.get('audience', 'my audience')

            sys_prompt = "You are an elite short-form video script doctor and viral copywriter."
            user_prompt = f"""Adapt and remix this viral hook template: "{base_hook}" for Niche: {niche}, Audience: {audience}.
Return ONLY valid JSON:
[
  {{
    "angle": "Direct & Punchy",
    "remixedHook": "...",
    "spokenLine": "...",
    "tip": "..."
  }}
]"""
            try:
                raw_text = call_gemini(user_prompt, system_instruction=sys_prompt, json_mode=True)
                remixes = json.loads(clean_json_response(raw_text))
                self.send_json(200, {"success": True, "remixes": remixes})
            except Exception as e:
                self.send_json(500, {"success": False, "error": str(e)})

        else:
            self.send_json(404, {"error": "Endpoint not found"})

def run():
    server_address = ('0.0.0.0', PORT)
    httpd = http.server.ThreadingHTTPServer(server_address, CopyrighterHandler)
    httpd.daemon_threads = True
    print("==================================================")
    print(f" [*] Viral Copywriter Intelligence System: http://localhost:{PORT}")
    print(f" [*] Serving from: {BASE_DIR}")
    print(f" [*] Gemini AI Status: {'Configured & Ready' if GEMINI_KEY else 'Missing Key'}")
    print(f" [*] Active Models: {', '.join(ACTIVE_MODELS)}")
    print("==================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")

if __name__ == '__main__':
    run()
