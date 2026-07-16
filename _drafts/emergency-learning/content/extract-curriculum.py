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

מבנה הדוקס (סעיף 8 — פירוק למודולות):
    מודולה N — <כותרת>
    רכיב / תוכן            (כותרות טבלה)
    ידע        → <טקסט>
    מיומנות    → <טקסט>
    חניכות / דרכי למידה / חומרי למידה ועזרים
    תוצר למידה / הערכה → <טקסט>
    שעות מומלצות → <מספר>

הרצה:  python extract-curriculum.py            (יבש — משווה בלבד)
       python extract-curriculum.py --write    (כותב curriculum-data.js)
"""
import zipfile, re, io, html, json, sys, os

ZIP = r'C:/Users/meyta/Downloads/תוכניות לימודים-20260715T185021Z-1-001.zip'
HERE = os.path.dirname(os.path.abspath(__file__))
WRITE = '--write' in sys.argv


def docx_lines(zf, name):
    """מחזיר את פסקאות ה-DOCX כרשימת שורות."""
    d = zipfile.ZipFile(io.BytesIO(zf.read(name)))
    xml = d.read('word/document.xml').decode('utf-8')
    xml = re.sub(r'</w:p>', '\n', xml)
    txt = html.unescape(re.sub(r'<[^>]+>', '', xml))
    return [l.strip() for l in txt.split('\n') if l.strip()]


def split_items(text):
    """
    מפצל טקסט-כשירויות לפריטים.
    מפריד על ';' ועל סוף-משפט ('. ') — **לעולם לא על פסיק**.
    """
    if not text:
        return []
    text = text.strip().rstrip('.')
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


# ── כותרות השדות בטבלת המודולה ────────────────────────────────
FIELDS = ['ידע', 'מיומנות', 'חניכות', 'דרכי למידה',
          'חומרי למידה ועזרים', 'תוצר למידה / הערכה', 'שעות מומלצות']
# כותרות-טבלה שיש להתעלם מהן. משתנה בין קבצים: "תוכן" / "פירוט".
TABLE_HDR = ('רכיב', 'תוכן', 'פירוט')
# מספור המודולה מגיע בשתי צורות: "מודולה 1 —" (מדיה) · "מודולה מ1 —" (שיער).
# גם "אבן דרך" מופיע כמילה נרדפת בחלק מהקבצים.
MOD_RX = re.compile(r'^(?:מודולה|אבן דרך|מודול)\s+[א-ת]?\s*(\d+)\s*[—–\-:]\s*(.+)$')


def parse_modules(lines):
    """מחלץ את המודולות מסעיף 8."""
    mods, cur, field = [], None, None
    for l in lines:
        m = MOD_RX.match(l)
        if m:
            if cur:
                mods.append(cur)
            cur = {'n': int(m.group(1)), 'title': m.group(2).strip(),
                   'knowledge': [], 'skills': [], 'responsibility': '', 'assess': ''}
            field = None
            continue
        if cur is None:
            continue
        if l in FIELDS:
            field = l
            continue
        if l in TABLE_HDR:
            continue
        if field == 'ידע':
            cur['knowledge'] += split_items(l); field = None
        elif field == 'מיומנות':
            cur['skills'] += split_items(l); field = None
        elif field == 'חניכות':
            cur['responsibility'] = l.strip(); field = None
        elif field == 'תוצר למידה / הערכה':
            cur['assess'] = l.strip(); field = None
        elif field:
            field = None
    if cur:
        mods.append(cur)
    return mods


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
