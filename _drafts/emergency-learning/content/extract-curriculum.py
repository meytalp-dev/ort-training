# -*- coding: utf-8 -*-
"""
רֶצֶף — חילוץ curriculum-data.js מקבצי ה-DOCX המקוריים (סל תוכניות תשפ"ז).

למה נכתב מחדש:
  החילוץ המקורי (16.7) פיצל כשירויות על **פסיקים** — אבל בדוקס הפסיק הוא
  מפריד *בתוך* פריט, ו-";" הוא המפריד *בין* פריטים:
      "עקרונות בסיסיים: נקודה, קו, צורה, קומפוזיציה; ההבחנה בין וקטור לפיקסל; ..."
                        ^^^^^^^^^^^^^^^^^^^^^^^^^^ פריט אחד   ^ כאן מפרידים
  התוצאה: כשירות אחת רוסקה ל-4 "תתי-נושאים", ופריטים קצרים ("קו") אבדו.
  1,803 תתי-נושאים מנופחים במקום ~1,500 אמיתיים.

מבנה הדוקס — **שתי תבניות טבלה שונות** בסעיף 8 (פירוק למודולות):

  (א) תבנית "מתויגת" (16 קבצים) — טבלת `רכיב | תוכן` אנכית, תווית ואחריה ערך:
        מודולה N — <כותרת>          (או "מודולה מN —" · "מודולה N:" · "מN —" · "מN ·")
        רכיב / תוכן                  (כותרות הטבלה)
        ידע        → <טקסט>
        מיומנות    → <טקסט>
        חניכות · תוצר למידה / הערכה · שעות

  (ב) תבנית "עמודתית" (5 קבצים: כדורגל · עברית · תנ"ך · היסטוריה-גמר · הוראת-נהיגה) —
      שורת-כותרות מגדירה את סדר העמודות, ואחריה שורות-ערכים **לפי מיקום**, בלי תוויות:
        מודולה (אבן דרך) | ידע | מיומנות | חניכות | תוצר למידה ואופן הערכה | המלצת שעות
        1. <כותרת>
        <ידע> / <מיומנות> / <חניכות> / <תוצר> / <שעות>      ← לפי הסדר בלבד
      בהוראת-נהיגה שורת-הכותרות חוזרת בכל מודולה, והכותרת היא "מודולה N — ...".

  זיהוי התבנית: קיום השורה "רכיב" בתוך סעיף 8 → מתויגת; אחרת → עמודתית.
  שמות השדות משתנים בין קבצים ("תוכן"/"פירוט" · "שעות"/"המלצת שעות" ·
  "תוצר למידה / הערכה"/"תוצר הערכה") — לכן ההתאמה לפי **תחילית**, לא השוואה מדויקת.

הרצה:  python extract-curriculum.py            (יבש — משווה בלבד)
       python extract-curriculum.py --write    (כותב curriculum-data.js)
"""
import zipfile, re, io, html, json, sys, os

ZIP = r'C:/Users/meyta/Downloads/תוכניות לימודים-20260715T185021Z-1-001.zip'
HERE = os.path.dirname(os.path.abspath(__file__))
WRITE = '--write' in sys.argv
# ראה split_items — הכלל "לעולם לא פסיק" מתפרק ב-3 מסמכים. כבוי כברירת מחדל.
COMMA_FALLBACK = '--comma-fallback' in sys.argv


def docx_lines(zf, name):
    """מחזיר את פסקאות ה-DOCX כרשימת שורות."""
    d = zipfile.ZipFile(io.BytesIO(zf.read(name)))
    xml = d.read('word/document.xml').decode('utf-8')
    xml = re.sub(r'</w:p>', '\n', xml)
    txt = html.unescape(re.sub(r'<[^>]+>', '', xml))
    return [l.strip() for l in txt.split('\n') if l.strip()]


def split_commas(text):
    """
    מפצל על פסיקים ברמה העליונה בלבד (מחוץ לסוגריים).
    נקרא רק מ-split_items, ורק כששדה **אינו מכיל ';' כלל**.
    """
    parts, buf, depth = [], '', 0
    for ch in text:
        if ch in '([':
            depth += 1
        elif ch in ')]':
            depth -= 1
        if ch == ',' and depth == 0:
            parts.append(buf); buf = ''
        else:
            buf += ch
    parts.append(buf)
    return [p.strip().strip('.').strip() for p in parts if len(p.strip()) >= 2]


def split_items(text):
    """
    מפצל טקסט-כשירויות לפריטים.
    מפריד על ';' ועל סוף-משפט ('. ') — **לעולם לא על פסיק**.

    חריג (--comma-fallback, כבוי כברירת מחדל):
      הכלל "לעולם לא פסיק" נכון כשהמחבר השתמש ב-';'. שלושה מסמכים כמעט
      ואינם משתמשים בו, ובהם הפסיק *הוא* המפריד בין פריטים:
        תקשוב (';' ב-18% מהשדות) · מתמטיקה (24%) · הוראת-נהיגה (38%)
      לעומת קונדיטאות (93%) · תנ"ך (84%) · ירוק (83%).
      בלי החריג, 8 מ-10 מודולות התקשוב יורדות ל-2 תתי-נושאים בדיוק —
      כלומר מודולה שלמה → 2 יחידות. זה בדיוק דפוס-על 0 (תת-נושא-ענק).
      החריג אינו נוגע בשדה שיש בו ';' ואינו נוגע ברשימה שאחרי נקודתיים,
      ולכן עוגן-הבדיקה "עקרונות בסיסיים: נקודה, קו, צורה" נשאר שלם.
    """
    if not text:
        return []
    text = text.strip().rstrip('.')
    if COMMA_FALLBACK and ';' not in text and ':' not in text[:40]:
        return split_commas(text)
    parts = []
    for chunk in text.split(';'):
        chunk = chunk.strip()
        if not chunk:
            continue
        # סוף-משפט בתוך מקטע: ". " ואחריו אות עברית = פריט חדש
        subs = re.split(r'\.\s+(?=[א-ת])', chunk)
        for s in subs:
            s = s.strip().strip('.').strip()
            if len(s) >= 2:
                parts.append(s)
    return parts


# ── גבולות סעיף 8 ─────────────────────────────────────────────
# ההופעה הראשונה היא בתוכן-העניינים; האחרונה היא הכותרת עצמה — לכן [-1].
SEC8_RX = re.compile(r'^8\.\s*פירוק למודולות')
SEC9_RX = re.compile(r'^9\.\s*הסבר')


def section8(lines):
    """מצמצם לסעיף 8 בלבד. בלי זה נשאבות 'ידע'/'מיומנויות' מסעיף 4 (מפת NQF)."""
    st = [i for i, l in enumerate(lines) if SEC8_RX.match(l)]
    en = [i for i, l in enumerate(lines) if SEC9_RX.match(l)]
    if not st:
        return lines
    a = st[-1] + 1
    b = max([i for i in en if i > a] or [len(lines)])
    return lines[a:b]


# ── תוויות השדות — התאמה לפי תחילית ───────────────────────────
# שמות השדות משתנים בין הקבצים, ולכן אין השוואה מדויקת:
#   "תוצר הערכה" · "תוצר למידה / הערכה" · "תוצר למידה/הערכה" · "תוצר למידה ואופן הערכה"
#   "שעות" · "שעות מומלצות" · "המלצת שעות"
#   "חניכות" · "חניכות (התנסות אותנטית)" · "חניכות והתנסות בשטח" · "התנסות בשטח ובקהילה (...)"
LABELS = [
    ('knowledge',      ('ידע',)),
    ('skills',         ('מיומנות', 'מיומנויות')),
    ('responsibility', ('חניכות', 'התנסות')),
    ('assess',         ('תוצר',)),
    ('hours',          ('שעות', 'המלצת שעות')),
    # עמודות שאינן נאספות, אך חייבות להיות מזוהות כתוויות כדי לא להיקרא כערך:
    ('_skip',          ('דרכי למידה', 'חומרי למידה', 'רכיב', 'תוכן', 'פירוט')),
    ('_title',         ('מודולה (אבן דרך)', 'מודול (אבן דרך)')),
]


def canon(line):
    """שם-שדה קנוני לשורת-תווית, או None אם זו אינה תווית."""
    t = line.strip().rstrip(':').strip()
    if len(t) > 45:            # תווית היא תמיד קצרה; ערך ארוך אינו תווית
        return None
    for name, prefixes in LABELS:
        for p in prefixes:
            if t == p or t.startswith(p + ' ') or t.startswith(p + '('):
                return name
    return None


# מספור המודולה: "מודולה 1 —" (מדיה) · "מודולה מ1 —" (שיער) · "מודולה 1:" (קודש)
MOD_RX = re.compile(r'^(?:מודולה|אבן דרך|מודול)\s+[א-ת]?\s*(\d+)\s*[—–\-:·]\s*(.+)$')
# צורה מקוצרת בלי המילה "מודולה": "מ1 — יסודות" (אנגלית) · "מ1 · יסודות" (תקשוב)
MOD_SHORT_RX = re.compile(r'^מ\s*(\d+)\s*[—–\-:·]\s+(.+)$')
# בתבנית העמודתית שורת-המודולה היא תא בטבלה: "1. מושגי יסוד בספורט"
MOD_NUM_RX = re.compile(r'^(\d+)\.\s+(\S.*)$')


def new_mod(n, title):
    return {'n': int(n), 'title': title.strip(), 'knowledge': [], 'skills': [],
            'responsibility': '', 'assess': ''}


def match_mod(l, extra=()):
    for rx in (MOD_RX, MOD_SHORT_RX) + extra:
        m = rx.match(l)
        if m:
            return m
    return None


def ended(mods, n):
    """
    מספרי המודולות בטבלה עולים תמיד. מספר שאינו עולה = הטבלה נגמרה ומתחיל
    בלוק אחר שחוזר על המודולות. בתנ"ך זהו "פירוט המודולות: דרכי למידה,
    ביבליוגרפיה ועזרים" — טבלה שנייה שנקראה כמודולות 1–4 כפולות, ומילאה
    את שדה ה"ידע" בטקסט של דרכי-למידה.
    """
    return bool(mods) and int(n) <= mods[-1]['n']


def put(cur, field, val):
    """משייך ערך לשדה. ידע/מיומנות מפוצלים לפריטים; השאר טקסט חופשי."""
    if field == 'knowledge':
        cur['knowledge'] += split_items(val)
    elif field == 'skills':
        cur['skills'] += split_items(val)
    elif field == 'responsibility':
        cur['responsibility'] = val.strip()
    elif field == 'assess':
        cur['assess'] = val.strip()


def parse_labeled(lines):
    """תבנית (א): תווית ואחריה ערך."""
    mods, cur, field = [], None, None
    for l in lines:
        m = match_mod(l)
        if m:
            if cur:
                mods.append(cur)
                cur = None
            if ended(mods, m.group(1)):
                break
            cur = new_mod(m.group(1), m.group(2))
            field = None
            continue
        if cur is None:
            continue
        c = canon(l)
        if c:
            field = None if c.startswith('_') else c
            continue
        if field:
            put(cur, field, l)
            field = None
    if cur:
        mods.append(cur)
    return mods


def parse_positional(lines):
    """
    תבנית (ב): שורת-כותרות קובעת את סדר העמודות, והערכים באים לפי מיקום.
    עמודת-הכותרת ('מודולה (אבן דרך)') יורדת מהסדר — ערכה הוא שורת-המודולה עצמה.
    """
    mods, cur, cols, ptr = [], None, [], 0
    i = 0
    while i < len(lines):
        l = lines[i]
        m = match_mod(l, extra=(MOD_NUM_RX,))
        if m:
            if cur:
                mods.append(cur)
                cur = None
            if ended(mods, m.group(1)):
                break
            cur = new_mod(m.group(1), m.group(2))
            ptr = 0
            i += 1
            continue
        # רצף של 3+ תוויות = שורת-הכותרות של הטבלה (בהוראת-נהיגה היא חוזרת בכל מודולה)
        run, j = [], i
        while j < len(lines) and canon(lines[j]):
            run.append(canon(lines[j])); j += 1
        if len(run) >= 3:
            cols = [c for c in run if c != '_title']
            ptr = 0
            i = j
            continue
        if cur and cols and ptr < len(cols):
            f = cols[ptr]
            if not f.startswith('_'):
                put(cur, f, l)
            ptr += 1
        i += 1
    if cur:
        mods.append(cur)
    return mods


def parse_modules(lines):
    """מחלץ את המודולות מסעיף 8, לפי התבנית שזוהתה."""
    sec = section8(lines)
    labeled = any(l.strip() == 'רכיב' for l in sec)
    return (parse_labeled if labeled else parse_positional)(sec)


def main():
    zf = zipfile.ZipFile(ZIP)
    docx = [n for n in zf.namelist() if n.lower().endswith('.docx')]

    # מיפוי: שם-קובץ → subject id, לפי שדה src ב-production-plan.js
    plan = open(os.path.join(HERE, 'production-plan.js'), encoding='utf-8').read()
    srcs = dict(re.findall(r"id:'([^']+)'[^}]*?src:'([^']+)'", plan, re.S))

    out, report = {}, []
    for sid, src in srcs.items():
        fname = src.split('/')[-1]
        cands = [n for n in docx if n.split('/')[-1] == fname]
        if not cands:
            report.append(('!', sid, 'לא נמצא DOCX: ' + fname))
            continue
        mods = parse_modules(docx_lines(zf, cands[0]))
        if not mods:
            report.append(('!', sid, 'לא נמצאו מודולות'))
            continue
        out[sid] = {'mods': mods}
        n = sum(len(m['knowledge']) + len(m['skills']) for m in mods)
        report.append(('+', sid, '%d מודולות · %d תתי-נושאים' % (len(mods), n)))

    print('═══ חילוץ מהמקור ═══')
    for tag, sid, msg in sorted(report):
        print(' %s %-22s %s' % (tag, sid, msg))

    total = sum(len(m['knowledge']) + len(m['skills'])
                for s in out.values() for m in s['mods'])
    print('\nמקצועות: %d · תתי-נושאים: %d' % (len(out), total))

    if WRITE:
        hdr = ('/* מדף הרציפות — נתוני תוכניות הלימודים (כשירויות NQF מתוך המקור)\n'
               ' * מקור: סל תוכניות תשפ"ז (docx · פרטי).\n'
               ' *\n'
               ' * 🤖 חולץ ע"י extract-curriculum.py — אל תערוך ידנית.\n'
               ' * מפריד פריטים: ";" וסוף-משפט. **לעולם לא פסיק** — בדוקס הפסיק\n'
               ' * מפריד *בתוך* פריט ("נקודה, קו, צורה"). החילוץ המקורי פיצל על\n'
               ' * פסיקים, ריסק כשירות אחת ל-4 ואיבד פריטים קצרים ("קו").\n'
               ' */\n')
        with io.open(os.path.join(HERE, 'curriculum-data.js'), 'w', encoding='utf-8') as f:
            f.write(hdr + 'window.CURRICULUM = ' +
                    json.dumps(out, ensure_ascii=False, indent=1) + ';\n')
        print('\n✅ נכתב curriculum-data.js')
    else:
        print('\n(יבש — לא נכתב. להרצה: --write)')
        with io.open(os.path.join(HERE, '.curriculum-new.json'), 'w', encoding='utf-8') as f:
            json.dump(out, f, ensure_ascii=False, indent=1)
        print('נשמר .curriculum-new.json להשוואה')


if __name__ == '__main__':
    main()
