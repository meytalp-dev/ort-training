# -*- coding: utf-8 -*-
"""
בונה CSV נקי מאוחד מ-all-enriched.json — ממוין לפי קטגוריה ותת-קטגוריה.
מומר אוטומטית ל-Google Sheet בעת העלאה.
"""

import csv
import json
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "data" / "all-enriched.json"
OUT = Path(r"c:/tmp/oti-services.csv")

COLUMNS = [
    "שם",
    "קטגוריה",
    "תת-קטגוריה",
    "גילאים",
    "אזור",
    "טלפון",
    "אתר",
    "התמחות",
    "המלצה",
    "ביטחון",
    "תדירות אזכור",
    "הקשר/ציטוט",
    "הערות",
]


def main():
    data = json.loads(SRC.read_text(encoding="utf-8"))
    data_sorted = sorted(
        data,
        key=lambda x: (
            x.get("קטגוריה", ""),
            x.get("תת-קטגוריה", ""),
            x.get("שם", ""),
        ),
    )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(COLUMNS)
        for it in data_sorted:
            w.writerow([str(it.get(c, "") or "") for c in COLUMNS])

    size_kb = OUT.stat().st_size / 1024
    print(f"rows: {len(data_sorted)} | file: {OUT} | size: {size_kb:.1f}KB")


if __name__ == "__main__":
    main()
