# -*- coding: utf-8 -*-
"""
בונה את 9 קבצי ה-CSV (הכול + 8 קטגוריות) מ-all-enriched.json
לתיקיית docs/autism/oti/data/csv/ — מתפרסם דרך GitHub Pages.
משמש את build-sheet.gs להרכבת Google Sheet עם 9 טאבים.
"""

import csv
import json
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "data" / "all-enriched.json"
OUT_DIR = ROOT / "data" / "csv"

COLUMNS = [
    "שם", "קטגוריה", "תת-קטגוריה", "גילאים", "אזור",
    "טלפון", "אתר", "הקשר/ציטוט", "מקור", "תדירות אזכור",
]

CATEGORY_FILES = {
    "מסגרות חינוך": "education.csv",
    "טיפולים ומטפלים": "therapists.csv",
    "אבחון והערכה": "diagnosis.csv",
    "שירותים לבוגרים": "adults.csv",
    "זכויות ורווחה": "rights.csv",
    "ארגונים ועמותות": "orgs.csv",
    "קייטנות ופנאי": "camps.csv",
    "ציוד ועזרים": "equipment.csv",
}


def write_csv(path: Path, items):
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(COLUMNS)
        for it in items:
            w.writerow([str(it.get(c, "") or "") for c in COLUMNS])


def main():
    data = json.loads(SRC.read_text(encoding="utf-8"))
    data_sorted = sorted(
        data,
        key=lambda x: (x.get("קטגוריה", ""), x.get("תת-קטגוריה", ""), x.get("שם", "")),
    )

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    write_csv(OUT_DIR / "all.csv", data_sorted)
    print(f"all.csv: {len(data_sorted)} rows")

    by_cat = {}
    for it in data_sorted:
        by_cat.setdefault(it.get("קטגוריה", ""), []).append(it)

    for cat, fname in CATEGORY_FILES.items():
        items = by_cat.get(cat, [])
        write_csv(OUT_DIR / fname, items)
        print(f"{fname}: {len(items)} rows")


if __name__ == "__main__":
    main()
