# -*- coding: utf-8 -*-
"""
רֶצֶף — דוח השוואה: curriculum-data.js הנוכחי מול החילוץ מהמקור.

curriculum-data.js הוא מקור-האמת של הפייפליין. אסור להחליף אותו בלי דיף
מודולה-מודולה שמיטל רואה — לכן הסקריפט הזה. הוא **לא כותב** כלום מלבד הדוח.

מציג לכל מודולה: כמה תתי-נושאים לפני/אחרי · אילו פריטים חדשים · אילו נעלמו,
בשתי חלופות של כלל-המפריד (בלי פסיק / עם נפילה-לפסיק).

הרצה:  python compare-curriculum.py    →  curriculum-diff.html
"""
import json, io, os, re, html as H, importlib.util, zipfile

HERE = os.path.dirname(os.path.abspath(__file__))


def load_extractor(comma_fallback):
    """טוען את המחלץ מחדש עם/בלי החריג (COMMA_FALLBACK נקבע בזמן ייבוא)."""
    spec = importlib.util.spec_from_file_location(
        'ex_%d' % comma_fallback, os.path.join(HERE, 'extract-curriculum.py'))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    m.COMMA_FALLBACK = comma_fallback
    m.WRITE = False
    return m


def extract(mod):
    zf = zipfile.ZipFile(mod.ZIP)
    docx = [n for n in zf.namelist() if n.lower().endswith('.docx')]
    plan = open(os.path.join(HERE, 'production-plan.js'), encoding='utf-8').read()
    srcs = dict(re.findall(r"id:'([^']+)'[^}]*?src:'([^']+)'", plan, re.S))
    out = {}
    for sid, src in srcs.items():
        fn = src.split('/')[-1]
        c = [n for n in docx if n.split('/')[-1] == fn]
        if not c:
            continue
        mods = mod.parse_modules(mod.docx_lines(zf, c[0]))
        if mods:
            out[sid] = {'mods': mods}
    return out


def current():
    js = open(os.path.join(HERE, 'curriculum-data.js'), encoding='utf-8').read()
    return json.loads(js[js.index('{'):js.rindex(';')])


def items(m):
    return list(m.get('knowledge', [])) + list(m.get('skills', []))


def norm(s):
    """נרמול להשוואה בלבד — הפיצול הישן קיצץ וריסק, ולכן ההשוואה סלחנית."""
    return re.sub(r'[\s־\-—–,;:.()"\']+', '', s)


def cell(n, ref=None):
    cls = ''
    if ref is not None:
        cls = ' up' if n > ref else (' down' if n < ref else '')
    return '<td class="num%s">%d</td>' % (cls, n)


def main():
    cur = current()
    a = extract(load_extractor(False))   # כלל הפסיק כפי שנוסח
    b = extract(load_extractor(True))    # עם נפילה-לפסיק

    rows, subj_cards = [], []
    for sid in sorted(set(cur) | set(a) | set(b)):
        cm = {m['n']: m for m in cur.get(sid, {}).get('mods', [])}
        am = {m['n']: m for m in a.get(sid, {}).get('mods', [])}
        bm = {m['n']: m for m in b.get(sid, {}).get('mods', [])}
        tc = sum(len(items(m)) for m in cm.values())
        ta = sum(len(items(m)) for m in am.values())
        tb = sum(len(items(m)) for m in bm.values())
        rows.append((sid, len(cm), tc, len(am), ta, tb))

        mod_rows = []
        for k in sorted(set(cm) | set(am) | set(bm)):
            c_, a_, b_ = cm.get(k), am.get(k), bm.get(k)
            src = b_ or a_ or c_
            ci, ai, bi = items(c_ or {}), items(a_ or {}), items(b_ or {})
            gone = [x for x in ci if not any(norm(x) in norm(y) or norm(y) in norm(x)
                                             for y in bi)]
            fresh = [x for x in bi if not any(norm(x) in norm(y) or norm(y) in norm(x)
                                              for y in ci)]
            det = ''
            if gone or fresh:
                det = ('<details><summary>%d נעלמו · %d חדשים</summary>'
                       '<div class="lists">' % (len(gone), len(fresh)))
                if gone:
                    det += '<div class="gone"><b>נעלמו (יש בנוכחי, אין במקור)</b><ul>' + \
                        ''.join('<li>%s</li>' % H.escape(x) for x in gone) + '</ul></div>'
                if fresh:
                    det += '<div class="fresh"><b>חדשים (חולצו מהמקור)</b><ul>' + \
                        ''.join('<li>%s</li>' % H.escape(x) for x in fresh) + '</ul></div>'
                det += '</div></details>'
            mod_rows.append(
                '<tr><td class="mod">מ%d</td><td class="t">%s</td>%s%s%s<td>%s</td></tr>'
                % (k, H.escape((src or {}).get('title', '—')),
                   cell(len(ci)), cell(len(ai), len(ci)), cell(len(bi), len(ci)), det))

        subj_cards.append(
            '<section id="%s"><h3>%s <span class="tot">נוכחי %d · ללא-פסיק %d · עם-פסיק %d</span></h3>'
            '<table><thead><tr><th></th><th>מודולה</th><th>נוכחי</th>'
            '<th>ללא-פסיק</th><th>עם-פסיק</th><th>שינויים</th></tr></thead>'
            '<tbody>%s</tbody></table></section>'
            % (sid, sid, tc, ta, tb, ''.join(mod_rows)))

    tc = sum(r[2] for r in rows); ta = sum(r[4] for r in rows); tb = sum(r[5] for r in rows)
    summary = ''.join(
        '<tr><td class="t"><a href="#%s">%s</a></td>%s%s%s</tr>'
        % (sid, sid, cell(c), cell(x, c), cell(y, c))
        for sid, _, c, _, x, y in rows)

    doc = """<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>רֶצֶף — דיף חילוץ הכשירויות</title>
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box}
body{font-family:Heebo,system-ui,sans-serif;background:#f6fafb;color:#123;margin:0;padding:24px;line-height:1.6}
.wrap{max-width:1100px;margin:0 auto}
h1{font-size:26px;margin:0 0 4px}
.sub{color:#567;margin:0 0 20px}
.note{background:#fff;border:1px solid #d8e6ea;border-right:4px solid #2b9ebc;
      border-radius:10px;padding:14px 18px;margin:0 0 22px}
.note b{color:#0d7a99}
table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #e2edf0;
      border-radius:10px;overflow:hidden;margin:0 0 12px}
th,td{padding:7px 10px;text-align:right;border-bottom:1px solid #eef4f6;font-size:14px}
th{background:#eaf6f9;font-weight:700;color:#0d5b73}
td.num{text-align:center;font-variant-numeric:tabular-nums;width:86px}
td.num.up{background:#e8f7ee;color:#0a7a3d;font-weight:700}
td.num.down{background:#fdecec;color:#a32020;font-weight:700}
td.mod{font-weight:700;color:#0d7a99;width:44px}
td.t{font-weight:500}
section{margin:0 0 26px}
h3{margin:22px 0 8px;font-size:18px;color:#0d5b73}
.tot{font-size:13px;font-weight:400;color:#678}
details{font-size:13px}
summary{cursor:pointer;color:#0d7a99}
.lists{display:flex;gap:18px;flex-wrap:wrap;margin:8px 0}
.lists>div{flex:1;min-width:260px}
.gone b{color:#a32020}.fresh b{color:#0a7a3d}
ul{margin:4px 0;padding-inline-start:18px}
li{margin:2px 0}
a{color:#0d7a99}
.big{font-size:15px}
</style></head><body><div class="wrap">
<h1>רֶצֶף — דיף חילוץ הכשירויות מהמקור</h1>
<p class="sub">curriculum-data.js הנוכחי מול חילוץ ישיר מ-57 קובצי ה-DOCX (סל תשפ"ז). הדוח לא משנה כלום.</p>
<div class="note big">
<b>ההחלטה שצריך להכריע:</b> כלל-המפריד.<br>
<b>ללא-פסיק</b> — הכלל כפי שנוסח: מפרידים רק על ";" ועל סוף-משפט. סה"כ __A__ תתי-נושאים.<br>
<b>עם-פסיק</b> — אותו כלל, ובתוספת חריג: שדה שאין בו ";" <em>כלל</em> — הפסיק בו הוא המפריד. סה"כ __B__ תתי-נושאים.<br>
החריג נוגע ב-3 מקצועות בלבד (תקשוב, מתמטיקה, הוראת-נהיגה) — מסמכים שכמעט אינם משתמשים ב-";".
בלי החריג, 8 מ-10 מודולות התקשוב יורדות ל-2 תתי-נושאים בדיוק.
עוגן-הבדיקה "עקרונות בסיסיים: נקודה, קו, צורה" נשאר שלם בשתי החלופות.
</div>
<h3>סיכום לפי מקצוע</h3>
<table><thead><tr><th>מקצוע</th><th>נוכחי</th><th>ללא-פסיק</th><th>עם-פסיק</th></tr></thead>
<tbody>__SUM__<tr><th>סה"כ</th><th style="text-align:center">__C__</th>
<th style="text-align:center">__A__</th><th style="text-align:center">__B__</th></tr></tbody></table>
__CARDS__
</div></body></html>"""
    doc = (doc.replace('__SUM__', summary).replace('__CARDS__', ''.join(subj_cards))
              .replace('__C__', str(tc)).replace('__A__', str(ta)).replace('__B__', str(tb)))
    p = os.path.join(HERE, 'curriculum-diff.html')
    with io.open(p, 'w', encoding='utf-8') as f:
        f.write(doc)
    print('נכתב curriculum-diff.html')
    print('נוכחי %d · ללא-פסיק %d · עם-פסיק %d' % (tc, ta, tb))


if __name__ == '__main__':
    main()
