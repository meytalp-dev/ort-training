import csv, re, sys, os
sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)

days_files = [
    ('rishon', 'rishon.csv'),
    ('sheni', 'sheni.csv'),
    ('shlishi', 'shlishi.csv'),
    ('revii', 'revii.csv'),
    ('hamishi', 'hamishi.csv'),
]

classes = ['ט1','ט2','י1','י2','י3','יא1','יא2','יא3','יב1','יב2','יב3']
base = os.path.dirname(os.path.abspath(__file__))

def parse_sheet(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        rows = list(reader)

    if not rows:
        return

    header = rows[0]
    class_cols = {}
    for i, cell in enumerate(header):
        cell = cell.strip()
        if cell in classes:
            class_cols[cell] = i
        elif cell == 'יא-יב':
            class_cols['יא-יב'] = i

    print(f'  Columns: {class_cols}')

    time_pattern = re.compile(r'\d+[\.:]\d+\s*-\s*\d+[\.:]\d+')
    lesson_num = 0

    for row_idx, row in enumerate(rows[1:], 1):
        time_cell = ''
        for ci in range(min(3, len(row))):
            if time_pattern.search(row[ci].strip()):
                time_cell = row[ci].strip()
                break

        if not time_cell:
            continue

        lesson_num += 1
        time_match = time_pattern.search(time_cell)
        time_str = time_match.group(0) if time_match else time_cell

        print(f'  L{lesson_num} ({time_str}):')

        all_classes = list(class_cols.keys())
        for cls_name in all_classes:
            col_idx = class_cols[cls_name]
            if col_idx < len(row):
                val = row[col_idx].strip()
                val = re.sub(r'\s+', ' ', val)
                if val and len(val) > 1:
                    if len(val) > 120:
                        val = val[:120] + '...'
                    print(f'    {cls_name}: {val}')

for day, fname in days_files:
    print(f'\n=== {day} ===')
    fpath = os.path.join(base, fname)
    try:
        parse_sheet(fpath)
    except Exception as e:
        print(f'  ERROR: {e}')
