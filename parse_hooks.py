import zipfile
import xml.etree.ElementTree as ET
import re
import json
import csv

CATEGORY_NAMES = {
    'EDUCATIONAL',
    'COMPARISON',
    'MYTH BUSTING',
    'STORYTELLING',
    'RANDOM',
    'AUTHORITY',
    'DAY IN THE LIFE'
}

def clean_text(t):
    if not t:
        return ""
    # Smart quotes & dashes
    t = t.replace('\u2019', "'").replace('\u2018', "'")
    t = t.replace('\u201c', '"').replace('\u201d', '"')
    t = t.replace('\u2013', "-").replace('\u2014', "-")
    # Multiple whitespace
    t = re.sub(r'[ \t]+', ' ', t)
    return t.strip()

def parse_docx(filename):
    with zipfile.ZipFile(filename) as z:
        tree = ET.fromstring(z.read('word/document.xml'))
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        body = tree.find('.//w:body', ns)
        
        raw_rows = []
        for tbl in body.findall('.//w:tbl', ns):
            for r in tbl.findall('.//w:tr', ns):
                cells = r.findall('.//w:tc', ns)
                row_data = []
                for c in cells:
                    ps = c.findall('.//w:p', ns)
                    p_texts = [''.join([t.text for t in p.findall('.//w:t', ns) if t.text]).strip() for p in ps]
                    p_texts = [clean_text(p) for p in p_texts if p]
                    row_data.append(p_texts)
                raw_rows.append(row_data)

    hooks = []
    current_category = 'EDUCATIONAL'
    i = 0
    while i < len(raw_rows):
        row = raw_rows[i]
        if not row or not any(row):
            i += 1
            continue
        
        col0_p = row[0] if len(row) > 0 else []
        col1_p = row[1] if len(row) > 1 else []
        
        col0 = " ".join(col0_p).strip()
        col1 = " ".join(col1_p).strip()
        
        # Check if category header row
        if col0.upper() in CATEGORY_NAMES and ('INSPO' in col1.upper() or not col1):
            current_category = col0.upper()
            i += 1
            continue
            
        # Check if row 0 has multiple distinct hooks (like the 7 in 1 cell)
        if len(col0_p) > 3 and all(len(p) > 20 for p in col0_p):
            # Parse multiple URLs in col1
            urls = [re.sub(r'\s+', '', u).strip() for u in col1_p if u]
            if not urls:
                urls = [re.sub(r'\s+', '', u).strip() for u in col1.split() if u.startswith('http')]
            for idx, p_hook in enumerate(col0_p):
                u = [urls[idx]] if idx < len(urls) else []
                placeholders = list(dict.fromkeys(re.findall(r'\([^)]+\)', p_hook)))
                hooks.append({
                    'id': len(hooks) + 1,
                    'category': current_category,
                    'hook': p_hook,
                    'urls': u,
                    'placeholders': placeholders
                })
            i += 1
            continue
            
        hook_text = col0
        url_text = col1
        
        # Look ahead for table cell splits across rows
        while i + 1 < len(raw_rows):
            next_row = raw_rows[i+1]
            next_col0 = " ".join(next_row[0]).strip() if len(next_row) > 0 else ''
            next_col1 = " ".join(next_row[1]).strip() if len(next_row) > 1 else ''
            
            # Check if next row is category header
            if next_col0.upper() in CATEGORY_NAMES and ('INSPO' in next_col1.upper() or not next_col1):
                break
                
            is_continuation = False
            if next_col1 == '' and next_col0 != '':
                is_continuation = True
            elif next_col1 != '' and not (next_col1.startswith('http://') or next_col1.startswith('https://')):
                is_continuation = True
            elif next_col0 == '' and next_col1 != '':
                is_continuation = True
                
            if is_continuation:
                if next_col0:
                    hook_text = (hook_text + ' ' + next_col0).strip()
                if next_col1:
                    url_text = (url_text + next_col1).strip()
                i += 1
            else:
                break
                
        hook_text = re.sub(r'\s+', ' ', clean_text(hook_text))
        
        # Parse urls
        raw_urls = re.split(r'\s+and\s+|\s+(?=https?://)', url_text)
        urls = []
        for u in raw_urls:
            cleaned_u = re.sub(r'\s+', '', u).strip()
            if cleaned_u.startswith('http://') or cleaned_u.startswith('https://'):
                urls.append(cleaned_u)
                
        placeholders = list(dict.fromkeys(re.findall(r'\([^)]+\)', hook_text)))
        
        if hook_text and hook_text.upper() not in CATEGORY_NAMES:
            hooks.append({
                'id': len(hooks) + 1,
                'category': current_category,
                'hook': hook_text,
                'urls': urls,
                'placeholders': placeholders
            })
        i += 1

    return hooks

if __name__ == '__main__':
    hooks = parse_docx('Copy of 1,000 Viral Hooks.docx')
    print(f'Total parsed hooks: {len(hooks)}')
    
    # Save JSON
    with open('viral_hooks.json', 'w', encoding='utf-8') as f:
        json.dump(hooks, f, indent=2, ensure_ascii=False)
        
    # Save CSV
    with open('viral_hooks.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['id', 'category', 'hook', 'urls', 'placeholders'])
        for h in hooks:
            writer.writerow([
                h['id'],
                h['category'],
                h['hook'],
                '; '.join(h['urls']),
                '; '.join(h['placeholders'])
            ])
            
    print('Generated viral_hooks.json and viral_hooks.csv successfully.')
