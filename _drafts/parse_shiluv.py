#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Parser for "סלי שילוב" (integration baskets) Word document extraction.
Reads FILE 1 section and outputs structured JSON.
"""

import json
import re
import sys

INPUT_FILE = r"C:\Users\meyta\.claude\projects\c--Users-meyta-Downloads-ort-presentation-builder\05745cc2-acf9-4cf0-b5d4-8f3ff75b0ac3\tool-results\bhlr33e03.txt"
OUTPUT_FILE = r"C:\Users\meyta\Downloads\ort-presentation-builder\docs\management\shiluv-timetables.json"

DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי"]
DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday"]

CLASS_CODES = ["ט1", "ט2", "י1", "י2", "י3", "יא1", "יא2", "יא3", "יב1", "יב2", "יב3"]

# Staff names that appear as schedule headers
STAFF_NAMES = ["שירלי", "אליאל", "יעל", "שמעון", "אושר", "מירב"]

def read_file1(path):
    lines = []
    with open(path, encoding="utf-8") as f:
        in_file1 = False
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

def is_period_number(s):
    """Check if string is a period number (1-8)."""
    return s.strip() in [str(i) for i in range(1, 9)]

def is_day_header(s):
    """Check if line is a day header."""
    return s.strip() in ["יום ראשון"] + DAYS

def is_days_row(lines, idx):
    """Check if at idx we have a sequence of 5 day names (the header row)."""
    # look for 'יום ראשון' or standalone day names
    s = lines[idx].strip()
    if s == "יום ראשון":
        # check next 4 are שני שלישי רביעי חמישי
        rest = [lines[idx+i].strip() if idx+i < len(lines) else "" for i in range(1, 5)]
        return rest == ["שני", "שלישי", "רביעי", "חמישי"]
    return False

def is_class_code(s):
    return s.strip() in CLASS_CODES or s.strip().rstrip() in [c + " " for c in CLASS_CODES] or s.strip() in [c + " " for c in CLASS_CODES]

def is_student_header(s):
    """Check if this line is a student schedule header."""
    patterns = [
        r"מערכת שעות אישית",
        r"מערכת אישית",
        r"מערכת שעות-",
        r"מערכת שעות ",
        r"מערכת ",
    ]
    for p in patterns:
        if p in s:
            return True
    return False

def determine_status(header):
    if "נושר" in header or "נושרת" in header:
        return "dropped"
    if "עזב" in header or "עזבה" in header:
        return "left"
    return "active"

def extract_name_class(header):
    """Extract student name and class from header line."""
    # Remove leading/trailing spaces
    h = header.strip()

    # Remove common prefixes
    prefixes = [
        "מערכת שעות אישית",
        "מערכת אישית",
        "מערכת שעות-",
        "מערכת שעות ",
        "מערכת ",
    ]
    for p in prefixes:
        if h.startswith(p):
            h = h[len(p):].strip()
            break
        if p.rstrip() in h:
            h = h[h.index(p.rstrip()) + len(p.rstrip()):].strip()
            break

    # Remove status words
    for word in ["עזב", "עזבה", "נושר", "נושרת"]:
        h = h.replace(word, "").strip()

    # Remove trailing dashes
    h = h.strip("- ").strip()

    # Try to find class code
    found_class = ""
    for code in sorted(CLASS_CODES, key=len, reverse=True):
        # Look for class code as standalone word or with surrounding chars
        if re.search(r'(?<![א-ת])' + re.escape(code) + r'(?![א-ת0-9])', h):
            found_class = code
            break

    # Remove class code and surrounding punctuation from name
    if found_class:
        name = re.sub(r'\s*[-–]\s*' + re.escape(found_class) + r'\s*[-–]?\s*', ' ', h)
        name = re.sub(re.escape(found_class), '', name)
    else:
        name = h

    # Clean up name: remove specialty/track info (after last dash)
    # e.g. "י1- עיצוב שיער" → name is before, class is י1
    name = name.strip("- ").strip()

    # If class not found, try to find it in original header
    if not found_class:
        for code in sorted(CLASS_CODES, key=len, reverse=True):
            if code in header:
                found_class = code
                break

    return name, found_class

def parse_schedule_block(lines, start_idx):
    """
    Parse a schedule block starting after the days row.
    Returns a dict with keys sunday..thursday, each mapping period -> content.
    Also returns end index.
    """
    schedule = {d: {} for d in DAY_KEYS}

    idx = start_idx
    n = len(lines)

    # We expect: period number line, then 0-5 entries for that period across the days
    # The entries appear one per day slot that has content (empty slots are skipped)
    # We track which day we're on by counting entries per period

    # But the format is actually: for each period, entries appear in day order
    # with empty days having no line. So we can't tell which day without counting.
    # However the schedule is always 5 days, and entries appear in the order the days appear.

    # Strategy: collect all content lines between period markers and distribute
    # across days 0-4 in order. But we don't know how many per period.

    # Better strategy: since entries appear in day-order for each period,
    # and the days header always has exactly 5 days (ראשון שני שלישי רביעי חמישי),
    # we assume entries per period are "as many as there are non-period lines before next period"
    # and we just assign them day[0], day[1], ... up to 5.

    # Actually looking at examples more carefully:
    # Period 1: שמעון → that's Sunday slot for שמעון
    # Period 2: שמעון → Sunday
    # Period 3: (empty)
    # Period 4: שמעון → Sunday?
    # But in student blocks there are multiple entries per period sometimes.

    # The real issue: a period can have 0-5 entries (one per day).
    # We don't know which day each belongs to without the table structure.
    #
    # Given the messiness, we'll do best-effort:
    # collect content per period, assign to days 0,1,2,3,4 in order.

    current_period = None
    period_entries = []

    def flush_period(period, entries):
        if period is None:
            return
        for i, entry in enumerate(entries):
            if i < 5 and entry.strip():
                schedule[DAY_KEYS[i]][str(period)] = entry.strip()

    while idx < n:
        line = lines[idx].strip()

        # Stop conditions
        if line.startswith("=== FILE"):
            break
        if is_student_header(line) or is_staff_name_header(line, line):
            break
        if is_days_row(lines, idx):
            break
        # Stop at "תלמידים לטיפול" or similar
        if line.startswith("תלמידים") or line.startswith("השלמות"):
            # skip until end or next block
            while idx < n and not is_student_header(lines[idx]) and not is_period_number(lines[idx]):
                idx += 1
            break

        if is_period_number(line):
            flush_period(current_period, period_entries)
            current_period = int(line.strip())
            period_entries = []
        elif line and current_period is not None:
            # This is an entry for current period
            # Ignore class-only lines that are just restating class code
            if line not in CLASS_CODES and line.rstrip() not in [c + " " for c in CLASS_CODES]:
                period_entries.append(line)

        idx += 1

    flush_period(current_period, period_entries)
    return schedule, idx

def is_staff_name_header(line, orig):
    """Check if this is a standalone staff schedule header."""
    # Staff schedules start with the staff name alone on a line
    stripped = line.strip()
    if stripped in STAFF_NAMES:
        return True
    # Also patterns like "שירלי חדש"
    for name in STAFF_NAMES:
        if stripped.startswith(name) and len(stripped) < 20:
            return True
    return False

def parse_staff_schedule(lines, name_line_idx):
    """Parse a staff schedule starting at the name line."""
    staff_name = lines[name_line_idx].strip()

    # Find days row
    idx = name_line_idx + 1
    n = len(lines)

    # Skip to days row
    while idx < n and not is_days_row(lines, idx):
        idx += 1

    if idx >= n:
        return {"name": staff_name, "schedule": {}}, name_line_idx + 1

    idx += 5  # skip 5 day names
    schedule, end_idx = parse_schedule_block(lines, idx)
    return {"name": staff_name, "schedule": schedule}, end_idx

def parse_afternoon_block(lines, start_idx):
    """Parse afternoon (צהריים) schedule blocks."""
    afternoon = []
    idx = start_idx
    n = len(lines)

    current_entry = None

    while idx < n:
        line = lines[idx].strip()

        if line.startswith("=== FILE"):
            break

        # Check for afternoon block header
        if "צהריים" in line and "מערכת" in line:
            # Extract name and class
            h = line
            h = re.sub(r"מערכת צהריים", "", h).strip()
            h = re.sub(r"מערכת שעות צהריים", "", h).strip()

            # Find class
            found_class = ""
            for code in sorted(CLASS_CODES, key=len, reverse=True):
                if code in h:
                    found_class = code
                    h = h.replace(code, "").strip()
                    break

            name = h.strip("- ").strip()
            current_entry = {"name": name, "class": found_class, "schedule": {}}
            afternoon.append(current_entry)

        idx += 1

    return afternoon, idx

def parse_file(path):
    lines = read_file1(path)

    students = []
    staff = []
    afternoon = []

    n = len(lines)
    idx = 0

    # First pass: identify all class-level blocks at the start (ט1, ט2 etc.)
    # These are class schedules for support staff, not individual students.
    # We'll skip them.

    while idx < n:
        line = lines[idx]
        stripped = line.strip()

        if not stripped:
            idx += 1
            continue

        # Check for student individual schedule header
        if is_student_header(stripped):
            status = determine_status(stripped)
            name, cls = extract_name_class(stripped)

            idx += 1
            # Next line might be the class code
            if idx < n and lines[idx].strip() in CLASS_CODES + [c + " " for c in CLASS_CODES]:
                if not cls:
                    cls = lines[idx].strip().strip()
                idx += 1

            # Find days row
            while idx < n and not is_days_row(lines, idx):
                # If we hit another student header, stop
                if is_student_header(lines[idx]):
                    break
                idx += 1

            if idx < n and is_days_row(lines, idx):
                idx += 5  # skip 5 day names
                schedule, idx = parse_schedule_block(lines, idx)
            else:
                schedule = {d: {} for d in DAY_KEYS}

            if name:
                students.append({
                    "name": name,
                    "class": cls,
                    "status": status,
                    "schedule": schedule
                })
            continue

        # Check for afternoon schedule
        if "מערכת צהריים" in stripped:
            # Parse afternoon entry
            h = stripped
            h = re.sub(r"מערכת צהריים", "", h).strip()
            found_class = ""
            for code in sorted(CLASS_CODES, key=len, reverse=True):
                if code in h:
                    found_class = code
                    h = re.sub(re.escape(code), "", h).strip()
                    break
            name = h.strip("- ").strip()

            idx += 1
            # find days row
            while idx < n and not is_days_row(lines, idx):
                if is_student_header(lines[idx]):
                    break
                idx += 1

            aft_schedule = {}
            if idx < n and is_days_row(lines, idx):
                idx += 5
                # For afternoon, entries have time slots instead of period numbers
                # Collect as-is
                times_row = []
                subjects_row = []
                teachers_row = []

                while idx < n:
                    l = lines[idx].strip()
                    if not l or is_student_header(l) or l.startswith("=== FILE"):
                        break
                    if re.match(r'\d{1,2}[.:]\d{2}', l):
                        times_row.append(l)
                    else:
                        subjects_row.append(l)
                    idx += 1

                aft_schedule = {"times": times_row, "subjects": subjects_row}

            if name:
                afternoon.append({
                    "name": name,
                    "class": found_class,
                    "schedule": aft_schedule
                })
            continue

        # Check for staff schedule
        # Staff appear with their name followed by days
        staff_match = None
        for sname in STAFF_NAMES:
            if stripped == sname or (stripped.startswith(sname) and len(stripped) < 25 and ":" not in stripped):
                staff_match = sname
                break

        if staff_match:
            entry_name = stripped
            idx += 1
            # Check for days pattern
            look = idx
            while look < n and look < idx + 5:
                if is_days_row(lines, look):
                    break
                look += 1

            if look < n and is_days_row(lines, look):
                idx = look + 5  # skip days
                schedule, idx = parse_schedule_block(lines, idx)
                staff.append({"name": entry_name, "schedule": schedule})
                continue
            # else not a real staff block, fall through

        idx += 1

    return students, staff, afternoon

def main():
    print("Reading file...")
    students, staff, afternoon = parse_file(INPUT_FILE)

    print(f"Found {len(students)} students, {len(staff)} staff, {len(afternoon)} afternoon entries")

    # Deduplicate students by name+class
    seen = set()
    unique_students = []
    for s in students:
        key = (s["name"], s["class"])
        if key not in seen:
            seen.add(key)
            unique_students.append(s)

    print(f"After dedup: {len(unique_students)} unique students")

    result = {
        "students": unique_students,
        "staff": staff,
        "afternoon": afternoon
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"Written to {OUTPUT_FILE}")

    # Print summary
    print("\n=== Student list ===")
    for s in unique_students:
        status_marker = " [עזב]" if s["status"] == "left" else " [נושר]" if s["status"] == "dropped" else ""
        print(f"  {s['name']} ({s['class']}){status_marker}")

    print("\n=== Staff list ===")
    for s in staff:
        print(f"  {s['name']}")

    print("\n=== Afternoon list ===")
    for s in afternoon:
        print(f"  {s['name']} ({s['class']})")

if __name__ == "__main__":
    main()
