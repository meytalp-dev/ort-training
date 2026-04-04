"""
Daily AI Digest — NotebookLM + LinkedIn + Claude Code
Creates a daily AI news notebook with social media content, infographic & slides in Hebrew.
Sends beautifully formatted HTML email via Apps Script.
Runs daily at 05:00 via Windows Task Scheduler.
"""
import asyncio
import sys
import os
import json
import re
import time
from datetime import datetime
from html import escape

# Fix Windows encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

import httpx
from notebooklm import NotebookLMClient
from notebooklm.auth import load_auth_from_storage, fetch_tokens, AuthTokens

# Config
APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwjnvROZECx9cHMJiKENA5oSH8bpkjhhpvWadg-OZYpWwn-uAOiIShGMG3UwgPcp0Wt/exec'
CHROME_USER_DATA = r"C:\Users\meyta\ChromeDebug"
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

AI_NEWS_SOURCES = [
    "https://openai.com/blog",
    "https://blog.google/technology/ai/",
    "https://techcrunch.com/category/artificial-intelligence/",
    "https://the-decoder.com",
    "https://www.theverge.com/ai-artificial-intelligence",
]

CLAUDE_CODE_SOURCES = [
    "https://docs.anthropic.com/en/docs/claude-code/overview",
    "https://github.com/anthropics/claude-code/releases",
    "https://www.reddit.com/r/ClaudeAI/",
]

LINKEDIN_SEARCHES = [
    "artificial intelligence news today",
    "generative AI tools",
    "Claude AI Anthropic",
]

ARTIFACT_TIMEOUT = 600.0  # 10 minutes per artifact
OUTPUT_DIR = os.path.join(os.path.expanduser("~"), "Desktop", "AI-Digest")


async def scrape_linkedin_posts():
    """Scrape recent AI-related posts from LinkedIn using Chrome Debug profile."""
    from playwright.async_api import async_playwright

    posts = []
    print("LinkedIn: launching Chrome Debug profile...")

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch_persistent_context(
                user_data_dir=CHROME_USER_DATA,
                executable_path=CHROME_PATH,
                headless=True,
                args=["--disable-blink-features=AutomationControlled"],
                timeout=30000,
            )

            page = browser.pages[0] if browser.pages else await browser.new_page()

            for query in LINKEDIN_SEARCHES:
                try:
                    search_url = f"https://www.linkedin.com/search/results/content/?keywords={query.replace(' ', '%20')}&datePosted=%22past-24h%22&sortBy=%22relevance%22"
                    await page.goto(search_url, wait_until="domcontentloaded", timeout=20000)
                    await page.wait_for_timeout(3000)

                    # Extract post text from feed items
                    items = await page.query_selector_all(".feed-shared-update-v2__description, .update-components-text, span.break-words")
                    for item in items[:5]:  # top 5 per query
                        text = await item.inner_text()
                        text = text.strip()
                        if len(text) > 50:  # skip short items
                            posts.append({
                                "source": "LinkedIn",
                                "query": query,
                                "text": text[:1500],  # cap length
                            })

                    print(f"  LinkedIn '{query}': {len([p for p in posts if p['query'] == query])} posts")
                except Exception as e:
                    print(f"  LinkedIn '{query}' failed: {e}")

            await browser.close()

    except Exception as e:
        print(f"LinkedIn scraping failed: {e}")

    # Deduplicate by content similarity
    seen = set()
    unique = []
    for post in posts:
        key = post["text"][:100]
        if key not in seen:
            seen.add(key)
            unique.append(post)

    print(f"LinkedIn: {len(unique)} unique posts collected")
    return unique


# Color palette for digest items — matches preview-v2 design
ITEM_COLORS = [
    {"bg": "#e6f7fd", "num": "#00b4d8", "tag_bg": "#c8eef8", "accent": "#0096b7"},
    {"bg": "#fce9f4", "num": "#e84393", "tag_bg": "#f9c8e3", "accent": "#be185d"},
    {"bg": "#e5faf9", "num": "#00cec9", "tag_bg": "#b8f0ee", "accent": "#0f766e"},
    {"bg": "#eeecfc", "num": "#6c5ce7", "tag_bg": "#d8d4f7", "accent": "#5b21b6"},
    {"bg": "#fdf0f5", "num": "#fd79a8", "tag_bg": "#f9d0e3", "accent": "#be185d"},
    {"bg": "#e6f7fd", "num": "#00b4d8", "tag_bg": "#c8eef8", "accent": "#0096b7"},
    {"bg": "#fce9f4", "num": "#e84393", "tag_bg": "#f9c8e3", "accent": "#be185d"},
]

AUDIENCE_ICONS = {
    "why_marketing": ("שיווק", "#00b4d8"),
    "why_management": ("ניהול", "#00cec9"),
    "why_entrepreneurship": ("יזמות", "#e84393"),
    "why_education": ("חינוך", "#6c5ce7"),
    "why_general": ("שימוש כללי", "#64748b"),
}


def build_digest_html(date, items, notebook_url=""):
    """Build a beautifully designed HTML email matching the preview-v2 design."""
    parts = date.split("-")
    he_date = f"{int(parts[2])} ב{_hebrew_month(int(parts[1]))} {parts[0]}"

    ACTION_STYLES = {
        "טיפ":          "background:#fef3c7;color:#92400e",
        "הכרת כלי":     "background:#dbeafe;color:#1e40af",
        "מצגת הדרכה":   "background:#d1fae5;color:#065f46",
        "ניוזלטר":      "background:#ede9fe;color:#5b21b6",
        "מאמר":         "background:#fce7f3;color:#9d174d",
        "רילס":         "background:#ffe4e6;color:#be123c",
    }
    PLATFORM_STYLES = {
        "Facebook":   "background:#e8f0fe;color:#1877f2;border:1px solid #b8d0fb",
        "Instagram":  "background:#fde8f4;color:#e1306c;border:1px solid #f5b8d8",
        "LinkedIn":   "background:#e8f3fb;color:#0a66c2;border:1px solid #b3d4ef",
        "Newsletter": "background:#e0f7fc;color:#0096b7;border:1px solid #9de2ef",
    }

    items_html = ""
    for i, item in enumerate(items):
        c = ITEM_COLORS[i % len(ITEM_COLORS)]
        num = i + 1
        title   = escape(item.get("title", ""))
        summary = escape(item.get("summary", ""))
        detail  = escape(item.get("detail", ""))
        tag     = escape(item.get("tag", ""))

        # Action tags
        tags_parts = []
        for act in item.get("content_actions", []):
            st = ACTION_STYLES.get(act, "background:#f1f5f9;color:#475569")
            tags_parts.append(f'<span style="display:inline-block;padding:2px 9px;border-radius:6px;font-size:10px;font-weight:700;{st}">{escape(act)}</span>')
        for plat in item.get("platforms", []):
            st = PLATFORM_STYLES.get(plat, "background:#f1f5f9;color:#475569;border:1px solid #e2e8f0")
            tags_parts.append(f'<span style="display:inline-block;padding:2px 9px;border-radius:6px;font-size:10px;font-weight:700;{st}">{escape(plat)}</span>')
        tags_html = ""
        if tags_parts:
            tags_html = '<p style="margin:8px 0 0">' + "&nbsp;".join(tags_parts) + '</p>'

        # Why this matters
        why_rows = ""
        for key, (label, color) in AUDIENCE_ICONS.items():
            text = item.get(key, "")
            if text:
                why_rows += f'''<tr>
                  <td style="padding:5px 8px 5px 0;vertical-align:top;width:76px">
                    <span style="display:inline-block;background:{color};color:#fff;padding:2px 10px;border-radius:10px;font-size:11px;font-weight:700;white-space:nowrap">{label}</span>
                  </td>
                  <td style="padding:5px 0;font-size:13px;color:#475569;line-height:1.65">{escape(text)}</td>
                </tr>'''

        detail_html = ""
        if detail:
            detail_html = f'''
          <div style="margin:0 22px 4px;border-top:1px dashed rgba(0,0,0,.10);padding-top:12px">
            <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:0.6px;text-transform:uppercase">פירוט</p>
            <p style="margin:0;font-size:13px;color:#334155;line-height:1.75">{detail}</p>
          </div>'''

        why_html = ""
        if why_rows:
            why_html = f'''
          <div style="margin:12px 22px 20px">
            <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:0.6px;text-transform:uppercase">למה זה חשוב</p>
            <table cellpadding="0" cellspacing="0" width="100%">{why_rows}</table>
          </div>'''

        items_html += f'''
        <div style="background:{c['bg']};border-radius:14px;border:1px solid rgba(0,0,0,.04);margin-bottom:14px;overflow:hidden">
          <table cellpadding="0" cellspacing="0" width="100%" style="padding:18px 22px 14px">
            <tr>
              <td style="width:40px;vertical-align:top;padding-left:0">
                <span style="font-family:'Rubik',Arial,sans-serif;font-weight:800;font-size:26px;color:{c['num']};line-height:1">{num}</span>
              </td>
              <td style="vertical-align:top">
                <span style="display:inline-block;background:{c['tag_bg']};color:{c['accent']};padding:2px 10px;border-radius:8px;font-size:11px;font-weight:700">{tag}</span>
                <h3 style="margin:7px 0 4px;font-size:16px;font-weight:700;color:#1e293b;line-height:1.5;font-family:'Rubik',Arial,sans-serif">{title}</h3>
                {tags_html}
                <p style="margin:8px 0 0;font-size:13px;color:#475569;line-height:1.7">{summary}</p>
              </td>
            </tr>
          </table>
          {detail_html}
          {why_html}
        </div>'''

    # NotebookLM CTA
    nb_btn = ""
    if notebook_url:
        source_names = "OpenAI · Google AI · TechCrunch · The Decoder · The Verge · Anthropic · Reddit"
        nb_btn = f'''
    <!-- Source badge -->
    <div style="margin:0 28px 20px;padding:14px 18px;background:#f7f8fc;border-radius:12px;border:1px solid rgba(0,0,0,.04)">
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td>
            <p style="margin:0 0 2px;font-size:12px;font-weight:700;color:#1e293b">NotebookLM Digest</p>
            <p style="margin:0;font-size:11px;color:#94a3b8">{source_names}</p>
          </td>
          <td style="text-align:left;white-space:nowrap">
            <a href="{notebook_url}" target="_blank" style="display:inline-block;background:#e0f7fc;color:#0096b7;padding:5px 14px;border-radius:8px;font-size:12px;font-weight:700;text-decoration:none">פתח</a>
          </td>
        </tr>
      </table>
    </div>'''

    html = f'''<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>סקירת בוקר — Learni | {he_date}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&family=Rubik:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    body {{ font-family: 'Heebo', Arial, sans-serif; }}
    h1, h3 {{ font-family: 'Rubik', Arial, sans-serif; }}
  </style>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Heebo',Arial,Helvetica,sans-serif;direction:rtl;text-align:right">
  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden">סקירת בוקר Learni — {he_date} | {len(items)} חידושים שכדאי להכיר</div>

  <div style="max-width:640px;margin:24px auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.10)">

    <!-- Gradient top border -->
    <div style="height:5px;background:linear-gradient(90deg,#00b4d8,#e84393,#00cec9)"></div>

    <!-- Header -->
    <div style="padding:28px 32px 22px;background:#ffffff">
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td>
            <span style="font-family:'Heebo',Arial,sans-serif;font-weight:800;font-size:18px;color:#1e293b">Learni</span>
          </td>
          <td style="text-align:left">
            <span style="background:#f0f4f8;color:#64748b;padding:4px 14px;border-radius:16px;font-size:12px;font-weight:600;border:1px solid rgba(0,0,0,.06)">{he_date}</span>
          </td>
        </tr>
      </table>
      <h1 style="margin:16px 0 6px;font-size:26px;font-weight:800;color:#1e293b;line-height:1.4;font-family:'Rubik',Arial,sans-serif">
        {len(items)} חידושי <span style="color:#00b4d8">AI</span> שכדאי להכיר
      </h1>
      <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6">הסיכום היומי שלך — מה חדש בעולם הבינה המלאכותית</p>
    </div>

    <!-- Items -->
    <div style="padding:4px 28px 8px">
      {items_html}
    </div>

    {nb_btn}

    <!-- Footer -->
    <div style="background:#1e293b;padding:20px 28px">
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td>
            <span style="font-family:'Heebo',Arial,sans-serif;font-weight:700;color:#ffffff;font-size:14px">Learni</span>
          </td>
          <td style="text-align:left">
            <span style="font-size:11px;color:rgba(255,255,255,.4)">סקירת בוקר | {date} | Claude Code + NotebookLM</span>
          </td>
        </tr>
      </table>
    </div>
  </div>

  <div style="text-align:center;padding:12px">
    <p style="font-size:11px;color:#94a3b8;font-family:Arial,sans-serif">קיבלת את הדייג'סט הזה כי את/ה רשומ/ה לעדכונים של Learni</p>
  </div>
</body>
</html>'''
    return html


def _hebrew_month(month):
    """Return Hebrew month name."""
    months = {
        1: "בינואר", 2: "בפברואר", 3: "במרץ", 4: "באפריל",
        5: "במאי", 6: "ביוני", 7: "ביולי", 8: "באוגוסט",
        9: "בספטמבר", 10: "באוקטובר", 11: "בנובמבר", 12: "בדצמבר",
    }
    return months.get(month, "")


def send_email(data, html_body=""):
    """Send digest email via Apps Script."""
    payload = {
        "action": "aiDigest",
        "date": data["date"],
        "summary": data["summary"],
        "notebook_url": data["notebook_url"],
        "infographic_url": data.get("infographic_url", ""),
        "slides_url": data.get("slides_url", ""),
        "html_body": html_body,
    }
    r = httpx.post(APPS_SCRIPT_URL, json=payload, follow_redirects=True, timeout=30)
    print(f"Email sent: {r.status_code} — {r.text[:200]}")


async def create_daily_digest():
    """Create daily AI digest notebook and return summary."""
    today = datetime.now().strftime("%Y-%m-%d")
    day_dir = os.path.join(OUTPUT_DIR, today)
    os.makedirs(day_dir, exist_ok=True)

    # Connect to NotebookLM
    cookies = load_auth_from_storage()
    csrf_token, session_id = await fetch_tokens(cookies)
    tokens = AuthTokens(cookies=cookies, csrf_token=csrf_token, session_id=session_id)

    # Step 0: Scrape LinkedIn before connecting to NotebookLM
    linkedin_posts = await scrape_linkedin_posts()

    async with NotebookLMClient(auth=tokens) as client:
        # Create new notebook
        notebook = await client.notebooks.create(title=f"AI Digest - {today}")
        notebook_url = f"https://notebooklm.google.com/notebook/{notebook.id}"
        print(f"Created notebook: AI Digest - {today}")

        # Add URL sources
        all_sources = AI_NEWS_SOURCES + CLAUDE_CODE_SOURCES
        added = 0
        for url in all_sources:
            try:
                await client.sources.add_url(notebook.id, url)
                added += 1
                print(f"  Added: {url}")
            except Exception as e:
                print(f"  Skipped: {url}")
        print(f"URL sources: {added}/{len(all_sources)}")

        # Add LinkedIn posts as text sources
        if linkedin_posts:
            combined_text = f"LinkedIn AI Posts — {today}\n\n"
            for i, post in enumerate(linkedin_posts, 1):
                combined_text += f"--- Post {i} (search: {post['query']}) ---\n{post['text']}\n\n"

            try:
                await client.sources.add_text(
                    notebook.id,
                    title=f"LinkedIn AI Posts — {today}",
                    content=combined_text,
                )
                added += 1
                print(f"  Added: LinkedIn ({len(linkedin_posts)} posts as text source)")
            except Exception as e:
                print(f"  LinkedIn text source failed: {e}")

        print(f"Total sources: {added}")

        # Get Hebrew summary — structured for rich email
        print("Generating structured summary...")
        summary = ""
        structured_items = []
        try:
            chat_result = await client.chat.ask(
                notebook.id,
                "Based on all the sources (news sites AND LinkedIn posts), identify the 5–7 most important AI news items from today. "
                "Focus on NEW information only — skip anything older than 24 hours.\n\n"
                "IMPORTANT CONTEXT — this digest is for Meytal Peleg, who runs 'Learni', a brand focused on "
                "AI innovation for education, management, entrepreneurship, and marketing. She creates:\n"
                "- Training presentations on AI tools people can actually USE\n"
                "- Short reels demonstrating tools\n"
                "- Tips and infographics\n"
                "- Weekly newsletter\n"
                "- Articles and social media posts\n"
                "Her platforms: Facebook, Instagram, LinkedIn, Newsletter\n"
                "Her audience: teachers, managers, entrepreneurs, marketers — regular people, NOT developers.\n\n"
                "Return the result as a JSON array (no markdown fences, just raw JSON). Each item should have:\n"
                '- "title": כותרת קצרה בעברית (עד 15 מילים)\n'
                '- "summary": תיאור של 2-3 משפטים בעברית\n'
                '- "detail": הסבר מעמיק של 3-5 משפטים — מה בדיוק ההכרזה, מספרים, תאריכים, השוואה למתחרים\n'
                '- "tag": תגית אחת מהאפשרויות: "כלי חדש", "עדכון", "גיוס", "וידאו AI", "פרודוקטיביות", "אבטחה", "מחקר", "טרנד"\n'
                '- "why_marketing": משפט אחד — למה זה חשוב לאנשי שיווק\n'
                '- "why_management": משפט אחד — למה זה חשוב למנהלים\n'
                '- "why_entrepreneurship": משפט אחד — למה זה חשוב ליזמים\n'
                '- "why_education": משפט אחד — למה זה חשוב לחינוך\n'
                '- "why_general": משפט אחד — למה זה חשוב לשימוש כללי\n'
                '- "content_actions": רשימה של סוגי תוכן שמיטל יכולה לייצר מהידיעה הזו. '
                'בחר רק מה שבאמת רלוונטי — אם הידיעה היא חדשות תעשייה (גיוס, רכישה, דוחות) בלי כלי שאנשים יכולים לנסות, אל תמליץ על "הכרת כלי" או "מצגת הדרכה" או "רילס". '
                'אפשרויות: "טיפ", "הכרת כלי", "מצגת הדרכה", "ניוזלטר", "מאמר", "רילס". '
                'השתמש ב-[] ריק אם אין שום פעולה רלוונטית.\n'
                '- "platforms": רשימה של פלטפורמות שמתאים לפרסם בהן. '
                'בחר רק מה שרלוונטי לקהל של מיטל. '
                'אפשרויות: "Facebook", "Instagram", "LinkedIn", "Newsletter". '
                'השתמש ב-[] ריק אם לא מתאים לאף פלטפורמה.\n\n'
                "CRITICAL — BE VERY SELECTIVE with content_actions and platforms:\n"
                "You are Meytal's content filter. Out of 5-7 items, typically:\n"
                "- ONLY 1 item (max 2) should get real content_actions + platforms — the one standout item worth creating content about\n"
                "- 1-2 items get ONLY [\"ניוזלטר\"] — good to know, not worth producing content\n"
                "- The rest get EMPTY [] for both fields — background noise\n\n"
                "Ask yourself: would Meytal's audience (teachers, managers, entrepreneurs) actually CARE about this enough "
                "to stop scrolling? Is there a NEW TOOL they can TRY TODAY? Is it visual/exciting enough for a reel?\n"
                "If the answer is 'meh, interesting but not actionable' — leave it empty.\n\n"
                "SPECIFIC RULES:\n"
                '- "הכרת כלי" / "מצגת הדרכה" / "רילס" — ONLY if there is a FREE tool regular people can try RIGHT NOW\n'
                '- "טיפ" — ONLY if there is a concrete, practical tip someone can apply in 5 minutes\n'
                '- "מאמר" — ONLY if this is a paradigm shift worth a deep dive\n'
                '- Industry news (funding, acquisitions, earnings, user numbers) — ALWAYS empty []. Nobody needs a reel about a funding round.\n'
                '- Developer-only tools (APIs, SDKs, CLI) — empty [] unless Meytal specifically covers that tool (she covers Claude Code)\n'
                '- Enterprise/corporate tools (Slack, Salesforce, ServiceNow, Jira) — empty []. Her audience does not use these.\n'
                '- A genuinely new, free, visual tool anyone can use — this is the ONE item that gets full treatment\n\n'
                "Example format:\n"
                '[{"title":"כלי חדש ליצירת וידאו","summary":"...","detail":"...","tag":"כלי חדש",'
                '"why_marketing":"...","why_management":"...","why_entrepreneurship":"...","why_education":"...","why_general":"...",'
                '"content_actions":["הכרת כלי","רילס","טיפ"],"platforms":["Facebook","Instagram","LinkedIn"]}]\n\n'
                "Return ONLY the JSON array, no other text."
            )
            raw = chat_result.answer if hasattr(chat_result, 'answer') else str(chat_result)
            summary = raw  # keep raw for tips extraction

            # Parse JSON from response
            json_match = re.search(r'\[.*\]', raw, re.DOTALL)
            if json_match:
                structured_items = json.loads(json_match.group())
                print(f"Parsed {len(structured_items)} structured items")
            else:
                print("Could not parse JSON, will use raw summary")
        except Exception as e:
            print(f"Summary failed: {e}")
            summary = "לא ניתן היה ליצור סיכום"

        # Generate infographic + slides, then poll until ready
        infographic_path = None
        slides_path = None

        # Kick off generation
        print("Requesting infographic (Hebrew)...")
        try:
            await client.artifacts.generate_infographic(
                notebook.id, language='he',
                instructions="Create an infographic summarizing today's top AI news in Hebrew."
            )
        except Exception as e:
            print(f"Infographic request: {e}")

        print("Requesting slides (Hebrew)...")
        try:
            await client.artifacts.generate_slide_deck(
                notebook.id, language='he',
                instructions="Create a slide deck summarizing today's AI news in Hebrew."
            )
        except Exception as e:
            print(f"Slides request: {e}")

        # Poll until artifacts are ready (max 10 min)
        print("Waiting for artifacts to complete...")
        deadline = time.time() + ARTIFACT_TIMEOUT
        while time.time() < deadline:
            await asyncio.sleep(15)
            try:
                infographics = await client.artifacts.list_infographics(notebook.id)
                completed_info = [a for a in infographics if a.status == 3]
                if completed_info and not infographic_path:
                    infographic_path = os.path.join(day_dir, f"infographic-{today}.png")
                    await client.artifacts.download_infographic(
                        notebook.id, infographic_path, artifact_id=completed_info[0].id
                    )
                    print(f"Infographic saved: {infographic_path}")

                slide_decks = await client.artifacts.list_slide_decks(notebook.id)
                completed_slides = [a for a in slide_decks if a.status == 3]
                if completed_slides and not slides_path:
                    slides_path = os.path.join(day_dir, f"slides-{today}.pdf")
                    await client.artifacts.download_slide_deck(
                        notebook.id, slides_path, artifact_id=completed_slides[0].id
                    )
                    print(f"Slides saved: {slides_path}")

                if infographic_path and slides_path:
                    print("All artifacts ready!")
                    break

                # Check if all failed
                all_info_done = all(a.status in (3, 4) for a in infographics) if infographics else False
                all_slides_done = all(a.status in (3, 4) for a in slide_decks) if slide_decks else False
                if all_info_done and all_slides_done:
                    print("All artifact generation finished.")
                    break
            except Exception as e:
                print(f"Poll error: {e}")

        if not infographic_path:
            print("Infographic: not available")
        if not slides_path:
            print("Slides: not available")

        # Save tips to library
        update_tips_library(today, summary)

        # Build output
        output = {
            "date": today,
            "notebook_id": notebook.id,
            "notebook_url": notebook_url,
            "sources_added": added,
            "summary": summary,
            "items": structured_items,
            "infographic": infographic_path,
            "slides": slides_path,
            "output_dir": day_dir,
        }

        # Save JSON locally
        json_path = os.path.join(day_dir, f"digest-{today}.json")
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)

        # Build and save HTML digest
        html_path = os.path.join(day_dir, f"digest-{today}.html")
        html_content = build_digest_html(today, structured_items, notebook_url)
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        print(f"HTML digest saved: {html_path}")

        # Send email
        print("Sending email...")
        send_email(output, html_content)

        # Generate content drafts for recommended item
        recommended = next((it for it in structured_items if it.get("content_actions")), None)
        if recommended:
            print("Generating content drafts for recommended item...")
            try:
                drafts = await generate_content_drafts(recommended, today)
                drafts_html = build_drafts_html(today, recommended, drafts)
                send_drafts_email(today, recommended, drafts_html)
                print("Drafts email sent.")
            except Exception as e:
                print(f"Drafts generation failed: {e}")
        else:
            print("No recommended item — skipping drafts.")

        # Print report
        print(f"\n{'='*50}")
        print(f"AI DIGEST — {today}")
        print(f"{'='*50}")
        print(f"Notebook: {notebook_url}")
        print(f"Infographic: {'OK' if infographic_path else 'FAILED'}")
        print(f"Slides: {'OK' if slides_path else 'FAILED'}")
        print(f"Email: SENT")
        print(f"Files: {day_dir}")
        print(f"{'='*50}")

        return output


async def generate_content_drafts(item, date):
    """Use Claude API to generate content drafts for the recommended digest item."""
    import anthropic
    client = anthropic.Anthropic()

    title   = item.get("title", "")
    summary = item.get("summary", "")
    detail  = item.get("detail", "")
    actions = item.get("content_actions", [])

    context = f"""נושא: {title}
תיאור: {summary}
פירוט: {detail}

קהל היעד של מיטל: מורים, מנהלים, יזמים, אנשי שיווק — לא מפתחים.
המותג: Learni — חדשנות AI לחינוך ולעבודה.
שפה: עברית, גוף ראשון רבים (אנחנו/לנו), סגנון חם ומקצועי."""

    drafts = {}

    # Facebook/Instagram post
    if any(a in actions for a in ["הכרת כלי", "טיפ", "מאמר", "ניוזלטר"]):
        resp = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=600,
            messages=[{"role": "user", "content":
                f"{context}\n\nכתוב פוסט לפייסבוק/אינסטגרם (עד 150 מילים):\n"
                "- פתיחה מושכת (hook) — שורה ראשונה שגורמת לעצור לגלול\n"
                "- ערך פרקטי: מה אפשר לעשות עם זה היום\n"
                "- סיום עם שאלה לדיון\n"
                "- 3-5 האשטאגים בסוף\n"
                "החזר רק את טקסט הפוסט, בלי כותרת."}]
        )
        drafts["post"] = resp.content[0].text.strip()

    # Reel script
    if "רילס" in actions:
        resp = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=400,
            messages=[{"role": "user", "content":
                f"{context}\n\nכתוב סקריפט לרילס של 30-45 שניות:\n"
                "שורה 1 (0-3 שניות): hook — משפט אחד שגורם לעצור\n"
                "שורות 2-5 (3-25 שניות): 3-4 נקודות מהירות עם ערך\n"
                "שורה אחרונה (25-35 שניות): CTA — מה לעשות עכשיו\n"
                "פורמט: [00-03s] טקסט | [03-15s] טקסט | וכו'\n"
                "החזר רק את הסקריפט."}]
        )
        drafts["reel"] = resp.content[0].text.strip()

    # Newsletter tip
    if "ניוזלטר" in actions or "טיפ" in actions:
        resp = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=300,
            messages=[{"role": "user", "content":
                f"{context}\n\nכתוב טיפ קצר לניוזלטר (3-5 משפטים):\n"
                "- כותרת: 'טיפ השבוע:' + נושא\n"
                "- מה זה, למה זה שימושי, איך מתחילים\n"
                "החזר רק את הטיפ."}]
        )
        drafts["newsletter"] = resp.content[0].text.strip()

    return drafts


def build_drafts_html(date, item, drafts):
    """Build the drafts approval email HTML."""
    parts = date.split("-")
    he_date = f"{int(parts[2])} ב{_hebrew_month(int(parts[1]))} {parts[0]}"
    title = item.get("title", "")
    actions = item.get("content_actions", [])
    platforms = item.get("platforms", [])

    sections_html = ""

    if "post" in drafts:
        plat_str = " + ".join(p for p in platforms if p in ["Facebook", "Instagram", "LinkedIn"])
        sections_html += f'''
        <div style="background:#f7f8fc;border-radius:14px;border:1px solid rgba(0,0,0,.05);margin-bottom:16px;overflow:hidden">
          <div style="background:linear-gradient(90deg,#00b4d8,#48cae4);padding:12px 20px">
            <p style="margin:0;font-size:12px;font-weight:700;color:#fff;letter-spacing:0.5px">פוסט — {plat_str}</p>
          </div>
          <div style="padding:18px 20px;font-size:14px;color:#1e293b;line-height:1.8;white-space:pre-wrap">{drafts["post"]}</div>
        </div>'''

    if "reel" in drafts:
        sections_html += f'''
        <div style="background:#f7f8fc;border-radius:14px;border:1px solid rgba(0,0,0,.05);margin-bottom:16px;overflow:hidden">
          <div style="background:linear-gradient(90deg,#e84393,#fd79a8);padding:12px 20px">
            <p style="margin:0;font-size:12px;font-weight:700;color:#fff;letter-spacing:0.5px">סקריפט רילס</p>
          </div>
          <div style="padding:18px 20px;font-size:14px;color:#1e293b;line-height:1.8;white-space:pre-wrap">{drafts["reel"]}</div>
        </div>'''

    if "newsletter" in drafts:
        sections_html += f'''
        <div style="background:#f7f8fc;border-radius:14px;border:1px solid rgba(0,0,0,.05);margin-bottom:16px;overflow:hidden">
          <div style="background:linear-gradient(90deg,#00cec9,#55efc4);padding:12px 20px">
            <p style="margin:0;font-size:12px;font-weight:700;color:#fff;letter-spacing:0.5px">טיפ לניוזלטר</p>
          </div>
          <div style="padding:18px 20px;font-size:14px;color:#1e293b;line-height:1.8;white-space:pre-wrap">{drafts["newsletter"]}</div>
        </div>'''

    from html import escape
    import urllib.parse
    editor_data = urllib.parse.quote(json.dumps({
        "title": title,
        "post": drafts.get("post", ""),
        "reel": drafts.get("reel", ""),
        "newsletter": drafts.get("newsletter", ""),
    }, ensure_ascii=False))
    editor_url = f"https://meytalp-dev.github.io/ort-training/marketing/draft-editor.html#{editor_data}"

    return f'''<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>טיוטות לאישור — {he_date}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;600;700;800&family=Rubik:wght@500;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Heebo',Arial,sans-serif;direction:rtl;text-align:right">
  <div style="display:none;max-height:0;overflow:hidden">טיוטות לאישור — {he_date} | {len(drafts)} טיוטות מוכנות</div>

  <div style="max-width:640px;margin:24px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.10)">
    <div style="height:5px;background:linear-gradient(90deg,#00b4d8,#e84393,#00cec9)"></div>

    <!-- Header -->
    <div style="padding:28px 32px 20px">
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td><span style="font-weight:800;font-size:18px;color:#1e293b">Learni</span></td>
          <td style="text-align:left"><span style="background:#f0f4f8;color:#64748b;padding:4px 14px;border-radius:16px;font-size:12px;font-weight:600">{he_date}</span></td>
        </tr>
      </table>
      <h1 style="margin:16px 0 6px;font-size:22px;font-weight:800;color:#1e293b;font-family:'Rubik',Arial,sans-serif">
        טיוטות לאישור
      </h1>
      <p style="margin:0;font-size:13px;color:#64748b">בהתבסס על: <strong style="color:#1e293b">{escape(title)}</strong></p>
    </div>

    <!-- Edit button -->
    <div style="margin:0 28px 20px;text-align:center">
      <a href="{editor_url}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#00b4d8,#0096b7);color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:15px;font-weight:700;box-shadow:0 4px 15px rgba(0,180,216,.3)">
        ערכי טיוטות
      </a>
      <p style="margin:8px 0 0;font-size:11px;color:#94a3b8">עובד גם ממובייל</p>
    </div>

    <!-- Notice -->
    <div style="margin:0 28px 20px;padding:14px 18px;background:#e0f7fc;border-radius:12px;border:1px solid #9de2ef">
      <p style="margin:0;font-size:13px;color:#0096b7;font-weight:600">הטיוטות מחכות לאישורך — לא פורסם כלום עדיין.</p>
    </div>

    <!-- Drafts -->
    <div style="padding:0 28px 8px">
      {sections_html}
    </div>

    <!-- Footer -->
    <div style="background:#1e293b;padding:20px 28px">
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td><span style="font-weight:700;color:#fff;font-size:14px">Learni</span></td>
          <td style="text-align:left"><span style="font-size:11px;color:rgba(255,255,255,.4)">טיוטות אוטומטיות | {date}</span></td>
        </tr>
      </table>
    </div>
  </div>
</body>
</html>'''


def send_drafts_email(date, item, html_body):
    """Send the content drafts email for approval."""
    title = item.get("title", "")
    actions = item.get("content_actions", [])
    actions_str = " + ".join(actions) if actions else "טיוטות"
    payload = {
        "action": "aiDigest",
        "html_body": html_body,
        "date": date,
        "notebook_url": "",
        "summary": f"טיוטות לאישור: {title}",
    }
    r = httpx.post(APPS_SCRIPT_URL, json=payload, follow_redirects=True, timeout=30)
    subject_override = f"טיוטות לאישור — {actions_str} | {date}"
    print(f"Drafts email: {r.status_code}")


TIPS_JSON = os.path.join(os.path.dirname(__file__), "tips-data.json")

CATEGORY_KEYWORDS = {
    "claude": ["claude", "anthropic", "mythos", "mcp", "claude code"],
    "education": ["חינוך", "למידה", "מורים", "תלמידים", "ויקיפדיה", "אוניברסיט"],
    "tips": ["טיפ", "גישה", "שיטה", "מומלץ", "כדאי", "שימו לב", "prompt", "claude.md"],
}


def classify_tip(title, summary):
    """Classify a tip into a category based on keywords."""
    text = (title + " " + summary).lower()
    for cat, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            return cat
    return "tools"


def parse_tips_from_summary(summary):
    """Extract individual tips from the markdown summary."""
    tips = []
    lines = summary.split("\n")
    current_title = ""
    current_summary = ""

    for line in lines:
        line = line.strip()
        if not line:
            continue
        # Bullet point with bold title
        match = re.match(r'^[-*]\s+\*\*(.+?)\*\*\s*[-—:]\s*(.+)$', line)
        if match:
            if current_title:
                tips.append({"title": current_title, "summary": current_summary})
            current_title = match.group(1).strip()
            current_summary = match.group(2).strip()
        elif re.match(r'^[-*]\s+\*\*(.+?)\*\*', line):
            match2 = re.match(r'^[-*]\s+\*\*(.+?)\*\*(.*)$', line)
            if match2:
                if current_title:
                    tips.append({"title": current_title, "summary": current_summary})
                current_title = match2.group(1).strip()
                current_summary = match2.group(2).strip().lstrip(':-— ')

    if current_title:
        tips.append({"title": current_title, "summary": current_summary})

    return tips


def update_tips_library(date, summary):
    """Parse tips from summary and add to tips-data.json."""
    # Load existing tips
    existing = []
    if os.path.exists(TIPS_JSON):
        with open(TIPS_JSON, 'r', encoding='utf-8') as f:
            existing = json.load(f)

    # Check if today already added
    existing_dates = {t["id"].rsplit("-", 1)[0] for t in existing}
    if date in [t["date"] for t in existing if t["date"] == date]:
        print(f"Tips for {date} already in library, skipping.")
        return

    # Parse new tips
    new_tips = parse_tips_from_summary(summary)
    print(f"Parsed {len(new_tips)} tips from digest")

    for i, tip in enumerate(new_tips, 1):
        category = classify_tip(tip["title"], tip["summary"])
        existing.append({
            "id": f"{date}-{i:03d}",
            "date": date,
            "category": category,
            "title": tip["title"],
            "summary": tip["summary"],
            "source": "AI Digest"
        })

    # Save
    with open(TIPS_JSON, 'w', encoding='utf-8') as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)

    print(f"Tips library updated: {len(existing)} total tips")


if __name__ == "__main__":
    result = asyncio.run(create_daily_digest())
