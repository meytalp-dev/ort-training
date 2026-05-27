# -*- coding: utf-8 -*-
"""
CSV דחוס לטעינה לתוך MCP — בלי שדות מילוליים ארוכים.
"""
import csv
import json
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "data" / "all-enriched.json"
OUT = Path(r"c:/tmp/oti-compact.csv")

COLUMNS = [
    "שם", "קטגוריה", "תת-קטגוריה", "גילאים", "אזור",
    "טלפון", "אתר", "המלצה",
]


def main():
    data = json.loads(SRC.read_text(encoding="utf-8"))
    data_sorted = sorted(
        data,
        key=lambda x: (x.get("קטגוריה", ""), x.get("תת-קטגוריה", ""), x.get("שם", "")),
    )
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(COLUMNS)
        for it in data_sorted:
            row = []
            for c in COLUMNS:
                v = str(it.get(c, "") or "")
                if c == "התמחות" and len(v) > 200:
                    v = v[:200] + "…"
                row.append(v)
            w.writerow(row)
    print(f"rows: {len(data_sorted)} | size: {OUT.stat().st_size/1024:.1f}KB | {OUT}")


if __name__ == "__main__":
    main()
