"""
ממזג igm + itu + shatil ל-jobs.json אחיד — רק משרות הוראה (מורים בלבד).
"""
import json, re, hashlib
from pathlib import Path

ROOT = Path(__file__).parent
RAW = ROOT / 'raw'
OUT = ROOT / 'jobs.json'


def load(name):
    with open(RAW / name, 'r', encoding='utf-8') as f:
        return json.load(f)


# ─── מיפוי אזורים אחיד ─────────────────────────────────────────────
REGION_NORMALIZE = {
    'ירושלים והסביבה': 'ירושלים',
    'אזור ירושלים':    'ירושלים',
    'מחוז ירושלים':    'ירושלים',
    'מרכז':            'מרכז',
    'אזור ת"א והמרכז': 'מרכז',
    'אזור השרון והמשולש': 'מרכז',
    'מחוז ת"א':        'מרכז',
    'מחוז מרכז':       'מרכז',
    'אזור השפלה':      'שפלה',
    'אזור הצפון':      'צפון',
    'מחוז צפון':       'צפון',
    'אזור חיפה':       'צפון',
    'מחוז חיפה':       'צפון',
    'אזור הדרום':      'דרום',
    'מחוז דרום':       'דרום',
    'ארצי':            'ארצי',
    'אינטרנט':         'מקוון',
    'בין לאומי':       'חו"ל',
}


# ─── מילון ערים → אזור (לחילוץ city מטקסט) ──────────────────────
CITIES = {
    'ירושלים': 'ירושלים', 'מבשרת ציון': 'ירושלים', 'בית שמש': 'שפלה',
    'תל אביב': 'מרכז', 'תל-אביב': 'מרכז', 'ת"א': 'מרכז', 'ת״א': 'מרכז',
    'יפו': 'מרכז', 'רמת גן': 'מרכז', 'גבעתיים': 'מרכז', 'בני ברק': 'מרכז',
    'הרצליה': 'מרכז', 'רעננה': 'מרכז', 'כפר סבא': 'מרכז', 'הוד השרון': 'מרכז',
    'רמת השרון': 'מרכז', 'פתח תקווה': 'מרכז', 'פתח-תקווה': 'מרכז', 'פ"ת': 'מרכז',
    'ראשון לציון': 'מרכז', 'ראשל"צ': 'מרכז', 'חולון': 'מרכז', 'בת ים': 'מרכז',
    'נתניה': 'מרכז', 'רחובות': 'מרכז', 'נס ציונה': 'מרכז', 'יבנה': 'מרכז',
    'ראש העין': 'מרכז', 'יהוד': 'מרכז', 'אור יהודה': 'מרכז', 'גני תקווה': 'מרכז',
    'אזור': 'מרכז', 'מודיעין': 'שפלה', 'שוהם': 'מרכז', 'חריש': 'מרכז',
    'כפר אורנים': 'מרכז',
    'אשדוד': 'דרום', 'אשקלון': 'דרום', 'באר שבע': 'דרום', 'באר-שבע': 'דרום',
    'דימונה': 'דרום', 'אילת': 'דרום', 'נתיבות': 'דרום', 'אופקים': 'דרום',
    'שדרות': 'דרום', 'גן יבנה': 'דרום', 'קרית גת': 'דרום', 'קריית גת': 'דרום',
    'מצפה רמון': 'דרום', 'ערד': 'דרום', 'ירוחם': 'דרום',
    'חיפה': 'צפון', 'נצרת': 'צפון', 'נצרת עילית': 'צפון', 'נוף הגליל': 'צפון',
    'עכו': 'צפון', 'נהריה': 'צפון', 'קרית ביאליק': 'צפון', 'קרית ים': 'צפון',
    'קרית מוצקין': 'צפון', 'קרית אתא': 'צפון', 'קרית טבעון': 'צפון',
    'טבריה': 'צפון', 'צפת': 'צפון', 'כרמיאל': 'צפון', 'מגדל העמק': 'צפון',
    'עפולה': 'צפון', 'יקנעם': 'צפון', 'בית שאן': 'צפון', 'זכרון יעקב': 'צפון',
    'חדרה': 'צפון', 'פרדס חנה': 'צפון', 'בנימינה': 'צפון', 'גבעת עדה': 'צפון',
    'קרית שמואל': 'צפון',
    'לוד': 'שפלה', 'רמלה': 'שפלה', 'גדרה': 'שפלה', 'גן רווה': 'שפלה',
    'באר יעקב': 'שפלה', 'מטה יהודה': 'ירושלים', 'בית אריה': 'שפלה',
    'מודיעין מכבים רעות': 'שפלה',
}


def find_city(text):
    """מחפש את העיר הראשונה שמוזכרת בטקסט מתוך מילון הערים."""
    if not text:
        return ''
    # סדר לפי אורך כדי שערים מורכבות (כמו "תל אביב") יזוהו לפני קצרות
    for city in sorted(CITIES.keys(), key=len, reverse=True):
        if re.search(r'(?<![א-ת])' + re.escape(city) + r'(?![א-ת])', text):
            return city
    return ''


def norm_region(s):
    if not s:
        return ''
    parts = [p.strip() for p in s.split(',')]
    for p in parts:
        if p in REGION_NORMALIZE:
            return REGION_NORMALIZE[p]
    return parts[0] if parts else ''


def strip_html(s):
    if not s:
        return ''
    s = re.sub(r'<br\s*/?>', '\n', s, flags=re.I)
    s = re.sub(r'<[^>]+>', '', s)
    return s.strip()


def parse_contact_block(s):
    out = {'contact_name': '', 'email': '', 'phone': ''}
    if not s:
        return out
    txt = strip_html(s)
    m = re.search(r'איש\s+קשר\s*:\s*([^\n]+)', txt)
    if m: out['contact_name'] = m.group(1).strip()
    m = re.search(r'דוא[״"]?ל\s*:\s*([^\s\n]+)', txt)
    if m: out['email'] = m.group(1).strip()
    m = re.search(r'טלפון\s*:\s*([\d\-\s]+)', txt)
    if m: out['phone'] = re.sub(r'\s+', '', m.group(1).strip())
    return out


def derive_role(text, profession=''):
    t = (text or '') + ' ' + (profession or '')
    if re.search(r'מנהל[ת]?\s+(בית\s+ספר|תיכון|ביה"ס)', t): return 'מנהל/ת'
    if re.search(r'\bסגן\s+מנהל|סגנית\s+מנהלת', t): return 'סגן/ית'
    if re.search(r'\bרכז[ת]?\b', t) and not re.search(r'מרכז', t): return 'רכז/ת'
    if re.search(r'\bמחנכ[ת]?\b', t): return 'מחנך/ת'
    if re.search(r'\bיועצ[תת]?\b|יועצ/ת', t): return 'יועץ/ת'
    if re.search(r'\bמטפל[ת]?\b|תרפיסט', t): return 'מטפל/ת'
    if re.search(r'\bסייע[ת]?\b|תומכ[ת]?\s+הוראה', t): return 'סייע/ת'
    if re.search(r'\bמדריכ[הת]?\b', t): return 'מדריך/ה'
    if re.search(r'\bמורה\b|\bמורות?\b|\bמורים\b', t): return 'מורה'
    return 'אחר'


# ─── פילטר מורים בלבד ──────────────────────────────────────────────
# נשמרים: מורה, מחנך/ת, רכזת מקצוע, "דרוש/ה מורה ל..."
# נפסלים: צהרון/מועדונית, מטפל/ת לבדו, מדריך לא-פדגוגי, ניהול/אדמין
EXCLUDE_PATTERNS = [
    r'\bצהרון',
    r'מועדונית',
    r'מועדוני\s+נוער',
    r'\bפנימייה\b',
    r'תרפיסט',
    r'קלינאי\s+תקשורת',
    r'פיזיותרפיסט',
    r'מרפא[הת]?\s+בעיסוק',
    r'ראש\s+צוות',
    r'אוצר[ת]?\s+וגלריה|אוצר[ת]?\s+ומנהל',
    r'מתאמ[ת]?\s+טיפול',
    r'דיור\s+מוגן',
    r'מרכז\s+חירום',
    r'תכנית\s+\"עמיתים',
    r'דרוש[/.ה]*\s*רכז[ת]?\.?ת?\s+עיר',
    r'תנועת\s+נוער',
    r'מועדון\s+ל',
    r'אנשים\s+עם\s+מוגבלות',
    r'אנשים\s+עם\s+צרכים\s+מיוחדים',
    r'מנכ"ל',
    r'מתאם[ת]?\s+',
]

INCLUDE_TEACHER_PATTERNS = [
    r'\bמורה\s+ל',
    r'\bמורים\b',
    r'\bמורות\b',
    r'דרוש[ה/]*\s+מור[הת]\b',
    r'דרושים?\s+מורים',
    r'\bמחנכ[ת]?\b',
    r'\bמורה\b',
    r'תעודת\s+הוראה',
    r'מקצועי[ת/]?\s+ל(אנגלית|מתמטיקה|עברית|תנ"ך|היסטוריה|ספרות|פיזיקה|כימיה|ביולוגיה|מדעים|חינוך\s+גופני|אומנות|מוסיקה|ערבית)',
    r'\bמדריך\s+פדגוגי',
    r'\bמדריכה\s+פדגוגית',
]


def is_teacher_job(title, description, role_hint=''):
    """מחזיר True רק אם זו משרת מורה אמיתית."""
    text = (title or '') + ' ' + (description or '') + ' ' + (role_hint or '')

    # החרגות חזקות
    for pat in EXCLUDE_PATTERNS:
        if re.search(pat, text):
            # עדיין שמור אם בכותרת יש "מורה ל..."
            if not re.search(r'\bמורה\s+ל', title or ''):
                return False

    # חייב להכיל סימן של הוראה
    for pat in INCLUDE_TEACHER_PATTERNS:
        if re.search(pat, text):
            return True
    return False


def make_id(source, sid_or_url):
    return f"{source}-{sid_or_url}" if isinstance(sid_or_url, (int, str)) else \
           f"{source}-{hashlib.sha1(str(sid_or_url).encode()).hexdigest()[:10]}"


def iso_date_dmy(s):
    m = re.match(r'(\d{2})/(\d{2})/(\d{4})', s or '')
    return f"{m.group(3)}-{m.group(2)}-{m.group(1)}" if m else ''


def iso_date_dotted(s):
    m = re.match(r'(\d{1,2})\.(\d{1,2})\.(\d{4})', s or '')
    return f"{m.group(3)}-{int(m.group(2)):02d}-{int(m.group(1)):02d}" if m else ''


# ─── igm: ארגון המורים ─────────────────────────────────────────────
def transform_igm(raw):
    out = []
    for j in raw['jobs']:
        contact = parse_contact_block(j.get('contact', ''))
        info = strip_html(j.get('info', ''))
        title = strip_html(j.get('title', '')) or 'משרת הוראה'
        subject = strip_html(j.get('subject', ''))
        scope = strip_html(j.get('job_length', ''))
        full_title = f"{subject} · {title}" if subject and title else (subject or title)

        if not is_teacher_job(full_title, info, subject):
            continue

        out.append({
            'id': make_id('igm', j.get('id')),
            'source': 'igm',
            'source_name': 'ארגון המורים',
            'school': title,
            'title': full_title,
            'subject': subject,
            'role': derive_role(title + ' ' + info + ' ' + subject, subject),
            'region': REGION_NORMALIZE.get(j.get('location_heb_title', ''), j.get('location_heb_title', '')),
            'sub_area': j.get('sub_area', ''),
            'city': j.get('city', ''),
            'scope': scope,
            'contact_name': contact['contact_name'],
            'email': contact['email'] or j.get('template_link', ''),
            'phone': contact['phone'],
            'date': j.get('ad_date', ''),
            'date_iso': iso_date_dmy(j.get('ad_date', '')),
            'snippet': info[:300],
            'description': info,
            'url': raw['source_url'],
        })
    return out


# ─── itu: הסתדרות המורים (v2 with full modal data) ─────────────────
def transform_itu(raw):
    out = []
    for j in raw['jobs']:
        title = j.get('title', '').strip()
        institute = j.get('institute', '').strip()
        profession = j.get('profession', '').strip()
        field = j.get('field', '').strip()
        date = j.get('date', '').strip()
        description = j.get('description', '').strip()
        m = re.search(r'(\d{2})/(\d{2})/(\d{4})', date)
        date_iso = f"{m.group(3)}-{m.group(2)}-{m.group(1)}" if m else ''

        if not is_teacher_job(title, description, field + ' ' + profession):
            continue

        out.append({
            'id': make_id('itu', j.get('id')),
            'source': 'itu',
            'source_name': 'הסתדרות המורים',
            'school': institute or title,
            'title': title,
            'subject': profession,
            'role': derive_role(title + ' ' + description + ' ' + field, profession),
            'region': REGION_NORMALIZE.get(j.get('region', ''), j.get('region', '')),
            'sub_area': '',
            'city': find_city(title + ' ' + description + ' ' + institute),
            'scope': '',
            'contact_name': '',
            'email': j.get('email', ''),
            'phone': j.get('phone', ''),
            'date': date,
            'date_iso': date_iso,
            'snippet': description[:300],
            'description': description,
            'url': raw['source_url'],
        })
    return out


# ─── shatil ────────────────────────────────────────────────────────
def transform_shatil(raw):
    out = []
    for j in raw['jobs']:
        title = j.get('title', '').strip()
        desc = j.get('description', '').strip()
        if desc.startswith(title):
            desc = desc[len(title):].strip()

        if not is_teacher_job(title, desc):
            continue

        emails = j.get('emails') or []
        email = emails[0] if emails else ''
        zones = j.get('zones', '')
        out.append({
            'id': make_id('shatil', re.sub(r'\D', '', j.get('url', '')) or j.get('url', '')),
            'source': 'shatil',
            'source_name': 'שתיל',
            'school': title,
            'title': title,
            'subject': '',
            'role': derive_role(title + ' ' + desc),
            'region': norm_region(zones),
            'sub_area': zones,
            'city': find_city(title + ' ' + desc),
            'scope': j.get('jobType', ''),
            'contact_name': j.get('contact', ''),
            'email': email,
            'phone': j.get('phone', ''),
            'date': j.get('dateDisplay', ''),
            'date_iso': iso_date_dotted(j.get('dateDisplay', '')) or j.get('date', '')[:10],
            'snippet': desc[:300],
            'description': desc,
            'url': j.get('url', ''),
        })
    return out


# ─── merge ─────────────────────────────────────────────────────────
def main():
    igm = load('igm-jobs.json')
    itu = load('itu-jobs.json')
    shatil = load('shatil-jobs.json')

    all_jobs = transform_igm(igm) + transform_itu(itu) + transform_shatil(shatil)

    seen = set()
    unique = []
    for j in all_jobs:
        if j['id'] in seen:
            continue
        seen.add(j['id'])
        unique.append(j)

    unique.sort(key=lambda j: j.get('date_iso', ''), reverse=True)

    from collections import Counter
    by_source = Counter(j['source'] for j in unique)
    by_region = Counter(j['region'] or '(לא זוהה)' for j in unique)
    by_role = Counter(j['role'] for j in unique)

    out = {
        'updated_at': '2026-04-25',
        'total': len(unique),
        'by_source': dict(by_source),
        'by_region': dict(by_region),
        'by_role': dict(by_role),
        'jobs': unique,
    }
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    # Also write a machine-readable summary (no Hebrew print issues)
    summary_path = ROOT / 'merge-summary.txt'
    with open(summary_path, 'w', encoding='utf-8') as f:
        f.write(f'Total: {len(unique)}\n')
        f.write(f'By source: {dict(by_source)}\n')
        f.write(f'By region: {dict(by_region)}\n')
        f.write(f'By role: {dict(by_role)}\n')
    print(f'Wrote {OUT.name} with {len(unique)} jobs (see merge-summary.txt)')


if __name__ == '__main__':
    main()
