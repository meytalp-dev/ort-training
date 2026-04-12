import json, re

JSON_PATH = r"c:\Users\meyta\Downloads\ort-presentation-builder\_drafts\students.json"
STUDENT_DATA_JS = r"c:\Users\meyta\Downloads\ort-presentation-builder\docs\management\student-data.js"
BANK_STUDENTS_JS = r"c:\Users\meyta\Downloads\ort-presentation-builder\docs\management\investment-bank-students.js"

# Active roster rule: include 'active' + 'hidden' (hidden dropout still monitored)
ACTIVE_STATUSES = {"active","hidden"}

CLASS_MAP = {
    "ט' 1":"ט1","ט' 2":"ט2",
    "י' 1":"י1","י' 2":"י2","י' 3":"י3",
    'י"א 1':"יא1",'י"א 2':"יא2",'י"א 3':"יא3",
    'י"ב 1':"יב1",'י"ב 2':"יב2",'י"ב 3':"יב3",
}
CLASS_ORDER = {"ט1":91,"ט2":92,"י1":101,"י2":102,"י3":103,"יא1":111,"יא2":112,"יא3":113,"יב1":121,"יב2":122,"יב3":123}

def parse_megama(track_codes_present):
    return None  # placeholder; megama is per-student

# Track parent name + phone joined "name phone"
def parent_str(name, phone):
    name = (name or "").strip()
    phone = (phone or "").strip()
    if not name and not phone: return ""
    return f"{name} {phone}".strip()

with open(JSON_PATH, encoding="utf-8") as f:
    students = json.load(f)

active = [s for s in students if s.get("status","active") in ACTIVE_STATUSES]
print(f"Active count: {len(active)}")

# Sort by class then family name
active.sort(key=lambda s: (CLASS_ORDER.get(CLASS_MAP.get(s["class"], "zzz"),999), s["fam"]))

# Renumber
for i, s in enumerate(active, 1):
    s["new_id"] = i

# We need to get megama (track) — it's not stored in students.json yet.
# For existing students we can pull it from the OLD student-data.js by tz.
# Read current student-data.js, extract tz->megama mapping.
megama_by_tz = {}
reg_by_tz = {}
import re as _re
# Read original snapshot if available; else current (might already be overwritten)
ORIG = STUDENT_DATA_JS + ".bak"
import os
src = ORIG if os.path.exists(ORIG) else STUDENT_DATA_JS
with open(src, encoding="utf-8") as f:
    for line in f:
        tz_m = _re.search(r'tz:"(\d+)"', line)
        meg_m = _re.search(r'megama:"(\d+)"', line)
        reg_m = _re.search(r'regDate:"([^"]*)"', line)
        if tz_m:
            tz = tz_m.group(1)
            if meg_m: megama_by_tz[tz] = meg_m.group(1)
            if reg_m: reg_by_tz[tz] = reg_m.group(1)
print(f"Loaded {len(megama_by_tz)} megama mappings from {src}")

# Build new student-data.js content
def js_str(s):
    s = (s or "").replace("\\","\\\\").replace('"','\\"')
    return s

lines = [
    "// ==================== DATA ====================",
    "",
    'const MEGAMA = {"90306":"מחשבים","90603":"עיצוב שיער","91206":"אוטוטרוניקה","91207":"חשמל רכב"};',
    "",
    "const STUDENTS = [",
]

current_class = None
for s in active:
    cls_short = CLASS_MAP.get(s["class"], s["class"])
    if cls_short != current_class:
        lines.append(f"  // {cls_short}")
        current_class = cls_short
    p1 = parent_str(s.get("p1_name",""), s.get("p1_phone",""))
    p2 = parent_str(s.get("p2_name",""), s.get("p2_phone",""))
    megama = megama_by_tz.get(s["tz"], "")
    reg = reg_by_tz.get(s["tz"], "")
    student_phone = s.get("student_phone","") or ""
    gender = (s.get("gender","") or "").strip()
    lines.append(
        '  {'
        f'id:{s["new_id"]},'
        f'last:"{js_str(s["fam"])}",'
        f'first:"{js_str(s["given"])}",'
        f'cls:"{cls_short}",'
        f'gender:"{js_str(gender)}",'
        f'dob:"{js_str(s.get("birth",""))}",'
        f'tz:"{s["tz"]}",'
        f'city:"{js_str(s.get("city",""))}",'
        f'street:"{js_str(s.get("street",""))}",'
        f'num:"{js_str(s.get("house",""))}",'
        f'apt:"{js_str(s.get("apt",""))}",'
        f'phone:"{js_str(student_phone)}",'
        f'parent1:"{js_str(p1)}",'
        f'parent2:"{js_str(p2)}",'
        f'megama:"{megama}",'
        f'regDate:"{reg}",'
        f'status:"{s.get("status","active")}"'
        '},'
    )
lines.append("];")
lines.append("")

with open(STUDENT_DATA_JS, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
print(f"Wrote {STUDENT_DATA_JS} with {len(active)} students")

# Build investment-bank-students.js
bank = []
for s in active:
    cls_short = CLASS_MAP.get(s["class"], s["class"])
    bank.append({
        "id": s["new_id"],
        "first": s["given"],
        "last": s["fam"],
        "cls": cls_short,
        "p1": s.get("p1_phone","") or "",
        "p2": s.get("p2_phone","") or "",
    })

bank_js = (
    "// Minimal student data for Investment Bank only.\n"
    "// No TZ, no DOB, no addresses, no full parent names.\n"
    "// Phones kept only for wa.me parent notifications.\n"
    "// Generated from student-data.js — do not edit manually.\n\n"
    "var BANK_STUDENTS = " + json.dumps(bank, ensure_ascii=False, separators=(",",":")) + ";\n"
)
with open(BANK_STUDENTS_JS, "w", encoding="utf-8") as f:
    f.write(bank_js)
print(f"Wrote {BANK_STUDENTS_JS} with {len(bank)} students")
