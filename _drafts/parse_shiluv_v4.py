#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Final v4 parser for 'סלי שילוב' (integration baskets) Word document extraction.
Outputs structured JSON.
"""

import json
import re

INPUT_FILE = r"C:\Users\meyta\.claude\projects\c--Users-meyta-Downloads-ort-presentation-builder\05745cc2-acf9-4cf0-b5d4-8f3ff75b0ac3\tool-results\bhlr33e03.txt"
OUTPUT_FILE = r"C:\Users\meyta\Downloads\ort-presentation-builder\docs\management\shiluv-timetables.json"

CLASS_CODES = ["ט1", "ט2", "י1", "י2", "י3", "יא1", "יא2", "יא3", "יב1", "יב2", "יב3"]
DAYS_HE = ["ראשון", "שני", "שלישי", "רביעי", "חמישי"]

# Staff block header names (appear as standalone lines followed by 5-day header)
STAFF_BLOCK_NAMES = ["שירלי חדש", "אליאל", "יעל", "שמעון", "אושר", "מירב"]


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
    """Check if line is a time slot like '8.30-10.00' or '13.30-15.30'."""
    return bool(re.match(r'^\d{1,2}[.:]\d{2}\s*[-–]\s*\d{1,2}[.:]\d{2}', s.strip()))


def is_5day_header_at(lines, idx):
    """
    Check for standard 5-day header starting at idx.
    Form: יום ראשון / שני / שלישי / רביעי / חמישי
    Returns lines-to-skip (5) or 0.
    """
    n = len(lines)
    s = lines[idx].strip()
    if idx + 4 >= n:
        return 0
    rest = [lines[idx + i].strip() for i in range(1, 5)]
    if (s == "יום ראשון" or s.startswith("יום ראשון")) and \
            rest[0] == "שני" and rest[-1] == "חמישי":
        return 5
    if s == "ראשון" and rest == ["שני", "שלישי", "רביעי", "חמישי"]:
        return 5
    return 0


def find_5day_header(lines, start, max_look=12):
    for i in range(start, min(start + max_look, len(lines))):
        skip = is_5day_header_at(lines, i)
        if skip:
            return i, skip
    return None, 0


def is_student_header(line):
    s = line.strip()
    patterns = ["מערכת שעות אישית", "מערכת אישית", "מערכת שעות-"]
    for p in patterns:
        if p in s:
            return True
    if re.match(r'מערכת שעות\s+\S', s):
        return True
    if re.match(r'מערכת\s+[א-ת]', s) and "צהריים" not in s:
        return True
    return False


def is_afternoon_header(line):
    return "מערכת צהריים" in line.strip()


def is_staff_block_header(line, lines, idx):
    """
    Staff block: staff name followed IMMEDIATELY by 5-day header.
    'Immediately' means the very next non-empty line is the start of the 5-day header.
    Also: to avoid matching staff names appearing as entries in student schedules,
    we require that the 5-day header starts at idx+1 or idx+2 (allowing one blank line).
    """
    s = line.strip()
    for name in STAFF_BLOCK_NAMES:
        if s == name or s.startswith(name):
            # The next non-empty line must be the 5-day header itself
            j = idx + 1
            n = len(lines)
            while j < n and not lines[j].strip():
                j += 1
            if j < n:
                skip = is_5day_header_at(lines, j)
                if skip:
                    return True
    return False


def is_teacher_only_schedule(lines, idx):
    """
    Detect schedules that are for teachers (not students).
    Teacher schedules either:
    1. Start directly with a time slot after the header
    2. Have a single 'יום X' line (not the standard 5-column header) followed by time slots

    Student schedules always have the standard 5-day header (5 lines: ראשון שני שלישי רביעי חמישי).
    """
    n = len(lines)
    j = idx + 1

    # Skip empty lines
    while j < n and not lines[j].strip():
        j += 1

    if j >= n:
        return False

    nxt = lines[j].strip()

    # If next non-empty line is a class code, skip it (student pattern)
    if nxt in CLASS_CODES:
        j += 1
        while j < n and not lines[j].strip():
            j += 1
        if j >= n:
            return False
        nxt = lines[j].strip()

    # If there's a 5-day header → this is a student block
    skip = is_5day_header_at(lines, j)
    if skip:
        return False

    # Case 1: next line is already a time slot (no day name prefix)
    if is_time_slot(nxt):
        return True

    # Case 2: single day name (not 5-day header) followed by time slots
    if re.match(r'יום\s+(ראשון|שני|שלישי|רביעי|חמישי)', nxt):
        k = j + 1
        for _ in range(10):
            if k >= n:
                break
            ls = lines[k].strip()
            if not ls:
                k += 1
                continue
            if is_time_slot(ls):
                return True
            if is_period_num(ls):
                return False
            # Another day name is also OK (teacher moves through days)
            if re.match(r'יום\s+(ראשון|שני|שלישי|רביעי|חמישי)', ls):
                k += 1
                continue
            k += 1

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

    name = re.sub(r'\s+', ' ', h).strip("- ").strip()
    return name, found_class


def parse_schedule(lines, start_idx):
    """
    Parse period-based schedule. Returns (schedule, end_idx).
    schedule: {period_str: [entries]}
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

        if s.startswith("=== FILE"):
            break
        if is_student_header(s):
            break
        if is_afternoon_header(s):
            break
        if is_staff_block_header(s, lines, idx):
            break

        # New days header = new block
        skip = is_5day_header_at(lines, idx)
        if skip and current_period is not None:
            break

        if s.startswith("תלמידים"):
            idx += 1
            while idx < n and not is_student_header(lines[idx]) \
                    and not lines[idx].startswith("=== FILE"):
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
            if (s not in CLASS_CODES and
                    s not in DAYS_HE and
                    not s.startswith("יום ") and
                    s != "-" and len(s) > 0):
                schedule[current_period].append(s)

        idx += 1

    return schedule, idx


def parse_teacher_time_schedule(lines, idx):
    """
    Parse a teacher schedule that uses time slots and single-day headers.
    Returns (entry, end_idx).
    """
    header = lines[idx].strip()
    # Extract teacher name
    name = header
    for p in ["מערכת שעות אישית", "מערכת שעות-", "מערכת שעות", "מערכת אישית", "מערכת"]:
        if header.startswith(p):
            name = header[len(p):].strip().strip("- ").strip()
            break

    idx += 1
    schedule = {}  # day_key -> [{time, subjects}]
    current_day = "unknown"

    DAY_MAP = {"ראשון": "sunday", "שני": "monday", "שלישי": "tuesday",
               "רביעי": "wednesday", "חמישי": "thursday"}

    while idx < len(lines):
        s = lines[idx].strip()

        if not s:
            idx += 1
            continue
        if is_student_header(s) or s.startswith("=== FILE"):
            break
        if is_staff_block_header(s, lines, idx):
            break

        # Single day header
        m = re.match(r'יום\s+(ראשון|שני|שלישי|רביעי|חמישי)', s)
        if m:
            current_day = DAY_MAP.get(m.group(1), m.group(1))
            if current_day not in schedule:
                schedule[current_day] = []
            idx += 1
            continue

        if is_time_slot(s):
            time_str = s
            idx += 1
            subjects = []
            while idx < len(lines):
                ns = lines[idx].strip()
                if not ns:
                    idx += 1
                    continue
                if is_time_slot(ns) or is_student_header(ns) \
                        or ns.startswith("=== FILE") or re.match(r'יום\s+', ns) \
                        or is_staff_block_header(ns, lines, idx):
                    break
                subjects.append(ns)
                idx += 1
            schedule.setdefault(current_day, []).append({
                "time": time_str, "subjects": subjects
            })
            continue

        idx += 1

    return {"name": name, "schedule": schedule}, idx


def parse_afternoon(lines, idx):
    """
    Parse afternoon entry (may or may not have 'מערכת צהריים' prefix).
    """
    header = lines[idx].strip()
    name = header.replace("מערכת צהריים", "").strip().strip("- ").strip()
    found_class = ""
    for code in sorted(CLASS_CODES, key=len, reverse=True):
        if code in name:
            found_class = code
            name = name.replace(code, "").strip().strip("- ").strip()
            break
    idx += 1

    schedule = {"times": [], "subjects": []}
    while idx < len(lines):
        s = lines[idx].strip()
        if not s:
            idx += 1
            continue
        if is_student_header(s) or s.startswith("=== FILE") or is_afternoon_header(s):
            break
        if is_staff_block_header(s, lines, idx):
            break
        if s in DAYS_HE or re.match(r'יום\s+', s):
            idx += 1
            continue
        if re.match(r'\d{1,2}[.:]\d{2}', s):
            schedule["times"].append(s)
        else:
            schedule["subjects"].append(s)
        idx += 1

    return {"name": name, "class": found_class, "schedule": schedule}, idx


def main():
    lines = read_file1(INPUT_FILE)
    print(f"Lines in FILE 1: {len(lines)}")

    students = []
    staff = []
    afternoon = []
    teachers = []  # standalone teacher schedules

    idx = 0
    n = len(lines)

    while idx < n:
        line = lines[idx]
        s = line.strip()

        if not s:
            idx += 1
            continue

        # ===== STUDENT / TEACHER BLOCK =====
        if is_student_header(s) and not is_afternoon_header(s):
            if is_teacher_only_schedule(lines, idx):
                entry, idx = parse_teacher_time_schedule(lines, idx)
                teachers.append(entry)
                continue

            status = determine_status(s)
            name, cls = extract_name_class(s)
            idx += 1

            # Next line may be class code
            if idx < n:
                next_s = lines[idx].strip()
                if next_s in CLASS_CODES or next_s.strip() in CLASS_CODES:
                    if not cls:
                        cls = next_s.strip()
                    idx += 1

            days_idx, skip = find_5day_header(lines, idx, 8)
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

        # ===== AFTERNOON BLOCK =====
        if is_afternoon_header(s):
            entry, idx = parse_afternoon(lines, idx)
            afternoon.append(entry)
            continue

        # ===== STAFF BLOCK =====
        if is_staff_block_header(s, lines, idx):
            days_idx, skip = find_5day_header(lines, idx + 1, 4)
            if days_idx is not None:
                idx = days_idx + skip
                schedule, idx = parse_schedule(lines, idx)
                staff.append({"name": s, "schedule": schedule})
            else:
                idx += 1
            continue

        # ===== STANDALONE AFTERNOON (e.g. "נריה ט1" without prefix) =====
        # Check if it's a student-name + class-code line followed by time slots
        aft_match = False
        for code in CLASS_CODES:
            if s.endswith(code) or (code + " " in s and not is_student_header(s)):
                # Check following lines for time slots (not period numbers)
                for j in range(idx + 1, min(idx + 8, n)):
                    ns = lines[j].strip()
                    if not ns or ns in DAYS_HE or re.match(r'יום\s+', ns):
                        continue
                    if re.match(r'\d{1,2}[.:]\d{2}', ns):
                        aft_match = True
                        break
                    if is_period_num(ns) or is_student_header(ns):
                        break
                break

        if aft_match and not is_student_header(s) and not is_staff_block_header(s, lines, idx):
            entry, idx = parse_afternoon(lines, idx)
            afternoon.append(entry)
            continue

        idx += 1

    # Deduplicate students
    seen = set()
    unique_students = []
    for s in students:
        key = s["name"].strip()
        if key and key not in seen:
            seen.add(key)
            unique_students.append(s)

    # Merge staff
    staff_merged = {}
    for s in staff:
        key = s["name"].split()[0].split("-")[0].strip()
        if key not in staff_merged:
            staff_merged[key] = {"name": key, "schedule": {}}
        for period, entries in s["schedule"].items():
            existing = staff_merged[key]["schedule"].setdefault(period, [])
            for e in entries:
                if e not in existing:
                    existing.append(e)

    staff_list = list(staff_merged.values())

    active = sum(1 for s in unique_students if s["status"] == "active")
    left = sum(1 for s in unique_students if s["status"] == "left")
    dropped = sum(1 for s in unique_students if s["status"] == "dropped")

    print(f"\nResults:")
    print(f"  Students: {len(unique_students)} (active:{active} left:{left} dropped:{dropped})")
    print(f"  Staff: {len(staff_list)}")
    print(f"  Afternoon: {len(afternoon)}")
    print(f"  Teacher schedules: {len(teachers)}")

    result = {
        "students": unique_students,
        "staff": staff_list,
        "afternoon": afternoon,
        "_teachers": teachers,
        "_meta": {
            "total_students": len(unique_students),
            "active": active,
            "left": left,
            "dropped": dropped,
            "note": (
                "Period entries stored as lists (day cannot be determined from flat text). "
                "Staff schedules use same structure."
            )
        }
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"Written: {OUTPUT_FILE}")
    return result


if __name__ == "__main__":
    main()
