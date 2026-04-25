"""
ממזג igm + itu + shatil ל-jobs.json אחיד.
Schema: {id, source, source_name, school, title, subject, role, region, city, scope,
         contact, email, phone, date, snippet, url, full_text}
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


def norm_region(s):
    if not s:
        return ''
    # split on commas — first match wins (simplest case)
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
    """ארגון המורים מחזיר contact כ-'איש קשר: X<br/>דואל: Y<br/>טלפון: Z<br/>פקס: W'"""
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
    """מסיק תפקיד מ-title/text/profession"""
    t = (text or '') + ' ' + (profession or '')
    if re.search(r'מנהל[ת]?\s+(בית\s+ספר|תיכון|ביה"ס)', t): return 'מנהל/ת'
    if re.search(r'\bסגן\s+מנהל|סגנית\s+מנהלת', t): return 'סגן/ית'
    if re.search(r'\bרכז[ת]?\b', t) and not re.search(r'מרכז', t): return 'רכז/ת'
    if re.search(r'\bמחנכ[ת]?\b', t): return 'מחנך/ת'
    if re.search(r'\bיועצ[תת]?\b|יועצ/ת', t): return 'יועץ/ת'
    if re.search(r'\bמדריכ[הת]?\b', t): return 'מדריך/ה'
    if re.search(r'\bסייע[ת]?\b', t): return 'סייע/ת'
    if re.search(r'\bמטפל[ת]?\b|תרפיסט', t): return 'מטפל/ת'
    return 'מורה'


def make_id(source, sid_or_url):
    """ID יציב לפי source+raw id"""
    return f"{source}-{sid_or_url}" if isinstance(sid_or_url, (int, str)) else \
           f"{source}-{hashlib.sha1(str(sid_or_url).encode()).hexdigest()[:10]}"


# ─── igm: ארגון המורים ─────────────────────────────────────────────
def transform_igm(raw):
    out = []
    for j in raw['jobs']:
        contact = parse_contact_block(j.get('contact', ''))
        info = strip_html(j.get('info', ''))
        title = strip_html(j.get('title', '')) or 'משרת הוראה'
        subject = strip_html(j.get('subject', ''))
        scope = strip_html(j.get('job_length', ''))
        out.append({
            'id': make_id('igm', j.get('id')),
            'source': 'igm',
            'source_name': 'ארגון המורים',
            'school': title,
            'title': f"{subject} · {title}" if subject and title else (subject or title),
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


def iso_date_dmy(s):
    """12/04/2026 → 2026-04-12"""
    m = re.match(r'(\d{2})/(\d{2})/(\d{4})', s or '')
    return f"{m.group(3)}-{m.group(2)}-{m.group(1)}" if m else ''


def iso_date_dotted(s):
    """25.4.2026 → 2026-04-25"""
    m = re.match(r'(\d{1,2})\.(\d{1,2})\.(\d{4})', s or '')
    return f"{m.group(3)}-{int(m.group(2)):02d}-{int(m.group(1)):02d}" if m else ''


# ─── itu: הסתדרות המורים ───────────────────────────────────────────
def transform_itu(raw):
    out = []
    for j in raw['jobs']:
        title = j.get('title', '').strip()
        institute = j.get('institute', '').strip()
        profession = j.get('profession', '').strip()
        date = j.get('date', '').strip()
        # Date format like "11:38 23/04/2026"
        m = re.search(r'(\d{2})/(\d{2})/(\d{4})', date)
        date_iso = f"{m.group(3)}-{m.group(2)}-{m.group(1)}" if m else ''
        # Excerpt — try to extract from raw text by stripping known parts
        raw_text = j.get('raw', '')
        # The card has structure: TITLE \n DATE \n PROFESSION \n FIELD \n INSTITUTE \n DESC
        parts = [p.strip() for p in raw_text.split('\n') if p.strip()]
        # find description after institute
        desc = ''
        if institute and institute in parts:
            idx = parts.index(institute)
            tail = parts[idx + 1:]
            tail = [t for t in tail if t not in ('פרטים', 'סימון לשליחת קו"ח')]
            desc = ' '.join(tail).strip()
        out.append({
            'id': make_id('itu', j.get('id')),
            'source': 'itu',
            'source_name': 'הסתדרות המורים',
            'school': institute or title,
            'title': title,
            'subject': profession,
            'role': derive_role(title + ' ' + desc, j.get('field', '') or profession),
            'region': '',  # not exposed at index level
            'sub_area': '',
            'city': '',
            'scope': '',
            'contact_name': '',
            'email': '',
            'phone': '',
            'date': date,
            'date_iso': date_iso,
            'snippet': desc[:300],
            'description': desc,
            'url': raw['source_url'],
        })
    return out


# ─── shatil ────────────────────────────────────────────────────────
def transform_shatil(raw):
    out = []
    for j in raw['jobs']:
        title = j.get('title', '').strip()
        desc = j.get('description', '').strip()
        # remove leading title+date from description
        if desc.startswith(title):
            desc = desc[len(title):].strip()
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
            'city': '',
            'scope': j.get('jobType', ''),
            'contact_name': j.get('contact', ''),
            'email': email,
            'phone': '',
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

    # dedupe by id
    seen = set()
    unique = []
    for j in all_jobs:
        if j['id'] in seen:
            continue
        seen.add(j['id'])
        unique.append(j)

    # sort by date_iso desc
    unique.sort(key=lambda j: j.get('date_iso', ''), reverse=True)

    # stats
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
    print(f'Wrote {OUT} with {len(unique)} jobs')
    print(f'by_source: {dict(by_source)}')
    print(f'by_region: {dict(by_region)}')
    print(f'by_role: {dict(by_role)}')


if __name__ == '__main__':
    main()
