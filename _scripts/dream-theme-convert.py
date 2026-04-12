#!/usr/bin/env python3
"""
Dream Theme Converter — converts old-style management HTML files to Dream Theme.
"""
import re, os, glob

MGMT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'docs', 'management')

# Files already using Dream Theme — skip them
SKIP_FILES = {
    'index.html', 'layer-meetings.html', 'planning-form.html',
    'bnot-attendance-form.html', 'shiluv-dashboard.html',
    'ravit.html', 'timetable.html'
}

# Standard Dream Theme font import
DREAM_FONT_LINK = '<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&family=Playpen+Sans+Hebrew:wght@400;500;600;700;800&display=swap" rel="stylesheet">'

# Dream Theme :root variables (base)
DREAM_ROOT = """  /* Dream Theme — לחלום.ליצור.להוביל */
  --dream:#8E7ED4;--dream-light:#D4CEF0;--dream-dark:#5B4BA0;
  --create:#E8B060;--create-light:#F5DEB0;--create-dark:#D48A2C;
  --lead:#3AACA0;--lead-light:#B8E4DE;--lead-dark:#1B7A6E;
  --spark:#E8909C;--spark-dark:#D45C6E;
  --bg:#fff;--bg-alt:#FAFBFC;--card:#fff;
  --text:#2C2622;--text-light:#6E6258;--text-lighter:#8C7E72;--muted:#6E6258;
  --border:#EDE6D8;--border-light:#F5F0E8;
  --primary:#3AACA0;--primary-dark:#1B7A6E;--primary-light:#B8E4DE;
  --accent:#E8B060;--accent-dark:#D48A2C;
  --success:#4CAF50;--success-bg:#E8F5E9;--warn:#E8B060;--warn-bg:#FFF3E0;
  --danger:#D45C6E;--danger-bg:#FCE7EA;--info:#5B9BD5;--info-bg:#E6F0FA;
  --radius:16px;--radius-lg:24px;
  --shadow:0 2px 8px rgba(44,38,34,.05);--shadow-sm:0 2px 8px rgba(44,38,34,.05);
  --shadow-md:0 6px 20px rgba(44,38,34,.08);--shadow-lg:0 12px 40px rgba(44,38,34,.1);"""

# Dream body::before (radial gradients)
DREAM_BODY_BEFORE = """body::before{content:'';position:fixed;inset:0;
  background:
    radial-gradient(ellipse 500px 400px at 15% 25%,rgba(142,126,212,.04) 0%,transparent 70%),
    radial-gradient(ellipse 400px 350px at 85% 60%,rgba(232,176,96,.04) 0%,transparent 70%),
    radial-gradient(ellipse 450px 350px at 50% 85%,rgba(58,172,160,.03) 0%,transparent 70%);
  pointer-events:none;z-index:0}"""

# Dream header gradient
DREAM_HEADER_GRADIENT = "background:linear-gradient(90deg,var(--dream),var(--create-dark),var(--lead-dark))"


def extract_custom_vars(root_block):
    """Extract file-specific CSS variables that should be preserved."""
    custom_lines = []
    # Patterns for custom vars we want to keep
    keep_patterns = [
        r'--dim-\w+',      # dimension colors (five-dimensions)
        r'--sage',          # special colors
        r'--dusty-rose',
        r'--warm-gold',
        r'--conv-\w+',      # conversation colors
        r'--pulse-\w+',     # pulse colors
        r'--tab-\w+',       # tab colors
    ]

    for line in root_block.split('\n'):
        line_stripped = line.strip()
        if not line_stripped or line_stripped == '}' or line_stripped.startswith(':root'):
            continue
        # Check if this line has custom vars worth keeping
        for pat in keep_patterns:
            if re.search(pat, line_stripped):
                custom_lines.append('  ' + line_stripped)
                break

    return '\n'.join(custom_lines)


def convert_file(filepath):
    """Convert a single HTML file to Dream Theme."""
    filename = os.path.basename(filepath)
    if filename in SKIP_FILES:
        return f"SKIP: {filename} (already Dream Theme)"

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if already converted
    if '--dream:#8E7ED4' in content:
        return f"SKIP: {filename} (already has Dream vars)"

    original = content

    # 1. Replace/add font import
    # Remove @font-face blocks for Shuneet3
    content = re.sub(
        r"@font-face\{font-family:'Shuneet3[^}]+\}",
        '', content
    )
    content = re.sub(
        r"@font-face\s*\{[^}]*Shuneet3[^}]*\}",
        '', content
    )

    # Replace Google Fonts link
    content = re.sub(
        r'<link\s+href="https://fonts\.googleapis\.com/css2\?family=[^"]*"\s+rel="stylesheet">',
        DREAM_FONT_LINK,
        content
    )

    # If no Google Fonts link found, add one after preconnect or after viewport meta
    if 'fonts.googleapis.com/css2' not in content:
        if '<link rel="preconnect"' in content:
            content = re.sub(
                r'(<link rel="preconnect"[^>]*>\s*(?:<link[^>]*crossorigin[^>]*>\s*)?)',
                r'\1' + DREAM_FONT_LINK + '\n',
                content, count=1
            )
        else:
            content = content.replace(
                '<style>',
                DREAM_FONT_LINK + '\n<style>',
                1
            )

    # 2. Replace :root block
    root_match = re.search(r':root\s*\{([^}]+)\}', content, re.DOTALL)
    if root_match:
        old_root = root_match.group(1)
        custom_vars = extract_custom_vars(old_root)
        new_root = DREAM_ROOT
        if custom_vars:
            new_root += '\n' + custom_vars
        content = content[:root_match.start()] + ':root{\n' + new_root + '\n}' + content[root_match.end():]

    # 3. Replace body font-family
    # Various patterns
    content = re.sub(
        r"body\{font-family:'Shuneet3[^;]+;",
        "body{font-family:'Heebo',sans-serif;",
        content
    )
    content = re.sub(
        r"body\{font-family:'Assistant[^;]+;",
        "body{font-family:'Heebo',sans-serif;",
        content
    )

    # Replace body background
    content = re.sub(
        r"(body\{[^}]*?)background:\s*var\(--bg\)",
        r"\1background:#fff",
        content
    )
    content = re.sub(
        r"(body\{[^}]*?)background:\s*#F5F0E8",
        r"\1background:#fff",
        content
    )
    content = re.sub(
        r"(body\{[^}]*?)background:\s*#F0F4F8",
        r"\1background:#fff",
        content
    )
    content = re.sub(
        r"(body\{[^}]*?)background:\s*#FBFAF7",
        r"\1background:#fff",
        content
    )

    # 4. Replace heading font-family
    # Replace Shuneet3 Bold headings
    content = re.sub(
        r"(h[1-6][^{]*\{[^}]*?)font-family:'Shuneet3 Bold','Shuneet3',Heebo,sans-serif",
        r"\1font-family:'Playpen Sans Hebrew','Heebo',sans-serif",
        content
    )
    content = re.sub(
        r"(h[1-6][^{]*\{[^}]*?)font-family:'Shuneet3 Bold','Shuneet3',sans-serif",
        r"\1font-family:'Playpen Sans Hebrew','Heebo',sans-serif",
        content
    )
    # Generic heading font replacement
    content = re.sub(
        r"h1,h2,h3,h4\{font-family:'Shuneet3 Bold','Shuneet3',Heebo,sans-serif\}",
        "h1,h2,h3,h4,h5,h6{font-family:'Playpen Sans Hebrew','Heebo',sans-serif;font-weight:700}",
        content
    )
    content = re.sub(
        r"h1,h2,h3,h4\{font-family:'Shuneet3 Bold','Shuneet3',sans-serif\}",
        "h1,h2,h3,h4,h5,h6{font-family:'Playpen Sans Hebrew','Heebo',sans-serif;font-weight:700}",
        content
    )

    # If no heading font rule exists, add one after body rule
    if "'Playpen Sans Hebrew'" not in content and 'Playpen Sans Hebrew' in content.split('<style>')[0] if '<style>' in content else False:
        pass  # Font is imported but not used in headings

    # Add Playpen to headings if not already there
    if "font-family:'Playpen Sans Hebrew'" not in content:
        # Add after body{...} rule
        body_match = re.search(r'(body\{[^}]+\})', content)
        if body_match:
            insert_pos = body_match.end()
            heading_rule = "\nh1,h2,h3,h4,h5,h6,.card-title,.section-title,.header-title{font-family:'Playpen Sans Hebrew','Heebo',sans-serif;font-weight:700}"
            content = content[:insert_pos] + heading_rule + content[insert_pos:]

    # 5. Replace body::before (old gradient/dot patterns → Dream radials)
    # Remove old body::before
    content = re.sub(
        r"body::before\{[^}]+\}",
        DREAM_BODY_BEFORE,
        content, count=1
    )

    # If no body::before existed, add after heading rule
    if 'body::before' not in content:
        # Find a good insertion point — after body rule or heading rule
        insert_after = re.search(r'(h[1-6][^{]*\{[^}]+\})', content)
        if insert_after:
            pos = insert_after.end()
            content = content[:pos] + '\n' + DREAM_BODY_BEFORE + content[pos:]

    # 6. Remove body::after (dot pattern)
    content = re.sub(
        r"body::after\{[^}]+background-image:radial-gradient\(circle,rgba\(74,63,53[^}]+\}",
        "",
        content
    )
    # Generic body::after dot pattern
    content = re.sub(
        r"body::after\{[^}]*background-size:\s*24px\s+24px[^}]*\}",
        "",
        content
    )

    # 7. Replace header gradient
    # Old gradients: --success,--warn,--info,--danger or --primary,--accent,--secondary
    content = re.sub(
        r"background:linear-gradient\(90deg,var\(--success\),var\(--warn\),var\(--info\),var\(--danger\)\)",
        DREAM_HEADER_GRADIENT,
        content
    )
    content = re.sub(
        r"background:linear-gradient\(90deg,var\(--primary\),var\(--accent\)[^)]*\)",
        DREAM_HEADER_GRADIENT,
        content
    )
    content = re.sub(
        r"background:linear-gradient\(90deg,#[0-9a-fA-F]+,#[0-9a-fA-F]+,#[0-9a-fA-F]+(?:,#[0-9a-fA-F]+)?\)",
        DREAM_HEADER_GRADIENT,
        content
    )

    # 8. Replace header background (cream gradients → white)
    content = re.sub(
        r"\.header\{background:linear-gradient\(180deg,rgba\(122,173,173,[^)]+\)[^;]+;",
        ".header{background:#fff;",
        content
    )

    # 9. Fix any remaining Shuneet3 references in inline styles
    content = content.replace("font-family:'Shuneet3 Bold','Shuneet3',Heebo,sans-serif", "font-family:'Playpen Sans Hebrew','Heebo',sans-serif")
    content = content.replace("font-family:'Shuneet3',Heebo,sans-serif", "font-family:'Heebo',sans-serif")
    content = content.replace("font-family:'Shuneet3 Bold','Shuneet3',sans-serif", "font-family:'Playpen Sans Hebrew','Heebo',sans-serif")
    content = content.replace("font-family:'Shuneet3',Rubik,Heebo,sans-serif", "font-family:'Heebo',sans-serif")
    content = content.replace("font-family:'Shuneet3',sans-serif", "font-family:'Heebo',sans-serif")
    content = content.replace("font-family:Shuneet3,Heebo,sans-serif", "font-family:'Heebo',sans-serif")

    # Replace Assistant font references
    content = content.replace("font-family:'Assistant','Playpen Sans Hebrew',sans-serif", "font-family:'Heebo',sans-serif")
    content = content.replace("font-family:Assistant,sans-serif", "font-family:'Heebo',sans-serif")
    content = content.replace("font-family:'Assistant',sans-serif", "font-family:'Heebo',sans-serif")

    # 10. Clean up multiple blank lines
    content = re.sub(r'\n{3,}', '\n\n', content)

    if content == original:
        return f"SKIP: {filename} (no changes needed)"

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    return f"DONE: {filename}"


def main():
    html_files = sorted(glob.glob(os.path.join(MGMT_DIR, '*.html')))
    print(f"Found {len(html_files)} HTML files in management/\n")

    results = {'done': [], 'skip': [], 'error': []}

    for fp in html_files:
        try:
            result = convert_file(fp)
            print(result)
            if result.startswith('DONE'):
                results['done'].append(os.path.basename(fp))
            else:
                results['skip'].append(os.path.basename(fp))
        except Exception as e:
            msg = f"ERROR: {os.path.basename(fp)} — {e}"
            print(msg)
            results['error'].append(os.path.basename(fp))

    print(f"\n{'='*50}")
    print(f"Converted: {len(results['done'])}")
    print(f"Skipped:   {len(results['skip'])}")
    print(f"Errors:    {len(results['error'])}")
    if results['error']:
        print(f"Error files: {', '.join(results['error'])}")


if __name__ == '__main__':
    main()
