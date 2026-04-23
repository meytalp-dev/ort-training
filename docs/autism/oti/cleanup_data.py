"""
ניקוי נתונים שנמצאו בבדיקת מוצר:
1. מילוי service_group ל-426 רשומות חסרות (לפי קטגוריה)
2. נרמול url_status (null → "")
3. הסרת רעש (מוצרי צריכה, אנשים פרטיים בלי קשר)
4. הגדרה מחודשת של ביטחון (high רק אם טלפון+URL אומתו)
"""
import json
import re
from pathlib import Path

BASE = Path(__file__).parent / 'data'
IN = BASE / 'all-enriched.json'
OUT = BASE / 'all-enriched.json'

# מיפוי קטגוריה → service_group (כל קטגוריה מסווגת לקבוצת-על)
CAT_TO_GROUP = {
    'טיפולים ומטפלים': 'therapy',
    'אבחון והערכה': 'therapy',
    'מסגרות חינוך': 'education',
    'זכויות ורווחה': 'rights',
    'ארגונים ועמותות': 'organization',
    'שירותים לבוגרים': 'adult',
    'קייטנות ופנאי': 'leisure',
    'ציוד ועזרים': 'equipment',
}

# דפוסי רעש להסרה אוטומטית
NOISE_PATTERNS = [
    r'^סבון\s',
    r'^שמפו\s',
    r'^קרם\s',
    r'^משחת\s',
    r'^בושם\s',
    r'^מוצר\s',
    r'^תכשיר\s',
]

def is_noise(r):
    name = r.get('שם', '') or ''
    for pat in NOISE_PATTERNS:
        if re.match(pat, name):
            return True
    # גם: רשומות בלי כל פרטי קשר, בלי ציטוט מהצ'אט, בלי הערות (רשומה ריקה)
    no_phone = not (r.get('טלפון') or '').strip()
    no_url = not (r.get('אתר') or '').strip()
    no_notes = not (r.get('הערות') or '').strip()
    no_quote = not (r.get('הקשר/ציטוט') or '').strip()
    no_specialty = not (r.get('התמחות') or '').strip()
    if no_phone and no_url and no_notes and no_quote and no_specialty:
        return True
    return False


def recompute_confidence(r):
    """הגדרה קפדנית של ביטחון:
    - high: URL אומת כעובד (url_status=ok) + יש טלפון. אחרת, רק אם מקור רשמי (official) עם URL אומת.
    - medium: יש פרטי קשר, אבל URL לא אומת או חסר אחד מהם.
    - low: אין פרטי קשר כלל.
    """
    has_phone = bool((r.get('טלפון') or '').strip())
    has_url = bool((r.get('אתר') or '').strip())
    url_ok = r.get('url_status') == 'ok'
    src = r.get('source_type', 'chat')

    # high — רק עם URL אומת + טלפון (או מקור רשמי עם URL אומת)
    if url_ok and has_phone:
        return 'high'
    if src == 'official' and url_ok:
        return 'high'

    # medium — יש פרטי קשר (טלפון או URL)
    if has_phone or has_url:
        return 'medium'

    return 'low'


def main():
    data = json.load(open(IN, encoding='utf-8'))
    original = len(data)

    # שלב 1: הסרת רעש
    clean = [r for r in data if not is_noise(r)]
    removed = original - len(clean)

    # שלב 2: נרמול url_status (ערכים משמעותיים במקום מחרוזת ריקה)
    for r in clean:
        s = r.get('url_status')
        has_url = bool((r.get('אתר') or '').strip())
        if s in (None, ''):
            r['url_status'] = 'not-checked' if has_url else 'no-url'
        if r.get('url_details') is None:
            r['url_details'] = []

    # שלב 3: מילוי service_group לכל הרשומות
    # שמירה על therapy/medical/both שכבר מתויגות מ-merge_research.py (לא לדרוס)
    filled = 0
    for r in clean:
        g = r.get('service_group')
        if g in ('therapy', 'medical', 'both'):
            continue  # already classified by profession detection
        cat = r.get('קטגוריה', '')
        new_g = CAT_TO_GROUP.get(cat, 'other')
        if new_g != g:
            r['service_group'] = new_g
            filled += 1

    # שלב 4: חישוב מחדש של ביטחון
    conf_changed = 0
    for r in clean:
        old = r.get('ביטחון', 'medium')
        new = recompute_confidence(r)
        if old != new:
            conf_changed += 1
            r['ביטחון'] = new

    # שלב 5: סטטיסטיקות
    from collections import Counter
    groups = Counter(r.get('service_group') for r in clean)
    conf = Counter(r.get('ביטחון') for r in clean)
    url = Counter(r.get('url_status') for r in clean)

    print(f'Original:  {original}')
    print(f'After clean: {len(clean)} (removed {removed} noise)')
    print(f'service_group filled: {filled}')
    print(f'confidence recomputed: {conf_changed}')
    print()
    print(f'service_group: {dict(groups)}')
    print(f'ביטחון:        {dict(conf)}')
    print(f'url_status:    {dict(url)}')

    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(clean, f, ensure_ascii=False, indent=1)
    print(f'\nSaved: {OUT}')

if __name__ == '__main__':
    main()
