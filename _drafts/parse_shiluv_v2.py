#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Parser for "סלי שילוב" (integration baskets) Word document extraction.
Reads FILE 1 section and outputs structured JSON.

Key insight: the Word document was a table with days as columns.
When extracted to text, we lose column position.
For individual student schedules (not staff), entries appear after their period number
but we cannot reliably determine which day each belongs to since columns are merged.

We store schedule as: period -> list of entries (since day cannot be reliably determined
from the flat text).

For staff schedules (שירלי, אליאל, יעל, שמעון, אושר, מירב) which have more entries
per period, we do the same.
"""

import json
import re

INPUT_FILE = r"C:\Users\meyta\.claude\projects\c--Users-meyta-Downloads-ort-presentation-builder\05745cc2-acf9-4cf0-b5d4-8f3ff75b0ac3\tool-results\bhlr33e03.txt"
OUTPUT_FILE = r"C:\Users\meyta\Downloads\ort-presentation-builder\docs\management\shiluv-timetables.json"

CLASS_CODES = ["ט1", "ט2", "י1", "י2", "י3", "יא1", "יא2", "יא3", "יב1", "יב2", "יב3"]
DAYS_HE = ["ראשון", "שני", "שלישי", "רביעי", "חמישי"]
DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday"]

# Staff names (they appear as schedule headers separately)
STAFF_NAMES = {"שירלי", "אליאל", "יעל", "שמעון", "אושר", "מירב", "נעמה", "יסכה",
               "שי", "אלון", "בת שבע", "אדיר", "יוסי", "מוריס", "אשר"}

# Patterns indicating a student individual schedule header
STUDENT_PREFIXES = [
    "מערכת שעות אישית",
    "מערכת אישית",
    "מערכת שעות-",
]

# Patterns for staff schedule headers (name alone or with qualifier)
STAFF_SCHEDULE_NAMES = ["שירלי", "אליאל", "יעל", "שמעון", "אושר", "מירב"]


def read_file1(path):
    """Read only FILE 1 section."""
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


def is_days_row(lines, idx):
    """Check if lines[idx..idx+4] is the days header."""
    if idx + 4 >= len(lines):
        return False
    row = [lines[idx + i].strip() for i in range(5)]
    return row == ["ראשון", "שני", "שלישי", "רביעי", "חמישי"]


def is_yom_rishon_row(lines, idx):
    """Check if lines[idx] starts days header with 'יום ראשון'."""
    if lines[idx].strip() != "יום ראשון":
        return False
    if idx + 4 >= len(lines):
        return False
    rest = [lines[idx + i].strip() for i in range(1, 5)]
    return rest == ["שני", "שלישי", "רביעי", "חמישי"]


def find_days_start(lines, from_idx, lookahead=15):
    """Find the days header row within lookahead lines."""
    for i in range(from_idx, min(from_idx + lookahead, len(lines) - 5)):
        if is_yom_rishon_row(lines, i):
            return i, 5  # returns start idx and how many lines to skip
        if is_days_row(lines, i):
            return i, 5
    return None, 0


def is_student_header(line):
    s = line.strip()
    for p in STUDENT_PREFIXES:
        if s.startswith(p) or p in s:
            return True
    # Catch "מערכת " + known name patterns
    if s.startswith("מערכת ") and len(s) < 60:
        return True
    return False


def determine_status(header):
    if "נושר" in header or "נושרת" in header:
        return "dropped"
    if "עזב" in header or "עזבה" in header:
        return "left"
    return "active"


def extract_student_name_class(header):
    """
    Extract name and class from student header line.
    Returns (name, class_code)
    """
    h = header.strip()

    # Remove common prefixes
    for p in STUDENT_PREFIXES + ["מערכת "]:
        if h.startswith(p):
            h = h[len(p):].strip()
            break

    # Remove status keywords
    for word in ["- עזב", "- עזבה", "- נושר", "- נושרת", "עזב", "עזבה", "נושר", "נושרת"]:
        h = re.sub(re.escape(word), "", h).strip()

    h = h.strip("- ").strip()

    # Try to find class code
    found_class = ""
    for code in sorted(CLASS_CODES, key=len, reverse=True):
        # Match class code as a word boundary
        pattern = r'(?:^|[-\s])' + re.escape(code) + r'(?:$|[-\s])'
        if re.search(pattern, h):
            found_class = code
            # Remove from name
            h = re.sub(r'\s*[-–]\s*' + re.escape(code) + r'\b', '', h)
            h = re.sub(r'\b' + re.escape(code) + r'\b', '', h)
            break

    # If not found, try original header
    if not found_class:
        for code in sorted(CLASS_CODES, key=len, reverse=True):
            if code in header:
                found_class = code
                break

    # Clean up remaining text (specialty like "עיצוב שיער" after dash)
    # Remove trailing "- עיצוב שיער" type suffixes that aren't part of name
    h = re.sub(r'\s*-\s*[א-ת ]+$', lambda m: m.group(0) if len(m.group(0).split()) <= 3 else '', h)

    name = h.strip("- ").strip()
    name = re.sub(r'\s+', ' ', name).strip()

    return name, found_class


def parse_schedule_block(lines, start_idx):
    """
    Parse schedule block after days header.
    Returns (schedule_dict, end_idx).
    schedule_dict: {period_str: [list of entries]}
    """
    schedule = {}
    idx = start_idx
    n = len(lines)
    current_period = None

    STOP_PATTERNS = [
        "תלמידים לטיפול",
        "=== FILE",
        "השלמות",
    ]

    while idx < n:
        line = lines[idx]
        stripped = line.strip()

        # Stop conditions
        if not stripped:
            idx += 1
            continue

        for pat in STOP_PATTERNS:
            if stripped.startswith(pat):
                return schedule, idx

        if is_student_header(stripped):
            return schedule, idx

        # Stop if we hit another days header
        if is_yom_rishon_row(lines, idx) or is_days_row(lines, idx):
            return schedule, idx

        # Stop if we hit a standalone staff schedule name
        if is_standalone_staff_header(lines, idx):
            return schedule, idx

        # Stop if class code alone (next block's class line)
        if stripped in CLASS_CODES:
            return schedule, idx

        if is_period_num(stripped):
            current_period = stripped
            if current_period not in schedule:
                schedule[current_period] = []
        elif current_period is not None:
            # Filter out class codes and pure day names
            if stripped not in CLASS_CODES and stripped not in DAYS_HE and stripped != "יום ראשון":
                if stripped and stripped != "-":
                    schedule[current_period].append(stripped)

        idx += 1

    return schedule, idx


def is_standalone_staff_header(lines, idx):
    """Check if this line is a standalone staff schedule header (e.g. 'שירלי חדש', 'אליאל')."""
    stripped = lines[idx].strip()
    for name in STAFF_SCHEDULE_NAMES:
        if stripped == name:
            # Make sure next few lines look like a schedule (days follow)
            _, skip = find_days_start(lines, idx + 1, 3)
            if skip:
                return True
            # Or it's just a name in the middle of something
            return True
        if stripped.startswith(name) and len(stripped) <= len(name) + 10:
            return True
    return False


def find_all_blocks(lines):
    """
    Main parser: scan through lines and identify all blocks.
    Returns (students, staff, afternoon) lists.
    """
    students = []
    staff = []
    afternoon = []

    n = len(lines)
    idx = 0

    while idx < n:
        line = lines[idx]
        stripped = line.strip()

        if not stripped:
            idx += 1
            continue

        # ===========================
        # Student individual schedule
        # ===========================
        if is_student_header(stripped):
            status = determine_status(stripped)
            name, cls = extract_student_name_class(stripped)
            idx += 1

            # Skip class code line if present
            if idx < n and lines[idx].strip() in CLASS_CODES + [c + " " for c in CLASS_CODES]:
                if not cls:
                    cls = lines[idx].strip().strip()
                idx += 1

            # Find days row
            days_idx, skip = find_days_start(lines, idx, 10)

            if days_idx is not None:
                idx = days_idx + skip  # skip past day names
                schedule, idx = parse_schedule_block(lines, idx)
            else:
                schedule = {}

            # Classify: is this actually an afternoon block?
            if "צהריים" in stripped:
                afternoon.append({
                    "name": name,
                    "class": cls,
                    "schedule": schedule
                })
            elif name:
                students.append({
                    "name": name,
                    "class": cls,
                    "status": status,
                    "schedule": schedule
                })
            continue

        # ===========================
        # Afternoon schedule (מערכת צהריים)
        # ===========================
        if "מערכת צהריים" in stripped:
            h = stripped.replace("מערכת צהריים", "").strip().strip("- ").strip()
            found_class = ""
            for code in sorted(CLASS_CODES, key=len, reverse=True):
                if code in h:
                    found_class = code
                    h = h.replace(code, "").strip()
                    break
            name = h.strip("- ").strip()
            idx += 1

            days_idx, skip = find_days_start(lines, idx, 5)
            aft_data = {}
            if days_idx is not None:
                idx = days_idx + skip
                # Collect time slots and subjects
                times = []
                subjects = []
                teachers = []
                while idx < n:
                    l = lines[idx].strip()
                    if not l or is_student_header(l) or l.startswith("=== FILE"):
                        break
                    if re.match(r'\d{1,2}[.:]\d{2}', l):
                        times.append(l)
                    else:
                        subjects.append(l)
                    idx += 1
                aft_data = {"times": times, "subjects": subjects}

            afternoon.append({
                "name": name,
                "class": found_class,
                "schedule": aft_data
            })
            continue

        # ===========================
        # Staff schedule blocks
        # ===========================
        for sname in STAFF_SCHEDULE_NAMES:
            if stripped == sname or (stripped.startswith(sname) and len(stripped) <= len(sname) + 12):
                days_idx, skip = find_days_start(lines, idx + 1, 5)
                if days_idx is not None:
                    schedule_idx = days_idx + skip
                    schedule, end_idx = parse_schedule_block(lines, schedule_idx)
                    staff.append({
                        "name": stripped,
                        "schedule": schedule
                    })
                    idx = end_idx
                    break
                break

        idx += 1

    return students, staff, afternoon


def merge_staff(staff_list):
    """Merge duplicate staff entries by name prefix."""
    # Group by first token (main name)
    grouped = {}
    for s in staff_list:
        key = s["name"].split()[0].split("-")[0].strip()
        if key not in grouped:
            grouped[key] = {"name": key, "schedule": {}}
        # Merge schedules
        for period, entries in s["schedule"].items():
            if period not in grouped[key]["schedule"]:
                grouped[key]["schedule"][period] = []
            for entry in entries:
                if entry not in grouped[key]["schedule"][period]:
                    grouped[key]["schedule"][period].append(entry)
    return list(grouped.values())


def main():
    print("Reading file...")
    lines = read_file1(INPUT_FILE)
    print(f"  Total lines in FILE 1: {len(lines)}")

    students, staff, afternoon = find_all_blocks(lines)

    # Deduplicate students
    seen = {}
    unique_students = []
    for s in students:
        key = (s["name"].strip(), s["class"])
        if key not in seen:
            seen[key] = True
            unique_students.append(s)

    # Merge staff
    merged_staff = merge_staff(staff)

    print(f"\nResults:")
    print(f"  Students (unique): {len(unique_students)}")
    print(f"  Staff groups: {len(merged_staff)}")
    print(f"  Afternoon entries: {len(afternoon)}")

    result = {
        "students": unique_students,
        "staff": merged_staff,
        "afternoon": afternoon,
        "_meta": {
            "source": "בלר שילוב — סלי שילוב",
            "note": "Schedule entries are stored as lists per period. Day assignment could not be reliably determined from flat text extraction.",
            "total_students": len(unique_students),
            "active": sum(1 for s in unique_students if s["status"] == "active"),
            "left": sum(1 for s in unique_students if s["status"] == "left"),
            "dropped": sum(1 for s in unique_students if s["status"] == "dropped"),
        }
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\nWritten to {OUTPUT_FILE}")

    # Print detailed lists (ASCII-safe)
    print("\n--- STUDENTS ---")
    for s in unique_students:
        m = "" if s["status"] == "active" else f" [{s['status']}]"
        total = sum(len(v) for v in s["schedule"].values())
        print(f"  {s['name']} ({s['class']}){m} | {total} entries")

    print("\n--- STAFF ---")
    for s in merged_staff:
        total = sum(len(v) for v in s["schedule"].values())
        print(f"  {s['name']} | {total} entries")

    print("\n--- AFTERNOON ---")
    for s in afternoon:
        print(f"  {s['name']} ({s['class']})")


if __name__ == "__main__":
    main()
