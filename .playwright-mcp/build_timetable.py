import csv, re, sys, os, json
sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)

base = os.path.dirname(os.path.abspath(__file__))
classes = ['ט1','ט2','י1','י2','י3','יא1','יא2','יא3','יב1','יב2','יב3']

def simplify_cell(raw):
    """Convert raw cell text to simplified 'Subject — Teacher' format"""
    if not raw or len(raw.strip()) < 2:
        return ''

    raw = re.sub(r'\s+', ' ', raw).strip()

    # Skip pure annotation rows
    if raw.startswith('פרטני') and 'יעל' in raw:
        return 'פרטני — יעל'
    if raw == 'נהוראי - יעל':
        return 'פרטני — יעל'

    # מגמות
    if raw.startswith('מגמות'):
        return 'מגמות'

    # יום תעסוקה
    if 'יום תעסוקה' in raw or raw == 'תעסוקה':
        return 'יום תעסוקה'

    # מספרה פעילה
    if 'מספרה פעילה' in raw:
        return 'מספרה פעילה'

    # Remove פרטני annotations
    raw = re.sub(r'\s*\.?\s*פרטני\s+[^\s,]+(\s+ו[^\s,]+)*', '', raw)
    raw = re.sub(r'\s*\.?\s*שירלי\s+פרטני', '', raw)

    # Remove room numbers and annotations
    raw = re.sub(r'\s*חדר\s+\d+', '', raw)
    raw = re.sub(r'\s*-\s*\d+\s*', ' ', raw)  # like מריאן -4
    raw = re.sub(r'\s*\d+\s*$', '', raw)  # trailing numbers
    raw = re.sub(r'^\d+\s*', '', raw)  # leading numbers like "1"
    raw = re.sub(r'\s*\*מאיה\*', '', raw)
    raw = re.sub(r'\s*\+\s*חווה\s+אסטרטגיות', '', raw)
    raw = re.sub(r'\s*\+\s*$', '', raw)
    raw = re.sub(r'\s*/\s*$', '', raw)
    raw = re.sub(r'\.\s+', ' ', raw)  # dots between items
    raw = re.sub(r'\s*תלקיט', '', raw)
    raw = re.sub(r'\s*מנו/\s*ר', 'מנו', raw)

    # Remove בת שבע annotations
    raw = re.sub(r'\s*\.?\s*בת שבע[^,]*', '', raw)

    # Clean up multiple spaces
    raw = re.sub(r'\s+', ' ', raw).strip()

    if not raw:
        return ''

    # Known subjects
    subjects = [
        'חינוך פיננסי', 'כישורי חיים', 'חינוך תעבורתי', 'הבעה עברית',
        'אסטרטגיות למידה', 'מדעי הטכנולוגיה', 'מבוא לטכנולוגיה',
        'מרכז למידה', 'חינוך', 'תנ"ך', 'מתמטיקה', 'אזרחות', 'ספרות',
        'עברית', 'היסטוריה', 'אנגלית', 'לשון', 'מעגלים', 'מייקרס',
        'סלטה',
    ]

    for subj in subjects:
        if raw.startswith(subj):
            teacher_part = raw[len(subj):].strip()
            # Clean teacher
            teacher_part = re.sub(r'^[\s\-—:]+', '', teacher_part)
            teacher_part = re.sub(r'\s*\(.*?\)', '', teacher_part)
            teacher_part = re.sub(r'\s*[\.,]\s*$', '', teacher_part)
            # Remove room/extra
            teacher_part = re.sub(r'\s*יהודית\s*\d*', ' ויהודית', teacher_part)
            teacher_part = teacher_part.replace('  ויהודית', ' ויהודית')
            teacher_part = re.sub(r'\s+', ' ', teacher_part).strip()
            teacher_part = re.sub(r'^ו', '', teacher_part).strip()
            if teacher_part:
                return f'{subj} — {teacher_part}'
            return subj

    # If no known subject found, it might be just a teacher name
    known_teachers = ['משה','אפרת','אופירה','אושר','פרלה','יעקב','נעמה','גיא',
                      'רעיה','מירב','מריאן','יהודית','רווית','ויקי','מנו','יוסי',
                      'יואב','מלי','ליאת','דורית','יעל','צהי','אליאל','שירלי',
                      'שחר','שמעון','אביעד','מאיה','אלה','שי','שמוליק']

    for t in known_teachers:
        if raw == t:
            return raw  # Just teacher name, leave as-is

    # Unknown format - return cleaned up
    return raw


def parse_day(filepath, day_name):
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        rows = list(reader)

    if not rows:
        return {}

    header = rows[0]

    # Find class column indices
    class_cols = {}
    for i, cell in enumerate(header):
        cell = cell.strip()
        if cell in classes:
            class_cols[cell] = i
        elif cell == 'יא-יב':
            class_cols['יא-יב'] = i

    # Special case: שני has ט1 data in column 0 but no header
    if 'ט1' not in class_cols and day_name == 'sheni':
        class_cols['ט1'] = 0

    # Find data rows by time pattern
    time_pattern = re.compile(r'\d+[\.:]\d+\s*-\s*\d+[\.:]\d+')

    day_data = {}
    lesson_num = 0

    for row in rows[1:]:
        # Find time in any of the first 3 columns
        has_time = False
        for ci in range(min(3, len(row))):
            if time_pattern.search(row[ci].strip()):
                has_time = True
                break

        # For sheni, rows don't have time - count non-empty first-column rows
        if not has_time and day_name == 'sheni':
            if len(row) > 0 and row[0].strip() and len(row[0].strip()) > 1:
                # Check if this is a data row (not empty/header)
                has_time = True

        if not has_time:
            continue

        lesson_num += 1
        if lesson_num > 7:
            break

        for cls_name, col_idx in class_cols.items():
            if cls_name == 'יא-יב':
                continue  # handle separately
            if col_idx < len(row):
                raw = row[col_idx].strip()
                simplified = simplify_cell(raw)
                if simplified:
                    if cls_name not in day_data:
                        day_data[cls_name] = {}
                    day_data[cls_name][str(lesson_num)] = simplified

    # Ensure all classes exist
    for cls in classes:
        if cls not in day_data:
            day_data[cls] = {}

    return day_data


# Parse all days
days_config = [
    ('ראשון', 'rishon', 'rishon.csv'),
    ('שני', 'sheni', 'sheni.csv'),
    ('שלישי', 'shlishi', 'shlishi.csv'),
    ('רביעי', 'revii', 'revii.csv'),
    ('חמישי', 'hamishi', 'hamishi.csv'),
]

full_timetable = {}

for day_heb, day_eng, fname in days_config:
    fpath = os.path.join(base, fname)
    print(f'\n=== {day_heb} ({day_eng}) ===')
    data = parse_day(fpath, day_eng)
    full_timetable[day_heb] = data

    for cls in classes:
        lessons = data.get(cls, {})
        if lessons:
            items = ', '.join([f'{k}:{v}' for k,v in sorted(lessons.items())])
            print(f'  {cls}: {items}')

# Output as JS
print('\n\n// ============ JAVASCRIPT OUTPUT ============')
print('const TIMETABLE = {')
for day_heb in ['ראשון','שני','שלישי','רביעי','חמישי']:
    print(f"  '{day_heb}': {{")
    for cls in classes:
        lessons = full_timetable[day_heb].get(cls, {})
        if lessons:
            items = ','.join([f"'{k}':'{v}'" for k,v in sorted(lessons.items(), key=lambda x: int(x[0]))])
            print(f"    '{cls}': {{{items}}},")
        else:
            print(f"    '{cls}': {{}},")
    print('  },')
print('};')
