#!/usr/bin/env python3
"""
Migration script: replace student-data.js references with secure API.

After deploying the Apps Script, run:
  python scripts/migrate_student_data.py YOUR_APPS_SCRIPT_URL

This will:
1. Update all 14 HTML files to load from the API instead of static JS
2. Rename old student-data.js to student-data.js.backup
3. Same for student-data-extra.js
"""

import sys
import os
import re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MGMT = os.path.join(BASE, 'docs', 'management')

def main():
    if len(sys.argv) < 2:
        print('Usage: python scripts/migrate_student_data.py APPS_SCRIPT_URL')
        print('')
        print('Example:')
        print('  python scripts/migrate_student_data.py "https://script.google.com/macros/s/AKfycbw.../exec"')
        sys.exit(1)

    api_url = sys.argv[1].strip().rstrip('/')

    # Validate URL
    if not api_url.startswith('https://script.google.com/'):
        print(f'WARNING: URL does not look like a Google Apps Script URL: {api_url}')
        resp = input('Continue anyway? (y/n): ')
        if resp.lower() != 'y':
            sys.exit(0)

    # Find all HTML files that reference student-data.js
    updated = 0
    for fname in os.listdir(MGMT):
        if not fname.endswith('.html'):
            continue
        fpath = os.path.join(MGMT, fname)
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()

        original = content

        # Replace student-data.js -> API with action=students-js
        content = re.sub(
            r'<script\s+src\s*=\s*"student-data\.js"\s*>\s*</script>',
            f'<script src="{api_url}?action=students-js"></script>',
            content
        )

        # Replace student-data-extra.js -> API with action=grades-js
        content = re.sub(
            r'<script\s+src\s*=\s*"student-data-extra\.js"\s*>\s*</script>',
            f'<script src="{api_url}?action=grades-js"></script>',
            content
        )

        if content != original:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(content)
            updated += 1
            print(f'  Updated: {fname}')

    print(f'\n{updated} files updated.')

    # Backup old files
    old_data = os.path.join(MGMT, 'student-data.js')
    old_extra = os.path.join(MGMT, 'student-data-extra.js')

    if os.path.exists(old_data):
        backup = old_data + '.backup'
        os.rename(old_data, backup)
        print(f'\n  Backed up: student-data.js -> student-data.js.backup')

    if os.path.exists(old_extra):
        backup = old_extra + '.backup'
        os.rename(old_extra, backup)
        print(f'  Backed up: student-data-extra.js -> student-data-extra.js.backup')

    print(f'\nDone! Test the systems to make sure everything works.')
    print(f'If something breaks, restore from .backup files.')
    print(f'\nAfter verifying everything works:')
    print(f'  - Delete student-data.js.backup')
    print(f'  - Delete student-data-extra.js.backup')
    print(f'  - Delete _drafts/students.json')
    print(f'  - git add + commit + push')


if __name__ == '__main__':
    main()
