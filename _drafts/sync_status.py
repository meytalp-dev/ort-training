import csv, json

CSV_PATH = r"c:\Users\meyta\Downloads\student-roster.csv"
JSON_PATH = r"c:\Users\meyta\Downloads\ort-presentation-builder\_drafts\students.json"

STATUS_MAP = {
    "כל התלמידים": "active",
    "נשירה סמויה": "hidden",
    "נשירה גלויה": "visible",
    "להוריד":      "removed",
}

with open(CSV_PATH, encoding="utf-8-sig") as f:
    rows = list(csv.DictReader(f))

status_by_tz = {r["ת.ז"]: STATUS_MAP[r["סטטוס"]] for r in rows}

with open(JSON_PATH, encoding="utf-8") as f:
    students = json.load(f)

for s in students:
    s["status"] = status_by_tz.get(s["tz"], "active")

with open(JSON_PATH, "w", encoding="utf-8") as f:
    json.dump(students, f, ensure_ascii=False, indent=2)

# Build active list per Meytal's rule: active + hidden (NOT visible, NOT removed)
active = [s for s in students if s["status"] in ("active","hidden")]
print(f"Total: {len(students)}")
print(f"  active: {sum(1 for s in students if s['status']=='active')}")
print(f"  hidden: {sum(1 for s in students if s['status']=='hidden')}")
print(f"  visible: {sum(1 for s in students if s['status']=='visible')}")
print(f"  removed: {sum(1 for s in students if s['status']=='removed')}")
print(f"\nActive roster (active+hidden): {len(active)}")
print(f"Active only:                    {sum(1 for s in students if s['status']=='active')}")
