"""
Parser for adapted (241), 30% (282), and olim (274) exams.
Reuses logic from parse_v3.py but adapts for non-281 exams.
"""
import re
import json
from pathlib import Path
from parse_v3 import (
    clean_pymupdf_text,
    find_lashon_start,
    split_questions,
    detect_gizras,
    detect_topic,
    detect_track,
    YEAR_HE,
    MOED_HE,
)

EXTRACT_DIR = Path(__file__).parent / "extracted-adapted"
OUTPUT_PATH = Path(__file__).parent / "questions-bank-adapted.json"

TRACK_LABEL = {
    "241": ("adapted", "011241", "מותאם 70%"),
    "282": ("thirty_percent", "011282", "שאלון 30%"),
    "274": ("olim_hadashim", "011274", "עולים חדשים"),
}

HEBREW_YEAR_TO_GREG = {
    'תשע"ו': 2016, "תשע״ו": 2016, "תשעו": 2016,
    'תשע"ז': 2017, "תשע״ז": 2017, "תשעז": 2017,
    'תשע"ח': 2018, "תשע״ח": 2018, "תשעח": 2018,
    'תשע"ט': 2019, "תשע״ט": 2019, "תשעט": 2019,
    'תש"ף': 2020, "תש״ף": 2020, "תשף": 2020,
    'תשפ"א': 2021, "תשפ״א": 2021, "תשפא": 2021,
    'תשפ"ב': 2022, "תשפ״ב": 2022, "תשפב": 2022,
    'תשפ"ג': 2023, "תשפ״ג": 2023, "תשפג": 2023,
    'תשפ"ד': 2024, "תשפ״ד": 2024, "תשפד": 2024,
    'תשפ"ה': 2025, "תשפ״ה": 2025, "תשפה": 2025,
    'תשפ"ו': 2026, "תשפ״ו": 2026, "תשפו": 2026,
}


def detect_year_moed(text: str, fname: str):
    """Return (year:int|None, moed:str|None)."""
    # Try Gregorian year + Hebrew moed
    m = re.search(r"(20\d{2})\s*,?\s*(קיץ|חורף|אביב|סתיו)\s*(תש[ע״\"פ][א-ת״\"]?[א-ת]?)?", text[:5000])
    year = None
    moed = None
    if m:
        year = int(m.group(1))
        moed_he = m.group(2)
        moed = {"קיץ": "summer", "חורף": "winter"}.get(moed_he, moed_he)

    # Detect moed B / special
    if year and re.search(r"קיץ\s+תשפ[״\"][א-ת]\s*[-–—]\s*מועד\s+ב|מועד\s+ב\s*'", text[:5000]):
        moed = "summerB"
    elif year and re.search(r"מועד\s+מיוחד|חיילים|אחרי\s*מועד", text[:5000]):
        moed = "summer-special"

    # If not found via Gregorian, try Hebrew years
    if not year:
        for h, g in HEBREW_YEAR_TO_GREG.items():
            if h in text[:5000]:
                year = g
                break

    # If still not found, guess from filename
    if not year:
        yr_match = re.search(r"(20\d{2})", fname)
        if yr_match:
            year = int(yr_match.group(1))
        else:
            # Look for short forms in filename
            if "2023" in fname or "tashpag" in fname.lower() or "tshpag" in fname.lower():
                year = 2023
            elif "2022" in fname or "tashpb" in fname.lower():
                year = 2022
            elif "2021" in fname or "tashpa" in fname.lower():
                year = 2021
            elif "2020" in fname:
                year = 2020

    if not moed and year:
        # Guess from filename
        fl = fname.lower()
        if "summer2023b" in fl or "summerb" in fl or "moedb" in fl or "-b-" in fl:
            moed = "summerB"
        elif "win" in fl or "winter" in fl:
            moed = "winter"
        elif "sum" in fl or "summer" in fl or "kayitz" in fl:
            moed = "summer"

    return year, moed


def is_pitron(text: str, fname: str) -> bool:
    """Detect if file is a pitron (answer key) rather than the exam itself."""
    fname_lower = fname.lower()
    if "pitron" in fname_lower or "pitaron" in fname_lower or "tshuvon" in fname_lower:
        return True
    if "solution" in fname_lower or "answer" in fname_lower:
        return True
    head = text[:3000]
    if "הצעה לפתרון" in head or "הצעת פתרון" in head or "תשובון" in head:
        return True
    if head.count("פתרון") > 3:
        return True
    return False


def parse_text(text: str, year: int):
    """Parse cleaned text → list of questions."""
    cleaned = clean_pymupdf_text(text)
    start = find_lashon_start(cleaned)
    if start < 0:
        return []
    section = cleaned[start:]
    return split_questions(section)


def parse_pitron_text(text: str):
    """Parse pitron text → {qnum: answer}."""
    cleaned = clean_pymupdf_text(text)
    start = find_lashon_start(cleaned)
    if start > 0:
        cleaned = cleaned[start:]
    qs = split_questions(cleaned)
    return {qnum: atext for qnum, atext in qs if qnum.isdigit() and 5 <= int(qnum) <= 18}


def make_key(year, moed):
    if not year:
        return None
    return f"{year}-{moed or 'unknown'}"


def main():
    all_q = []
    stats = {"241": 0, "282": 0, "274": 0}

    for track_code, (track_name, exam_code, track_label) in TRACK_LABEL.items():
        src = EXTRACT_DIR / track_code
        if not src.exists():
            print(f"  SKIP {track_code}: dir not found")
            continue
        print(f"\n=== Track {track_code} ({track_label}) ===")

        # First pass — collect files into pairs (exam + pitron) by year-moed
        files = sorted(src.glob("*.txt"))
        exams = {}  # key -> [(fname, text)]
        pitrons = {}  # key -> {qnum: answer}

        for fp in files:
            text = fp.read_text(encoding="utf-8")
            year, moed = detect_year_moed(text, fp.name)
            key = make_key(year, moed)
            if not key:
                # Try fallback
                key = f"unknown-{fp.stem}"
            if is_pitron(text, fp.name):
                # Merge pitron answers
                if key not in pitrons:
                    pitrons[key] = {}
                pitrons[key].update(parse_pitron_text(text))
            else:
                exams.setdefault(key, []).append((fp, text, year, moed))

        # Second pass — parse exams
        for key, items in exams.items():
            for fp, text, year, moed in items:
                qs = parse_text(text, year or 2024)
                if not qs:
                    print(f"  EMPTY {fp.name} (key={key})")
                    continue
                answers = pitrons.get(key, {})
                for qnum, qtext in qs:
                    answer = answers.get(qnum, "")
                    gizras = detect_gizras(qtext, answer)
                    topics = detect_topic(qtext, gizras)
                    if not topics:
                        topics = [{"topic": "unknown", "subtopic": "unknown", "gizra": None, "matched_keyword": ""}]
                    primary = topics[0]
                    base_track = detect_track(qtext, qnum, year or 2024)
                    q = {
                        "question_num": qnum,
                        "question_text": qtext,
                        "answer_text": answer,
                        "topic": primary["topic"],
                        "subtopic": primary["subtopic"],
                        "gizra": primary["gizra"] or (gizras[0] if gizras else None),
                        "gizras_detected": gizras,
                        "track": base_track,
                        "exam_track": track_name,
                        "exam_code": exam_code,
                        "exam_label": track_label,
                        "all_topics": topics[:6],
                        "has_answer": bool(answer),
                        "exam_id": f"{track_name}-{key}",
                        "year_gregorian": year,
                        "year_hebrew": YEAR_HE.get(year, "?") if year else None,
                        "moed": moed,
                        "moed_hebrew": MOED_HE.get(moed, moed) if moed else None,
                        "source_file": fp.name,
                        "id": f"{track_name}-{key}-q{qnum}",
                    }
                    all_q.append(q)
                    stats[track_code] += 1
                ans_cnt = sum(1 for qn, _ in qs if qn in answers)
                print(f"  OK {fp.name}: {len(qs)} questions ({ans_cnt} answers)")

    out = {
        "meta": {
            "total_questions": len(all_q),
            "by_track": stats,
            "with_answers": sum(1 for q in all_q if q["has_answer"]),
            "years_covered": sorted(set(q["year_gregorian"] for q in all_q if q["year_gregorian"])),
            "topics_covered": sorted(set(q["topic"] for q in all_q)),
        },
        "questions": all_q,
    }
    OUTPUT_PATH.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nTOTAL: {len(all_q)} questions across {len(stats)} tracks")
    print(f"  Adapted (241): {stats['241']}")
    print(f"  30% (282): {stats['282']}")
    print(f"  Olim (274): {stats['274']}")
    print(f"  With answers: {out['meta']['with_answers']}")


if __name__ == "__main__":
    main()
