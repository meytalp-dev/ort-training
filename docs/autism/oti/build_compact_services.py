"""
מצמצם את all-enriched.json לגרסה קומפקטית עבור הצ'אטבוט.
מטרה: כל שירות ב-~80 tokens במקום ~500.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "data" / "all-enriched.json"
DST = ROOT / "data" / "services-compact.json"


def first_value(s, sep=" / "):
    """מחזיר את הערך הראשון משדה רב-ערכי."""
    if not s:
        return ""
    parts = [p.strip() for p in s.split(sep) if p.strip()]
    return parts[0] if parts else ""


def first_url(s):
    """מחלץ URL ראשון תקני מתוך שדה האתר."""
    if not s:
        return ""
    matches = re.findall(r'https?://[^\s/]+(?:/[^\s]*)?', s)
    if matches:
        return matches[0].rstrip(",;:")
    domain_match = re.search(r'\b[a-z0-9-]+\.(?:org\.il|co\.il|com|net|gov\.il)(?:/[^\s]*)?\b', s)
    return f"https://{domain_match.group()}" if domain_match else ""


def first_phone(s):
    """מחלץ טלפון ראשון תקני."""
    if not s:
        return ""
    parts = [p.strip() for p in s.split("/") if p.strip()]
    for p in parts:
        clean = re.sub(r'[^\d*\-]', '', p)
        if len(clean) >= 7:
            return p
    return ""


def truncate(text, max_chars):
    """קוצר טקסט לאורך מקסימלי."""
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text).strip()
    if len(text) <= max_chars:
        return text
    cut = text[:max_chars]
    last_space = cut.rfind(" ")
    return (cut[:last_space] if last_space > max_chars * 0.7 else cut).rstrip(" ,.") + "..."


def compact_service(s, idx):
    """ממיר שירות מורחב לפורמט קומפקטי."""
    name = (s.get("שם") or "").strip()
    if not name:
        return None

    desc_parts = []
    quote = (s.get("הקשר/ציטוט") or "").strip()
    notes = (s.get("הערות") or "").strip()
    spec = (s.get("התמחות") or "").strip()

    if spec:
        spec_first = " / ".join([p.strip() for p in spec.split("/")[:3] if p.strip()])
        desc_parts.append(spec_first)
    if quote and len(quote) > 20:
        desc_parts.append(quote)
    elif notes and len(notes) > 20:
        desc_parts.append(notes)

    description = truncate(" · ".join(desc_parts), 220)

    return {
        "id": idx,
        "name": name,
        "cat": (s.get("קטגוריה") or "").strip(),
        "ages": s.get("ageGroups") or [],
        "topics": s.get("topics") or [],
        "professions": s.get("professions") or [],
        "region": first_value(s.get("אזור") or ""),
        "phone": first_phone(s.get("טלפון") or ""),
        "url": first_url(s.get("אתר") or ""),
        "desc": description,
        "rec": (s.get("המלצה") or "").strip(),
        "freq": int(s.get("תדירות אזכור") or 0),
        "group": s.get("service_group") or "",
        "subgroups": s.get("adultSubgroups") or [],
    }


def main():
    with open(SRC, encoding="utf-8") as f:
        services = json.load(f)

    compact = []
    for i, s in enumerate(services):
        c = compact_service(s, i)
        if c:
            compact.append(c)

    compact.sort(key=lambda x: -x["freq"])

    with open(DST, "w", encoding="utf-8") as f:
        json.dump(compact, f, ensure_ascii=False, indent=1)

    src_size = SRC.stat().st_size
    dst_size = DST.stat().st_size
    print(f"Source: {src_size:,} bytes ({len(services)} services)")
    print(f"Compact: {dst_size:,} bytes ({len(compact)} services)")
    print(f"Reduction: {(1 - dst_size/src_size)*100:.1f}%")
    print(f"Avg per service: {dst_size // len(compact)} bytes")


if __name__ == "__main__":
    main()
