#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Parser for 'סלי שילוב' (integration baskets) Word document extraction.
Reads FILE 1 section and outputs structured JSON.

The Word doc was a table; when extracted to text, column info (which day)
is lost. We store entries as lists per period number.
"""

import json
import re

INPUT_FILE = r"C:\Users\meyta\.claude\projects\c--Users-meyta-Downloads-ort-presentation-builder\05745cc2-acf9-4cf0-b5d4-8f3ff75b0ac3\tool-results\bhlr33e03.txt"
OUTPUT_FILE = r"C:\Users\meyta\Downloads\ort-presentation-builder\docs\management\shiluv-timetables.json"

CLASS_CODES = ["ט1", "ט2", "י1", "י2", "י3", "יא1", "יא2", "יא3", "יב1", "יב2", "יב3"]

# Staff who appear as standalone schedule headers (NOT as entries within student schedules)
STAFF_HEADERS = ["שירלי חדש", "אליאל", "יעל", "שמעון", "אושר", "מירב"]


def read_file1(path):
    lines = []
    in_file1 = False
    with open(path, encoding="utf-8") as f:
        for line in f:
            stripped = line.rstrip("\n")
            if stripped == "=== FILE 1 ===":
                in_file1 = True
                continue
            if stripped.startswith("=== FILE 2 ==="):
                break
            if in_file1:
                lines.append(stripped)
    return lines


def is_period_num(s):
    return s.strip() in [str(i) for i in range(1, 9)]


def is_days_header_at(lines, idx):
    """
    Check for a days header starting at idx.
    Two forms:
      Form A: line is 'יום ראשון', then שני שלישי רביעי חמישי
      Form B: line is 'ראשון', then שני שלישי רביעי חמישי
    Returns number of lines to skip (5 for form A, 5 for form B) or 0 if no match.
    """
    n = len(lines)
    s = lines[idx].strip()
    if s == "יום ראשון" and idx + 4 < n:
        rest = [lines[idx + i].strip() for i in range(1, 5)]
        if rest == ["שני", "שלישי", "רביעי", "חמישי"]:
            return 5
    if s == "ראשון" and idx + 4 < n:
        rest = [lines[idx + i].strip() for i in range(1, 5)]
        if rest == ["שני", "שלישי", "רביעי", "חמישי"]:
            return 5
    # Also handle "יום ראשון- מעגלים" style
    if s.startswith("יום ראשון") and idx + 4 < n:
        rest = [lines[idx + i].strip() for i in range(1, 5)]
        if rest[0] == "שני" and rest[-1] == "חמישי":
            return 5
    return 0


def find_days_header(lines, start, max_look=12):
    """Scan forward to find a days header row."""
    for i in range(start, min(start + max_look, len(lines))):
        skip = is_days_header_at(lines, i)
        if skip:
            return i, skip
    return None, 0


def is_student_block_header(line):
    """Return True if this line starts a student individual schedule block."""
    s = line.strip()
    student_patterns = [
        "מערכת שעות אישית",
        "מערכת אישית",
        "מערכת שעות-",
    ]
    for p in student_patterns:
        if s.startswith(p) or p in s:
            return True
    # Generic "מערכת שעות " followed by text
    if re.match(r'מערכת שעות\s+\S', s):
        return True
    # "מערכת " followed by a Hebrew name (not "מערכת צהריים")
    if re.match(r'מערכת\s+[א-ת]', s) and "צהריים" not in s:
        return True
    return False


def is_afternoon_block_header(line):
    return "מערכת צהריים" in line.strip()


def is_staff_block_header(line, lines, idx):
    """
    Return True if this line starts a staff schedule block
    (i.e., staff name followed within a few lines by a days header).
    """
    s = line.strip()
    for name in STAFF_HEADERS:
        if s == name or s.startswith(name):
            days_idx, _ = find_days_header(lines, idx + 1, 4)
            if days_idx is not None:
                return True
    return False


def determine_status(header):
    if "נושר" in header or "נושרת" in header:
        return "dropped"
    if "עזב" in header or "עזבה" in header:
        return "left"
    return "active"


def extract_name_class(header):
    """
    Extract student name and class from header.
    """
    h = header.strip()

    # Remove known prefixes
    for p in [
        "מערכת שעות אישית",
        "מערכת אישית",
        "מערכת שעות-",
        "מערכת שעות",
        "מערכת",
    ]:
        if h.startswith(p):
            h = h[len(p):].strip()
            break

    # Remove status keywords (with surrounding punctuation)
    for word in ["- עזב", "- עזבה", "- נושר", "- נושרת",
                 " עזב", " עזבה", " נושר", " נושרת"]:
        h = h.replace(word, "").strip()

    h = h.strip("- ").strip()

    # Find class code
    found_class = ""
    for code in sorted(CLASS_CODES, key=len, reverse=True):
        # Look for class code surrounded by spaces/dashes/start/end
        pattern = r'(?:^|[\s\-–])' + re.escape(code) + r'(?:$|[\s\-–])'
        m = re.search(pattern, h)
        if m:
            found_class = code
            # Remove class code (and surrounding dash/space)
            h = re.sub(r'\s*[-–]?\s*' + re.escape(code) + r'\s*[-–]?\s*', ' ', h)
            break

    # If still not found, try simpler search
    if not found_class:
        for code in sorted(CLASS_CODES, key=len, reverse=True):
            if code in header:
                found_class = code
                break

    # Remove track info after last meaningful dash (e.g. "- עיצוב שיער", "- אוטוטרוניקה")
    # Keep the name clean
    name = re.sub(r'\s+', ' ', h).strip("- ").strip()

    return name, found_class


def parse_schedule_block(lines, start_idx):
    """
    Parse period-based schedule block.
    Returns (schedule, end_idx) where schedule = {period_str: [entries]}.
    Stops when hitting a new block header or end of file.
    """
    schedule = {}
    idx = start_idx
    n = len(lines)
    current_period = None

    while idx < n:
        line = lines[idx]
        s = line.strip()

        if not s:
            idx += 1
            continue

        # Stop conditions
        if s.startswith("=== FILE"):
            break
        if is_student_block_header(s):
            break
        if is_afternoon_block_header(s):
            break
        if is_staff_block_header(s, lines, idx):
            break
        # Stop at days header (new section starting)
        skip = is_days_header_at(lines, idx)
        if skip and current_period is not None:
            # New block's days header
            break

        # "תלמידים לטיפול" - extra note, skip rest of this section
        if s.startswith("תלמידים"):
            # Skip until next student header
            idx += 1
            while idx < n and not is_student_block_header(lines[idx]) and not s.startswith("=== FILE"):
                idx += 1
            break

        # "השלמות" - skip
        if s.startswith("השלמות"):
            idx += 1
            continue

        if is_period_num(s):
            current_period = s
            if current_period not in schedule:
                schedule[current_period] = []
        elif current_period is not None:
            # Filter noise
            if (s not in CLASS_CODES and
                    s not in ["יום ראשון", "ראשון", "שני", "שלישי", "רביעי", "חמישי"] and
                    s != "-" and
                    len(s) > 0):
                schedule[current_period].append(s)

        idx += 1

    return schedule, idx


def parse_afternoon_block(lines, idx):
    """Parse a מערכת צהריים block."""
    header = lines[idx].strip()
    h = header.replace("מערכת צהריים", "").strip().strip("- ").strip()

    found_class = ""
    for code in sorted(CLASS_CODES, key=len, reverse=True):
        if code in h:
            found_class = code
            h = h.replace(code, "").strip()
            break

    name = h.strip("- ").strip()
    idx += 1

    days_idx, skip = find_days_header(lines, idx, 5)
    aft_schedule = {}

    if days_idx is not None:
        idx = days_idx + skip
        times = []
        subjects = []
        while idx < len(lines):
            s = lines[idx].strip()
            if not s:
                idx += 1
                continue
            if (is_student_block_header(s) or is_afternoon_block_header(s) or
                    is_staff_block_header(s, lines, idx) or s.startswith("=== FILE")):
                break
            if re.match(r'\d{1,2}[.:]\d{2}', s):
                times.append(s)
            else:
                subjects.append(s)
            idx += 1
        aft_schedule = {"times": times, "subjects": subjects}

    return {"name": name, "class": found_class, "schedule": aft_schedule}, idx


def main():
    lines = read_file1(INPUT_FILE)
    print(f"Lines in FILE 1: {len(lines)}")

    students = []
    staff = []
    afternoon = []

    idx = 0
    n = len(lines)

    while idx < n:
        line = lines[idx]
        s = line.strip()

        if not s:
            idx += 1
            continue

        # =====================
        # Student block
        # =====================
        if is_student_block_header(s) and not is_afternoon_block_header(s):
            status = determine_status(s)
            name, cls = extract_name_class(s)
            idx += 1

            # Next line may be the class code (e.g. "י1 ")
            if idx < n:
                next_s = lines[idx].strip()
                if next_s in CLASS_CODES + [c.strip() for c in CLASS_CODES]:
                    if not cls:
                        cls = next_s
                    idx += 1

            # Find days header
            days_idx, skip = find_days_header(lines, idx, 8)
            if days_idx is not None:
                idx = days_idx + skip
                schedule, idx = parse_schedule_block(lines, idx)
            else:
                schedule = {}

            if name:
                students.append({
                    "name": name,
                    "class": cls,
                    "status": status,
                    "schedule": schedule
                })
            continue

        # =====================
        # Afternoon block
        # =====================
        if is_afternoon_block_header(s):
            entry, idx = parse_afternoon_block(lines, idx)
            afternoon.append(entry)
            continue

        # =====================
        # Staff block
        # =====================
        if is_staff_block_header(s, lines, idx):
            staff_name = s
            days_idx, skip = find_days_header(lines, idx + 1, 4)
            if days_idx is not None:
                schedule_start = days_idx + skip
                schedule, idx = parse_schedule_block(lines, schedule_start)
                staff.append({"name": staff_name, "schedule": schedule})
            else:
                idx += 1
            continue

        idx += 1

    # Deduplicate students
    seen = {}
    unique_students = []
    for s in students:
        key = s["name"].strip()
        if key and key not in seen:
            seen[key] = True
            unique_students.append(s)

    print(f"Students: {len(unique_students)}")
    print(f"Staff: {len(staff)}")
    print(f"Afternoon: {len(afternoon)}")

    result = {
        "students": unique_students,
        "staff": staff,
        "afternoon": afternoon,
        "_meta": {
            "total_students": len(unique_students),
            "active": sum(1 for s in unique_students if s["status"] == "active"),
            "left": sum(1 for s in unique_students if s["status"] == "left"),
            "dropped": sum(1 for s in unique_students if s["status"] == "dropped"),
            "note": "Period entries are stored as flat lists. Day cannot be reliably determined from flat text extraction of Word table."
        }
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"Written: {OUTPUT_FILE}")
    return unique_students, staff, afternoon


if __name__ == "__main__":
    main()
