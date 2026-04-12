#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Final parser for 'סלי שילוב' Word document extraction.
Outputs structured JSON with students, staff, and afternoon schedules.
"""

import json
import re

INPUT_FILE = r"C:\Users\meyta\.claude\projects\c--Users-meyta-Downloads-ort-presentation-builder\05745cc2-acf9-4cf0-b5d4-8f3ff75b0ac3\tool-results\bhlr33e03.txt"
OUTPUT_FILE = r"C:\Users\meyta\Downloads\ort-presentation-builder\docs\management\shiluv-timetables.json"

CLASS_CODES = ["ט1", "ט2", "י1", "י2", "י3", "יא1", "יא2", "יא3", "יב1", "יב2", "יב3"]
DAYS_HE = ["ראשון", "שני", "שלישי", "רביעי", "חמישי"]

# These are staff names that appear as standalone schedule headers
STAFF_BLOCK_NAMES = ["שירלי חדש", "אליאל", "יעל", "שמעון", "אושר", "מירב"]

# These are teacher-only schedules masquerading as "מערכת שעות אישית"
# (they use time slots like 8.30-10.00 instead of period numbers)
TEACHER_NAMES = {"ארז", "דביר", "אליהו", "שלמה"}


def read_file1(path):
    lines = []
    in_file1 = False
    with open(path, encoding="utf-8") as f:
        for raw in f:
            line = raw.rstrip("\n")
            if line == "=== FILE 1 ===":
                in_file1 = True
                continue
            if line.startswith("=== FILE 2 ==="):
                break
            if in_file1:
                lines.append(line)
    return lines


def is_period_num(s):
    return s.strip() in [str(i) for i in range(1, 9)]


def is_time_slot(s):
    """Check if line is a time slot like '8.30-10.00'."""
    return bool(re.match(r'^\d{1,2}[.:]\d{2}\s*[-–]\s*\d{1,2}[.:]\d{2}', s.strip()))


def is_days_header_at(lines, idx):
    """
    Detect days header row starting at idx.
    Returns number of lines to skip, or 0 if not a days header.
    """
    n = len(lines)
    s = lines[idx].strip()
    if idx + 4 >= n:
        return 0
    rest = [lines[idx + i].strip() for i in range(1, 5)]
    # Form: יום ראשון / ראשון / יום ראשון- מעגלים / יום ראשון- ...
    if (s == "יום ראשון" or s.startswith("יום ראשון")) and \
            rest[0] == "שני" and rest[-1] == "חמישי":
        return 5
    if s == "ראשון" and rest == ["שני", "שלישי", "רביעי", "חמישי"]:
        return 5
    return 0


def find_days_header(lines, start, max_look=12):
    for i in range(start, min(start + max_look, len(lines))):
        skip = is_days_header_at(lines, i)
        if skip:
            return i, skip
    return None, 0


def is_student_header(line):
    s = line.strip()
    patterns = [
        "מערכת שעות אישית",
        "מערכת אישית",
        "מערכת שעות-",
    ]
    for p in patterns:
        if s.startswith(p) or p in s:
            return True
    if re.match(r'מערכת שעות\s+\S', s):
        return True
    if re.match(r'מערכת\s+[א-ת]', s) and "צהריים" not in s:
        return True
    return False


def is_afternoon_header(line):
    return "מערכת צהריים" in line.strip()


def is_staff_header(line, lines, idx):
    """Staff schedule block header (name followed by days within 4 lines)."""
    s = line.strip()
    for name in STAFF_BLOCK_NAMES:
        if s == name or s.startswith(name):
            days_idx, _ = find_days_header(lines, idx + 1, 4)
            if days_idx is not None:
                return True
    return False


def is_teacher_schedule(header, lines, idx):
    """
    Check if this 'מערכת שעות אישית' block is actually a teacher schedule
    (uses time slots, not period numbers, and/or teacher name).
    """
    # Extract name from header
    s = header.strip()
    for p in ["מערכת שעות אישית", "מערכת אישית", "מערכת שעות-", "מערכת שעות", "מערכת"]:
        if s.startswith(p):
            name_part = s[len(p):].strip().strip("- ").strip()
            if name_part.split()[0] if name_part.split() else "" in TEACHER_NAMES:
                return True
            break
    # Also check: next day header is followed by time slots (not period numbers)
    days_idx, skip = find_days_header(lines, idx, 5)
    if days_idx is not None:
        check_start = days_idx + skip
        for j in range(check_start, min(check_start + 5, len(lines))):
            ls = lines[j].strip()
            if ls and is_time_slot(ls):
                return True
            if ls and is_period_num(ls):
                return False
    return False


def determine_status(header):
    if "נושר" in header or "נושרת" in header:
        return "dropped"
    if "עזב" in header or "עזבה" in header:
        return "left"
    return "active"


def extract_name_class(header):
    h = header.strip()

    # Remove known prefixes
    for p in ["מערכת שעות אישית", "מערכת אישית", "מערכת שעות-",
              "מערכת שעות", "מערכת"]:
        if h.startswith(p):
            h = h[len(p):].strip()
            break

    # Remove status keywords
    for word in ["- עזב", "- עזבה", "- נושר", "- נושרת",
                 " עזב", " עזבה", " נושר", " נושרת"]:
        h = h.replace(word, "").strip()
    h = h.strip("- ").strip()

    # Find and remove class code
    found_class = ""
    for code in sorted(CLASS_CODES, key=len, reverse=True):
        pattern = r'(?:^|[\s\-–])(' + re.escape(code) + r')(?:$|[\s\-–])'
        if re.search(pattern, h):
            found_class = code
            h = re.sub(r'\s*[-–]?\s*' + re.escape(code) + r'[\s\-–]?', ' ', h)
            break

    if not found_class:
        for code in sorted(CLASS_CODES, key=len, reverse=True):
            if code in header:
                found_class = code
                break

    # Remove specialty/track suffixes (things like "עיצוב שיער", "אוטוטרוניקה")
    # These appear after a dash in the original
    # We keep them in the name but trim leading/trailing dashes
    name = re.sub(r'\s+', ' ', h).strip("- ").strip()

    return name, found_class


def parse_schedule(lines, start_idx):
    """
    Parse period-based schedule. Returns (schedule_dict, end_idx).
    schedule_dict: {period_str: [entries_list]}
    """
    schedule = {}
    idx = start_idx
    n = len(lines)
    current_period = None

    while idx < n:
        s = lines[idx].strip()

        if not s:
            idx += 1
            continue

        # Stop conditions
        if s.startswith("=== FILE"):
            break
        if is_student_header(s):
            break
        if is_afternoon_header(s):
            break
        if is_staff_header(s, lines, idx):
            break

        # Stop at days header (another block starting)
        skip = is_days_header_at(lines, idx)
        if skip and current_period is not None:
            break

        # Skip "תלמידים לטיפול" sections
        if s.startswith("תלמידים"):
            idx += 1
            while idx < n:
                if is_student_header(lines[idx]) or lines[idx].startswith("=== FILE"):
                    break
                idx += 1
            break

        if s.startswith("השלמות"):
            idx += 1
            continue

        if is_period_num(s):
            current_period = s
            if current_period not in schedule:
                schedule[current_period] = []
        elif current_period is not None:
            # Skip day names, class codes, plain dashes
            if (s not in CLASS_CODES and
                    s not in DAYS_HE and
                    s != "יום ראשון" and
                    not s.startswith("יום ") and
                    s != "-" and
                    len(s) > 0):
                schedule[current_period].append(s)

        idx += 1

    return schedule, idx


def parse_teacher_schedule(lines, idx):
    """
    Parse a time-based teacher schedule.
    Returns (entry_dict, end_idx).
    """
    header = lines[idx].strip()
    # Extract name
    for p in ["מערכת שעות אישית", "מערכת שעות", "מערכת"]:
        if header.startswith(p):
            name = header[len(p):].strip().strip("- ").strip()
            break
    else:
        name = header

    idx += 1
    schedule = {}  # day -> list of {time, subject}

    while idx < len(lines):
        s = lines[idx].strip()
        if not s:
            idx += 1
            continue
        if is_student_header(s) or s.startswith("=== FILE"):
            break
        # Day header (not the 5-day format, but "יום ראשון" standalone)
        if s in ["יום ראשון", "יום שני", "יום שלישי", "יום רביעי", "יום חמישי"]:
            day_he = s.replace("יום ", "").strip()
            day_key = {"ראשון": "sunday", "שני": "monday", "שלישי": "tuesday",
                       "רביעי": "wednesday", "חמישי": "thursday"}.get(day_he, day_he)
            if day_key not in schedule:
                schedule[day_key] = []
            idx += 1
            continue
        if is_time_slot(s):
            # collect subjects until next time slot or end
            time_str = s
            idx += 1
            subjects = []
            while idx < len(lines):
                ns = lines[idx].strip()
                if not ns:
                    idx += 1
                    continue
                if is_time_slot(ns) or is_student_header(ns) or ns.startswith("=== FILE"):
                    break
                if ns in ["יום ראשון", "יום שני", "יום שלישי", "יום רביעי", "יום חמישי"]:
                    break
                subjects.append(ns)
                idx += 1
            if subjects:
                # Store under current day if known, else under "unknown"
                current_day = list(schedule.keys())[-1] if schedule else "unknown"
                schedule.setdefault(current_day, []).append({"time": time_str, "subjects": subjects})
            continue
        idx += 1

    return {"name": name, "schedule": schedule}, idx


def parse_afternoon(lines, idx):
    """Parse 'מערכת צהריים' or standalone afternoon entry."""
    line = lines[idx].strip()

    # Check if it's a "name + class" line without מערכת prefix (like "נריה ט1")
    found_class = ""
    name = line
    for code in sorted(CLASS_CODES, key=len, reverse=True):
        if code in line:
            found_class = code
            name = line.replace(code, "").strip().strip("- ").strip()
            break

    # Remove "מערכת צהריים" if present
    if "מערכת צהריים" in name:
        name = name.replace("מערכת צהריים", "").strip().strip("- ").strip()

    idx += 1

    # Find days row (4 days only: ראשון שני שלישי רביעי for afternoon)
    # Format: יום ראשון שני שלישי רביעי (no חמישי)
    schedule = {"times": [], "subjects": [], "teachers": []}

    # Skip to times
    while idx < len(lines):
        s = lines[idx].strip()
        if not s:
            idx += 1
            continue
        if is_student_header(s) or s.startswith("=== FILE") or is_afternoon_header(s):
            break
        # Day names in afternoon context
        if s in DAYS_HE or s.startswith("יום "):
            idx += 1
            continue
        # Time slot
        if re.match(r'\d{1,2}[.:]\d{2}', s):
            schedule["times"].append(s)
        elif s:
            schedule["subjects"].append(s)
        idx += 1

    return {"name": name, "class": found_class, "schedule": schedule}, idx


def main():
    lines = read_file1(INPUT_FILE)
    print(f"Lines in FILE 1: {len(lines)}")

    students = []
    staff = []
    afternoon = []
    teachers = []  # teacher schedules (ארז, דביר, etc.)

    idx = 0
    n = len(lines)

    while idx < n:
        line = lines[idx]
        s = line.strip()

        if not s:
            idx += 1
            continue

        # ==================== STUDENT / TEACHER BLOCK ====================
        if is_student_header(s) and not is_afternoon_header(s):
            # Check if it's actually a teacher
            if is_teacher_schedule(s, lines, idx):
                entry, idx = parse_teacher_schedule(lines, idx)
                teachers.append(entry)
                continue

            status = determine_status(s)
            name, cls = extract_name_class(s)
            idx += 1

            # Next line may be class code
            if idx < n:
                next_s = lines[idx].strip()
                if next_s in CLASS_CODES or next_s.rstrip() in CLASS_CODES:
                    if not cls:
                        cls = next_s.strip()
                    idx += 1

            # Find days header
            days_idx, skip = find_days_header(lines, idx, 8)
            if days_idx is not None:
                idx = days_idx + skip
                schedule, idx = parse_schedule(lines, idx)
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

        # ==================== AFTERNOON BLOCK ====================
        if is_afternoon_header(s):
            entry, idx = parse_afternoon(lines, idx)
            afternoon.append(entry)
            continue

        # ==================== STAFF BLOCK ====================
        if is_staff_header(s, lines, idx):
            staff_name = s
            days_idx, skip = find_days_header(lines, idx + 1, 4)
            if days_idx is not None:
                idx = days_idx + skip
                schedule, idx = parse_schedule(lines, idx)
                staff.append({"name": staff_name, "schedule": schedule})
            else:
                idx += 1
            continue

        # ==================== AFTERNOON WITHOUT PREFIX ====================
        # Lines like "נריה ט1" or "אלמוג יא1" not preceded by מערכת prefix
        # but followed by time slots
        is_aft = False
        for code in CLASS_CODES:
            if s.endswith(code) and not is_student_header(s) and not is_staff_header(s, lines, idx):
                # Check if next few lines have time slots (not period numbers)
                for j in range(idx + 1, min(idx + 8, n)):
                    ns = lines[j].strip()
                    if not ns or ns in DAYS_HE or ns.startswith("יום "):
                        continue
                    if is_time_slot(ns) or re.match(r'\d{1,2}[.:]\d{2}', ns):
                        is_aft = True
                        break
                    if is_period_num(ns) or is_student_header(ns):
                        break
                break

        if is_aft:
            entry, idx = parse_afternoon(lines, idx)
            afternoon.append(entry)
            continue

        idx += 1

    # ==================== DEDUP STUDENTS ====================
    seen = {}
    unique_students = []
    for s in students:
        key = s["name"].strip()
        if key and key not in seen:
            seen[key] = True
            unique_students.append(s)

    # ==================== MERGE STAFF DUPLICATES ====================
    staff_merged = {}
    for s in staff:
        # Get canonical name (first word, removing suffixes like "חדש")
        key = s["name"].split()[0].split("-")[0].strip()
        if key not in staff_merged:
            staff_merged[key] = {"name": key, "schedule": {}}
        for period, entries in s["schedule"].items():
            existing = staff_merged[key]["schedule"].setdefault(period, [])
            for e in entries:
                if e not in existing:
                    existing.append(e)

    staff_list = list(staff_merged.values())

    print(f"\nResults:")
    print(f"  Students: {len(unique_students)}")
    print(f"    Active: {sum(1 for s in unique_students if s['status'] == 'active')}")
    print(f"    Left: {sum(1 for s in unique_students if s['status'] == 'left')}")
    print(f"    Dropped: {sum(1 for s in unique_students if s['status'] == 'dropped')}")
    print(f"  Staff: {len(staff_list)}")
    print(f"  Afternoon entries: {len(afternoon)}")
    print(f"  Teacher schedules (separate): {len(teachers)}")

    result = {
        "students": unique_students,
        "staff": staff_list,
        "afternoon": afternoon,
        "_meta": {
            "total_students": len(unique_students),
            "active": sum(1 for s in unique_students if s["status"] == "active"),
            "left": sum(1 for s in unique_students if s["status"] == "left"),
            "dropped": sum(1 for s in unique_students if s["status"] == "dropped"),
            "note": (
                "Schedule entries are stored as lists per period number. "
                "Day assignment cannot be reliably determined from flat text extraction of Word table. "
                "Staff schedules use the same structure. "
                "Teacher schedules (ארז, דביר, אליהו, שלמה) are stored in '_teachers' key."
            )
        },
        "_teachers": teachers
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\nWritten: {OUTPUT_FILE}")
    return result


if __name__ == "__main__":
    main()
