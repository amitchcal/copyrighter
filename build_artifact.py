import json
import os

def build():
    with open('viral_hooks.json', encoding='utf-8') as f:
        hooks = json.load(f)

    with open('styles.css', encoding='utf-8') as f:
        css = f.read()

    with open('app.js', encoding='utf-8') as f:
        js = f.read()

    with open('index.html', encoding='utf-8') as f:
        html = f.read()

    # Inline CSS
    html = html.replace('<link rel="stylesheet" href="styles.css">', f'<style>\n{css}\n</style>')

    # Inline JS and data
    script_block = f"""<script>
window.VIRAL_HOOKS = {json.dumps(hooks, ensure_ascii=False)};
</script>
<script>
{js}
</script>"""

    target_scripts = '<script src="hooks_data.js"></script>\n  <script src="app.js"></script>'
    html = html.replace(target_scripts, script_block)

    artifact_dir = r'C:\Users\amitc\.gemini\antigravity\brain\5d9c58aa-b418-4272-b128-c715adb2e5c0'
    os.makedirs(artifact_dir, exist_ok=True)
    artifact_path = os.path.join(artifact_dir, 'viral_hooks_studio.html')
    with open(artifact_path, 'w', encoding='utf-8') as f:
        f.write(html)

    print('Successfully built standalone artifact at:', artifact_path)

if __name__ == '__main__':
    build()
