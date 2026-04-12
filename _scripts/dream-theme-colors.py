#!/usr/bin/env python3
"""
Dream Theme Colors — Pass 2: Replace hardcoded old colors with Dream Theme equivalents.
"""
import os, glob

MGMT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'docs', 'management')

# Color mappings: old → new
REPLACEMENTS = [
    # Old primary teal → lead (turquoise)
    ('rgba(122,173,173', 'rgba(58,172,160'),
    ('rgba(150,197,197', 'rgba(184,228,222'),   # primary-light
    # Old sage → dream (purple)
    ('rgba(168,181,160', 'rgba(142,126,212'),
    ('rgba(143,163,137', 'rgba(142,126,212'),
    # Old shadow/text brown → new shadow
    ('rgba(74,63,53', 'rgba(44,38,34'),
    # Old accent gold → create
    ('rgba(212,165,116', 'rgba(232,176,96'),
    ('rgba(196,148,74', 'rgba(212,138,44'),
    ('rgba(155,118,83', 'rgba(232,176,96'),
    # Old dusty-rose → spark
    ('rgba(192,96,90', 'rgba(232,144,156'),
    ('rgba(201,160,160', 'rgba(232,144,156'),
    # Old card/bg colors → white
    ('#FFFDF8', '#fff'),
    ('#FFF8F0', '#fff'),
    ('#F5F0E8', '#fff'),
    # Old text colors
    ('#4A3F35', '#2C2622'),
    ('#8B7E74', '#6E6258'),
    # Old border
    ('#E8DDD0', '#EDE6D8'),
    ('#D5CAB8', '#EDE6D8'),
    # Old primary hex → lead
    ('#7AADAD', '#3AACA0'),
    ('#5E9191', '#1B7A6E'),
    ('#96C5C5', '#B8E4DE'),
    # Old sage hex → dream
    ('#A8B5A0', '#8E7ED4'),
    ('#6B7F63', '#5B4BA0'),
    # Old accent hex → create
    ('#D4A574', '#E8B060'),
    ('#B8885A', '#D48A2C'),
    ('#C4944A', '#D48A2C'),
    # Old danger → spark
    ('#C0605A', '#D45C6E'),
    # Old success → keep similar green
    ('#6A9F6A', '#4CAF50'),
    # Old brown gradient colors
    ('#9B7653', 'var(--dream)'),
    ('#B89470', 'var(--create-dark)'),
    ('#7D5E3E', 'var(--lead-dark)'),
]


def convert_file(filepath):
    filename = os.path.basename(filepath)

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    for old, new in REPLACEMENTS:
        content = content.replace(old, new)

    if content == original:
        return None  # no changes

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    changes = sum(1 for old, new in REPLACEMENTS if old in original)
    return changes


def main():
    html_files = sorted(glob.glob(os.path.join(MGMT_DIR, '*.html')))
    print(f"Scanning {len(html_files)} files for hardcoded old colors...\n")

    changed = 0
    for fp in html_files:
        result = convert_file(fp)
        if result:
            print(f"  FIXED: {os.path.basename(fp)} ({result} color patterns)")
            changed += 1

    print(f"\n{'='*50}")
    print(f"Files updated: {changed}")


if __name__ == '__main__':
    main()
