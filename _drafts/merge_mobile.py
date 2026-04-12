import pdfplumber, json, re

PDF = r"c:\Users\meyta\Downloads\Report (9).pdf"
JSON_IN = r"c:\Users\meyta\Downloads\ort-presentation-builder\_drafts\students.json"

HEB = re.compile(r"[\u0590-\u05FF]")
def rev(s):
    s = (s or "").strip()
    return s[::-1] if HEB.search(s) else s

# Extract (fam, given, class, mobile) tuples from the PDF
# Column order after LTR extraction of an RTL table: [phone, class, given, family]
records = []
with pdfplumber.open(PDF) as pdf:
    for page in pdf.pages:
        tbl = page.extract_table()
        if not tbl: continue
        for row in tbl:
            if not row or len(row) < 4: continue
            phone, cls, given, fam = [(c or "").strip() for c in row[:4]]
            fam_r = rev(fam); given_r = rev(given); cls_r = rev(cls)
            if not fam_r or "משפחה" in fam_r: continue
            records.append({"fam":fam_r,"given":given_r,"class":cls_r,"phone":phone})

print(f"PDF rows: {len(records)}")

with open(JSON_IN, encoding="utf-8") as f:
    students = json.load(f)

# normalize class strings (remove spaces) for matching
def norm(s): return (s or "").replace(" ","").replace("'","").replace('"',"").strip()

idx = {}
for r in records:
    key = (norm(r["fam"]), norm(r["given"]), norm(r["class"]))
    idx[key] = r["phone"]

matched = 0
missing_mobile = []
missing_p1 = []
missing_p2 = []
unmatched_pdf = []

# attach mobile to each student
for s in students:
    key = (norm(s["fam"]), norm(s["given"]), norm(s["class"]))
    phone = idx.get(key, "")
    s["student_phone"] = phone
    if phone:
        matched += 1
    else:
        missing_mobile.append(f"{s['fam']} {s['given']} ({s['class']})")
    if not s.get("p1_phone"):
        missing_p1.append(f"{s['fam']} {s['given']} ({s['class']})")
    if not s.get("p2_phone"):
        missing_p2.append(f"{s['fam']} {s['given']} ({s['class']})")

# check unmatched pdf records
student_keys = {(norm(s["fam"]), norm(s["given"]), norm(s["class"])) for s in students}
for r in records:
    k = (norm(r["fam"]), norm(r["given"]), norm(r["class"]))
    if k not in student_keys:
        unmatched_pdf.append(f"{r['fam']} {r['given']} ({r['class']}) {r['phone']}")

print(f"\nMatched mobile: {matched}/{len(students)}")
print(f"\n=== Missing student mobile ({len(missing_mobile)}) ===")
for x in missing_mobile: print("  ", x)
print(f"\n=== Missing parent 1 phone ({len(missing_p1)}) ===")
for x in missing_p1: print("  ", x)
print(f"\n=== Missing parent 2 phone ({len(missing_p2)}) ===")
for x in missing_p2: print("  ", x)
print(f"\n=== PDF rows not matched to roster ({len(unmatched_pdf)}) ===")
for x in unmatched_pdf: print("  ", x)

with open(JSON_IN, "w", encoding="utf-8") as f:
    json.dump(students, f, ensure_ascii=False, indent=2)
print(f"\nSaved updated {JSON_IN}")
