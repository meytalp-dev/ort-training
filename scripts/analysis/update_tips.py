#!/usr/bin/env python3
"""
Claude Code Tips Agent - סוכן טיפים יומי
מייצר טיפים חדשים על Claude Code ומעדכן את דף links.html
"""

import json
import os
import re
import subprocess
import sys
from datetime import datetime

try:
    import anthropic
except ImportError:
    print("ERROR: anthropic package not installed. Run: pip install anthropic")
    sys.exit(1)

# --- Config ---
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
HTML_FILE = os.path.join(SCRIPT_DIR, "docs", "training", "claude-code", "links.html")
MODEL = "claude-haiku-4-5"

# Markers in HTML
START_MARKER = "<!-- AUTO-GENERATED: Daily Tip - DO NOT EDIT -->"
END_MARKER = "<!-- END: Daily Tip -->"

# Existing tips (so Claude generates different ones)
EXISTING_TIPS = [
    "דברו בעברית פשוטה",
    "היו ספציפיים",
    "אל תקבלו את הגרסה הראשונה",
    "תנו לקלוד לראיין אתכם",
    "תכננו לפני שבונים (Plan Mode)",
    "בנו בשלבים קטנים",
    "שיחה חדשה לנושא חדש",
    "שמרו תמיד עם Commit",
    "Escape / Shift+Tab / /clear / /compact",
    "עצרו מוקדם",
    "הרשאות - לא להיבהל",
    "אם כותב באנגלית",
    "Subagents לחקירות",
    "מסמך Handoff",
    "/compact כשההקשר מתמלא",
    "Skills - פקודות מותאמות",
    "Hooks - פעולות אוטומטיות",
    "הפרידו כללים קבועים מהקשר זמני",
    "מודלים שונים למשימות שונות",
    "כמה מופעים במקביל",
    "דברו לקלוד בקול",
]

PROMPT = """אתה מומחה ל-Claude Code (הכלי של Anthropic לפיתוח מהטרמינל/VSCode).
קהל היעד: מורים בבתי ספר מקצועיים בישראל שמתחילים להשתמש ב-Claude Code.

ייצר בדיוק 2 טיפים חדשים, מעשיים ומפתיעים על Claude Code.

כללים:
- עברית פשוטה וקצרה (משפט אחד לכותרת, 1-2 משפטים לתיאור)
- טיפים מעשיים שאפשר ליישם מיד
- שונים מהטיפים הקיימים: {existing}
- כל טיפ שייך לאחת הקטגוריות: communication, methods, shortcuts, errors

החזר JSON בלבד (בלי markdown, בלי ```):
[
  {{"category": "communication|methods|shortcuts|errors", "title": "כותרת קצרה", "description": "תיאור קצר ומעשי"}}
]"""

CATEGORY_COLORS = {
    "communication": "#14B8A6",
    "methods": "#7C3AED",
    "shortcuts": "#F59E0B",
    "errors": "#E76F7A",
}

CATEGORY_ICONS = {
    "communication": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    "methods": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
    "shortcuts": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 16h8"/></svg>',
    "errors": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>',
}


def generate_tips():
    """Call Claude API to generate new tips."""
    client = anthropic.Anthropic()
    response = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": PROMPT.format(existing=", ".join(EXISTING_TIPS)),
            }
        ],
    )

    text = response.content[0].text.strip()
    # Clean potential markdown wrapper
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)

    tips = json.loads(text)
    if not isinstance(tips, list) or len(tips) == 0:
        raise ValueError(f"Expected list of tips, got: {text}")
    return tips


def build_html(tips):
    """Build the daily tip HTML section."""
    now = datetime.now().strftime("%d/%m/%Y %H:%M")

    cards = []
    for tip in tips:
        cat = tip.get("category", "methods")
        color = CATEGORY_COLORS.get(cat, "#7C3AED")
        icon = CATEGORY_ICONS.get(cat, CATEGORY_ICONS["methods"])
        title = tip["title"]
        desc = tip["description"]

        cards.append(f'''                    <div style="background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:12px; padding:14px 18px; display:flex; align-items:flex-start; gap:12px;">
                        <div style="color:{color}; flex-shrink:0; margin-top:2px;">{icon}</div>
                        <div>
                            <div style="font-weight:600; color:#E2E8F0; font-size:14px; margin-bottom:4px;">{title}</div>
                            <div style="font-size:13px; color:#94A3B8; line-height:1.6;">{desc}</div>
                        </div>
                    </div>''')

    cards_html = "\n".join(cards)

    return f"""{START_MARKER}
        <section class="section" id="daily-tip">
            <div class="section-header" style="border-image:linear-gradient(135deg,#F59E0B,#EF4444) 1;">
                <h2>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle; margin-left:8px;"><path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"/></svg>
                    הטיפ היומי
                </h2>
                <span class="section-sub">עודכן: {now}</span>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px;">
{cards_html}
            </div>
        </section>
        {END_MARKER}"""


def update_html(new_section):
    """Insert or replace the daily tip section in links.html."""
    with open(HTML_FILE, "r", encoding="utf-8") as f:
        html = f.read()

    # If markers exist, replace between them
    pattern = re.compile(
        re.escape(START_MARKER) + r".*?" + re.escape(END_MARKER),
        re.DOTALL,
    )
    if pattern.search(html):
        html = pattern.sub(new_section, html)
    else:
        # Insert before the tips accordion section
        insert_point = "<!-- ============ TIPS ACCORDION ============ -->"
        if insert_point in html:
            html = html.replace(
                insert_point,
                new_section + "\n\n        " + insert_point,
            )
        else:
            print("ERROR: Could not find insertion point in HTML")
            sys.exit(1)

    with open(HTML_FILE, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"Updated: {HTML_FILE}")


def git_commit_push():
    """Commit and push changes."""
    try:
        subprocess.run(
            ["git", "add", HTML_FILE],
            cwd=SCRIPT_DIR,
            check=True,
            capture_output=True,
        )
        now = datetime.now().strftime("%Y-%m-%d %H:%M")
        subprocess.run(
            ["git", "commit", "-m", f"Update daily tip ({now})"],
            cwd=SCRIPT_DIR,
            check=True,
            capture_output=True,
        )
        subprocess.run(
            ["git", "push"],
            cwd=SCRIPT_DIR,
            check=True,
            capture_output=True,
        )
        print("Git: committed and pushed")
    except subprocess.CalledProcessError as e:
        print(f"Git error: {e.stderr.decode() if e.stderr else e}")


def main():
    print(f"[{datetime.now().isoformat()}] Starting tips update...")

    # Generate tips
    tips = generate_tips()
    print(f"Generated {len(tips)} tips:")
    for t in tips:
        print(f"  - [{t['category']}] {t['title']}")

    # Build HTML
    section_html = build_html(tips)

    # Update file
    update_html(section_html)

    # Git commit + push
    git_commit_push()

    print("Done!")


if __name__ == "__main__":
    main()
