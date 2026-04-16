#!/usr/bin/env python3
"""
ייצוא נתוני תלמידים ל-CSV לייבוא ל-Google Sheets המאובטח.

שימוש:
  python scripts/export_students_to_csv.py

פלט:
  _drafts/students-for-sheet.csv  — לייבוא לטאב students
  _drafts/grades-for-sheet.csv    — לייבוא לטאב grades
"""

import json
import csv
import os
import re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ============================================================
# STUDENTS
# ============================================================
def export_students():
    src = os.path.join(BASE, '_drafts', 'students.json')
    dst = os.path.join(BASE, '_drafts', 'students-for-sheet.csv')

    with open(src, 'r', encoding='utf-8') as f:
        raw = json.load(f)

    headers = ['id','last','first','cls','gender','dob','tz','city','street','num','apt','phone','parent1','parent2','megama','regDate','status']

    rows = []
    for s in raw:
        # Convert class format: "ט' 1" → "ט1"
        cls = s.get('class', '')
        cls = cls.replace("' ", '').replace("'", '')

        # Combine parent name + phone
        p1 = ''
        if s.get('p1_name'):
            p1 = s['p1_name']
            if s.get('p1_phone'):
                p1 += ' ' + s['p1_phone']

        p2 = ''
        if s.get('p2_name'):
            p2 = s['p2_name']
            if s.get('p2_phone'):
                p2 += ' ' + s['p2_phone']

        rows.append({
            'id': s.get('num', ''),
            'last': s.get('fam', ''),
            'first': s.get('given', ''),
            'cls': cls,
            'gender': s.get('gender', ''),
            'dob': s.get('birth', ''),
            'tz': s.get('tz', ''),
            'city': s.get('city', ''),
            'street': s.get('street', ''),
            'num': s.get('house', ''),
            'apt': s.get('apt', ''),
            'phone': s.get('student_phone', ''),
            'parent1': p1,
            'parent2': p2,
            'megama': s.get('megama', ''),
            'regDate': s.get('regDate', ''),
            'status': s.get('status', 'active'),
        })

    with open(dst, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)

    print(f'Students: {len(rows)} records -> {dst}')


# ============================================================
# GRADES
# ============================================================
def export_grades():
    src = os.path.join(BASE, 'docs', 'management', 'student-data-extra.js')
    dst = os.path.join(BASE, '_drafts', 'grades-for-sheet.csv')

    with open(src, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract the GRADES object — it's a JS object, parse it as JSON-ish
    # Remove "const GRADES = " prefix and trailing ";"
    content = content.strip()
    if content.startswith('const GRADES ='):
        content = content[len('const GRADES ='):].strip()
    if content.endswith(';'):
        content = content[:-1].strip()

    # Fix JS → JSON: add quotes around keys, handle special chars
    # Since the keys use Hebrew with spaces, they're already quoted
    # The main issue is unquoted property names like cls, avg1, etc.
    # and null values (which are valid JSON)

    # Replace single-line JS object syntax to be JSON-compatible
    # Keys like {cls:"ט1",...} need to become {"cls":"ט1",...}
    # Handle keys without quotes
    content = re.sub(r'(?<=[{,])\s*(\w+)\s*:', r'"\1":', content)

    # Handle escaped quotes in subject names like תנ\"ך
    content = content.replace('\\"', '\u05DA')  # temporary placeholder
    content = content.replace("'", '"')  # shouldn't be any but just in case

    try:
        grades = json.loads(content)
    except json.JSONDecodeError as e:
        print(f'Warning: Could not parse grades JS. Error: {e}')
        print('You may need to manually copy grades data to the Sheet.')
        # Create empty file
        with open(dst, 'w', encoding='utf-8-sig', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['student_key','cls','avg1','avg2','subjects_json'])
        return

    headers = ['student_key','cls','avg1','avg2','subjects_json']
    rows = []
    for key, val in grades.items():
        rows.append({
            'student_key': key,
            'cls': val.get('cls', ''),
            'avg1': val.get('avg1', ''),
            'avg2': val.get('avg2', ''),
            'subjects_json': json.dumps(val.get('subjects', {}), ensure_ascii=False),
        })

    with open(dst, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)

    print(f'Grades: {len(rows)} records -> {dst}')


if __name__ == '__main__':
    export_students()
    export_grades()
    print('\nDone! Import the CSV files into the Google Sheet:')
    print('  1. Open the Sheet "ort-students-secure"')
    print('  2. Tab "students" > File > Import > Upload students-for-sheet.csv')
    print('     Choose: "Replace current sheet", Separator: Comma')
    print('  3. Tab "grades" > File > Import > Upload grades-for-sheet.csv')
    print('     Choose: "Replace current sheet", Separator: Comma')
