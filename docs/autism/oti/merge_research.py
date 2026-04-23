"""
ממזג את 3 קבצי מחקר הסוכנים עם all.json הקיים:
- בדיקת כפילויות (שם מנורמל)
- הוספת שדות: ageGroups[], professions[], methods[], source_type
- שמירת all-enriched.json
"""
import json, re, sys
from pathlib import Path

BASE = Path(__file__).parent / 'data'

def load(p):
    return json.load(open(BASE / p, encoding='utf-8'))

def norm_name(s):
    s = (s or '').strip().lower()
    s = re.sub(r'[״"\'`\-–—.,()\[\]]', '', s)
    s = re.sub(r'\s+', ' ', s)
    return s

AGE_GROUPS = [
    ('0-3',   r'0\s*[-–]\s*3|תינוק|פעוט|ינקות|early|מוקדמת'),
    ('3-6',   r'3\s*[-–]\s*6|גן|preschool'),
    ('6-13',  r'6\s*[-–]\s*13|7\s*[-–]\s*12|יסודי|ילדים'),
    ('13-18', r'13\s*[-–]\s*1[678]|14\s*[-–]\s*18|תיכון|חטיבה|נוער|מתבגר'),
    ('18-21', r'18\s*[-–]\s*21|מעבר.*בגרות|צעירים|צבא|שירות'),
    ('21+',   r'21\s*\+|21\s*[-–]\s*\d+|בוגר|adults?|\b1[89]\+'),
]

# תת-קבוצות גיל בוגרים (רק למי שמסווג 21+)
ADULT_SUBGROUPS = [
    ('21-30', r'2[1-9]\s*[-–]\s*30|צעירים|young ad|דור ה[-]?20|בוגרים צעירים'),
    ('30-50', r'3[0-9]\s*[-–]\s*[45]|middle ad|גיל ביניים|בוגרים בגילים'),
    ('50+',   r'5[0-9]\s*\+|50\s*[-–]\s*\d+|מבוגרים|קשישים|elder|הזקנה|גיל שלישי'),
]

# קופות חולים וקופות (חילוץ מטקסט)
KUPOT = {
    'clalit':   r'כללית',
    'maccabi':  r'מכבי',
    'meuhedet': r'מאוחדת',
    'leumit':   r'לאומית',
}

# מידע מחיר (טקסט חופשי בהערות)
PRICE_PATTERNS = [
    r'\d{2,4}\s*ש"?ח|\d{2,4}\s*₪|חינם|ממומן|בתשלום|מסובסד',
]

def detect_age_groups(text):
    t = str(text or '').lower()
    out = []
    if re.search(r'\ball\b|כל.*גילאים|ילדים ובוגרים|all ages', t):
        return ['0-3', '3-6', '6-13', '13-18', '18-21', '21+']
    for key, pat in AGE_GROUPS:
        if re.search(pat, t):
            out.append(key)
    return out or []


def detect_adult_subgroups(text):
    """רק למענים 21+ — לזהות תת-קבוצה (21-30, 30-50, 50+)"""
    t = str(text or '').lower()
    out = []
    for key, pat in ADULT_SUBGROUPS:
        if re.search(pat, t):
            out.append(key)
    return out


def detect_kupot(text):
    t = str(text or '')
    return [k for k, pat in KUPOT.items() if re.search(pat, t)]


def extract_price_hint(text):
    """מחלץ אינדיקציה על מחיר/תשלום מהטקסט"""
    t = str(text or '')
    for pat in PRICE_PATTERNS:
        m = re.search(pat, t)
        if m:
            # Find the sentence containing it (up to 120 chars context)
            start = max(0, m.start() - 50)
            end = min(len(t), m.end() + 50)
            return t[start:end].strip()
    return ''

PROFESSIONS = {
    # טיפול ואבחון (therapy & assessment)
    'psychiatrist':  r'פסיכיאטר',
    'psychologist':  r'פסיכולוג',
    'speech':        r'קלינאי|קלינאית|תקשורת.*טיפול|שפה ודיבור',
    'ot':            r'ריפוי בעיסוק|מרפא.*בעיסוק',
    'developmental': r'התפתחות.*ילד|התפתחותית?\b',
    'social-worker': r'עו"ס|עובד.*סוציאלי|סוציאלית?',
    'diagnostician': r'מאבחן|אבחון ASD|דוח אבחון',
    'art-therapy':   r'תרפיה.*אמנות|אמנויות|מוזיקה טיפול|דרמה טיפול',
    'lawyer':        r'עו"ד|משפטי|עורך דין',

    # שירותי רפואה (medical services)
    'dentist':       r'רופא.*שיניים|רופאת.*שיניים|שיניים.*ילדים|שיניים בהרדמה|אורתודונט|דנטל',
    'pediatrician':  r'רופא.*ילדים|רופאת.*ילדים|רפואת ילדים',
    'gynecologist':  r'רופאת.*נשים|רופא.*נשים|גניקולוג',
    'endocrinologist': r'אנדוקרינולוג',
    'cardiologist':  r'קרדיולוג',
    'neurologist':   r'נוירולוג',
    'ophthalmologist': r'רופא.*עיניים|רופאת.*עיניים|אופטומטריסט',
    'ent':           r'אף אוזן גרון|\bאאג\b|אוטולוג',
    'dermatologist': r'רופא.*עור|רופאת.*עור|דרמטולוג',
    'nutrition':     r'תזונאי|תזונאית|דיאטן|דיאטנית',
    'physio':        r'פיזיותרפ|פזיותרפ',
    'genetics':      r'גנטיקאי|גנטיקאית|ייעוץ גנטי',
    'family-med':    r'רופא.*משפחה|רפואה כללית|רופא ראשוני',
    'anesthesia':    r'הרדמה כללית|מרדים',
}

# קבוצות-על
MEDICAL_PROFESSIONS = {'dentist','pediatrician','gynecologist','endocrinologist','cardiologist',
                       'neurologist','ophthalmologist','ent','dermatologist','nutrition','physio',
                       'genetics','family-med','anesthesia'}
THERAPY_PROFESSIONS = {'psychiatrist','psychologist','speech','ot','developmental','social-worker',
                       'diagnostician','art-therapy'}

TOPICS = {
    'arts':       r'אמנות טיפול|תרפיה באמנויות|סטודיו אמנות|קרמיקה|תיאטרון קהילתי|פיסול|ציור טיפול|אמנות אקספרסיבית',
    'music':      r'מוזיקה|נגינה|כלי נגינה|תזמורת|מקהלה|מוזיקה טיפולית|תרפיה במוזיקה',
    'housing':    r'הוסטל|דיור|דירה בקהילה|דירת הוסטל|מגורים|דיור מוגן|דיור נתמך|מעונות ?יום|residential',
    'employment': r'תעסוק|מפעל מוגן|מע"ן|מען|שילוב תעסוקתי|מקום עבודה|קידום בעבודה|תעסוקה נתמכת|מרכז ריאן|employment|מקדם תעסוקה',
    'academia':   r'אקדמי|אוניברסיט|מכלל|מוסד להשכלה|השכלה גבוהה|סטודנט|לימודים אקדמיים|תוכנית שילוב|מכינה',
    'army':       r'\bצה"ל\b|צבא|תתקדמו|של"צ|שירות משמעותי|פרופיל 21|דחיית שירות|צו ראשון|קא"מ|יחידה 9900',
    'national-service': r'שירות לאומי|ש"ל|של"ל|שלוחה לשירות|שנת שירות',
    'rights':     r'קצבה|ביטוח לאומי|זכויות|סל שיקום|קצבת|הטבה|פטור|נכות|סל הבריאות|תו חניה',
    'diagnosis':  r'אבחון ASD|ועדת השמה|ועדת אפיון|דוח אבחון|הערכה|אבחנה|התפתחותי',
    'rehab':      r'שיקום|ועדת סל|סל שיקומי|התערבות|שיקום רפואי',
    'leisure':    r'פנאי|חוג|מועדון|קייטנה|נופש|פעילות חברתית|לגדול|מפגשים חברתיים|אירועי פנאי',
    'community':  r'קהילה|קבוצת תמיכה|קבוצת הורים|מפגשי הורים|מרכז משפחה',
    'legal':      r'עו"ד|ייעוץ משפטי|אפוטרופס|תומך החלטות|זכויות משפטיות|ליטיגציה',
    'kindergarten': r'גן תקשורת|גני תקשורת|גן שילוב|גן רגיל|גן ילדים|גן שפה',
    'school':     r'כיתת תקשורת|כיתת שילוב|בית.*ספר|יסודי|חטיבה|תיכון|מסגרת חינוכית',
    'early-intervention': r'התערבות מוקדמת|מכון התפתחות|פעוטון|מעון יום|גיל רך',
    'tech-aids':  r'תקשורת תומכת|AAC|תקשורת חלופית|אפליקצ|טכנולוגיה מסייעת|גאדג',
    'medication': r'תרופת|תרופות|ריטלין|אבילפיי|ריספרדל|טיפול תרופתי',
    'families':   r'הורים|אחים ואחיות|זוגיות|סדנה להורים|הדרכת הורים',
    'girls':      r'בנות על הרצף|נערות|נשים אוטיסטיות|בנות עם תקשורת|מתמחה בבנות',
    'arabs':      r'ערבית|דוברי ערבית|מגזר ערבי|ערביי|ציבור הערבי|דוברת ערבית',
    'religious':  r'חרדי|דתי|ממ"ד|דתית|חרדית',
}

METHODS = {
    'aba':      r'\bABA\b|ניתוח התנהגות',
    'cbt':      r'\bCBT\b|קוגניטיבי.*התנהגותי',
    'pecs':     r'\bPECS\b',
    'rdi':      r'\bRDI\b',
    'dir':      r'\bDIR\b|Floortime|פלורטיים',
    'teacch':   r'\bTEACCH\b',
    'dynamic':  r'דינמ|פסיכודינמי',
    'family':   r'משפחתי|family therapy',
    'sensory':  r'סנסור|אינטגרצ.*חוש',
}

def detect_tags(text, table):
    t = str(text or '')
    return [k for k, pat in table.items() if re.search(pat, t, re.IGNORECASE)]

def enrich(r, source_type='chat'):
    text = ' '.join(str(r.get(k, '')) for k in ['התמחות', 'תת-קטגוריה', 'שם', 'הערות'])
    r['ageGroups']   = detect_age_groups((r.get('גילאים') or '') + ' ' + text)
    r['professions'] = detect_tags(text, PROFESSIONS)
    r['methods']     = detect_tags(text, METHODS)
    r['topics']      = detect_tags(text, TOPICS)
    r['kupot']       = detect_kupot(text)
    r['price_hint']  = extract_price_hint(text)
    # תת-קבוצת בוגרים (רק אם 21+)
    if '21+' in r['ageGroups']:
        r['adultSubgroups'] = detect_adult_subgroups(text)
    else:
        r['adultSubgroups'] = []
    r['source_type'] = source_type

    # סווג לקבוצה — medical / therapy / none
    profs = set(r['professions'])
    is_medical = bool(profs & MEDICAL_PROFESSIONS)
    is_therapy = bool(profs & THERAPY_PROFESSIONS)
    if is_medical and not is_therapy:
        r['service_group'] = 'medical'
    elif is_therapy and not is_medical:
        r['service_group'] = 'therapy'
    elif is_medical and is_therapy:
        r['service_group'] = 'both'
    else:
        r['service_group'] = None
    return r

def main():
    base = load('all.json')
    a1 = load('research-agent-1.json')
    a2 = load('research-agent-2.json')
    a3 = load('research-agent-3.json')

    seen = {norm_name(r['שם']): r for r in base}
    merged = [enrich(r, 'chat') for r in base]

    stats = {'chat': len(base), 'therapists': 0, 'official': 0, 'ngo': 0, 'dup': 0}

    for src, label in [(a1, 'therapists'), (a2, 'official'), (a3, 'ngo')]:
        for r in src:
            key = norm_name(r['שם'])
            if key in seen:
                stats['dup'] += 1
                existing = seen[key]
                # הוספת טלפון/אתר אם חסרים
                if not existing.get('טלפון') and r.get('טלפון'): existing['טלפון'] = r['טלפון']
                if not existing.get('אתר')   and r.get('אתר'):   existing['אתר']   = r['אתר']
                continue
            seen[key] = r
            merged.append(enrich(r, label))
            stats[label] += 1

    with open(BASE / 'all-enriched.json', 'w', encoding='utf-8') as f:
        json.dump(merged, f, ensure_ascii=False, indent=1)

    print(f'total merged: {len(merged)}')
    print(f'  chat (existing):      {stats["chat"]}')
    print(f'  +therapists (a1):     {stats["therapists"]}')
    print(f'  +official (a2):       {stats["official"]}')
    print(f'  +ngo (a3):            {stats["ngo"]}')
    print(f'  dedup/merged:         {stats["dup"]}')

    # Stats by age group
    from collections import Counter
    ag = Counter()
    for r in merged:
        for g in r.get('ageGroups', []):
            ag[g] += 1
    print(f'\nby age group:')
    for g, n in sorted(ag.items()):
        print(f'  {g}: {n}')

    prof = Counter()
    for r in merged:
        for p in r.get('professions', []):
            prof[p] += 1
    print(f'\nby profession:')
    for p, n in prof.most_common():
        print(f'  {p}: {n}')

if __name__ == '__main__':
    main()
