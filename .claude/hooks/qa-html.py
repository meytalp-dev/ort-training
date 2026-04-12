#!/usr/bin/env python3
"""
QA Hook לקבצי HTML — בדיקת RTL וקישורים שבורים.
מופעל אוטומטית אחרי Write/Edit על קבצי .html בתוך docs/.

קלט: JSON ב-stdin (פורמט hook של Claude Code)
פלט: דוח קצר ב-stdout. exit 0 = תקין, exit 2 = יש בעיות.
"""
import json
import os
import re
import sys
from pathlib import Path

# Windows: כפיית UTF-8 על stdout/stderr כדי לתמוך בעברית
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass


def load_hook_input():
    """קורא JSON מ-stdin של hook."""
    try:
        return json.load(sys.stdin)
    except Exception:
        return {}


def get_file_path(payload):
    """מחלץ את נתיב הקובץ מתוך payload של hook."""
    tool_input = payload.get("tool_input", {}) or {}
    return tool_input.get("file_path") or tool_input.get("path")


def should_check(file_path):
    """בודק אם הקובץ הוא HTML בתוך docs/ (לא drafts)."""
    if not file_path:
        return False
    p = Path(file_path).as_posix().lower()
    if not p.endswith(".html"):
        return False
    if "/docs/" not in p:
        return False
    return True


def check_rtl(html):
    """בודק RTL ועברית."""
    issues = []
    if not re.search(r'<html[^>]*\bdir\s*=\s*["\']rtl["\']', html, re.IGNORECASE):
        issues.append('חסר dir="rtl" בתגית <html>')
    if not re.search(r'<html[^>]*\blang\s*=\s*["\']he["\']', html, re.IGNORECASE):
        issues.append('חסר lang="he" בתגית <html>')
    return issues


def check_hebrew_font(html):
    """בודק שיש פונט עברי טעון."""
    hebrew_fonts = [
        "Heebo", "Assistant", "Rubik", "Varela Round", "Playpen Sans Hebrew",
        "Frank Ruhl", "Alef", "Secular One", "Suez One", "Noto Sans Hebrew",
    ]
    for font in hebrew_fonts:
        if font.lower() in html.lower():
            return []
    return ["לא נמצא פונט עברי מוכר (Heebo / Assistant / Playpen וכו')"]


def check_broken_links(html, file_path):
    """בודק קישורים יחסיים שבורים (href / src)."""
    issues = []
    base_dir = Path(file_path).parent
    pattern = re.compile(r'(?:href|src)\s*=\s*["\']([^"\'#?]+)["\']', re.IGNORECASE)
    seen = set()
    for match in pattern.finditer(html):
        link = match.group(1).strip()
        if not link or link in seen:
            continue
        seen.add(link)
        # דלג על URLs מוחלטים, data:, mailto:, tel:, anchors
        if re.match(r'^(https?:|data:|mailto:|tel:|//|#|javascript:)', link, re.IGNORECASE):
            continue
        target = (base_dir / link).resolve()
        if not target.exists():
            issues.append(f"קישור שבור: {link}")
    return issues[:5]  # מקסימום 5 כדי לא להציף


def check_audience(html):
    """בדיקה רכה — האם יש פסקאות ארוכות מדי לקהל היעד."""
    text_only = re.sub(r"<[^>]+>", " ", html)
    text_only = re.sub(r"\s+", " ", text_only)
    long_paragraphs = [
        p for p in re.findall(r"<p[^>]*>(.*?)</p>", html, re.IGNORECASE | re.DOTALL)
        if len(re.sub(r"<[^>]+>", "", p)) > 400
    ]
    if long_paragraphs:
        return [f"נמצאו {len(long_paragraphs)} פסקאות ארוכות מ-400 תווים — שקלי לקצר לקהל היעד"]
    return []


def main():
    payload = load_hook_input()
    file_path = get_file_path(payload)

    if not should_check(file_path):
        sys.exit(0)  # לא רלוונטי, יוצא בשקט

    try:
        html = Path(file_path).read_text(encoding="utf-8", errors="ignore")
    except Exception as e:
        print(f"⚠ QA: לא הצלחתי לקרוא {file_path}: {e}")
        sys.exit(0)

    rtl_issues = check_rtl(html)
    font_issues = check_hebrew_font(html)
    link_issues = check_broken_links(html, file_path)
    audience_issues = check_audience(html)

    all_issues = rtl_issues + font_issues + link_issues + audience_issues
    rel_path = os.path.relpath(file_path, Path.cwd())

    if not all_issues:
        print(f"✓ QA Hook: {rel_path} — RTL תקין, פונט עברי, אין קישורים שבורים")
        sys.exit(0)

    print(f"⚠ QA Hook: נמצאו {len(all_issues)} ממצאים ב-{rel_path}")
    for issue in all_issues:
        print(f"  • {issue}")
    # exit 2 כדי שהממצאים יוחזרו לשיחה
    sys.exit(2)


if __name__ == "__main__":
    main()
