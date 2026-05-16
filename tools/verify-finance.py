#!/usr/bin/env python3
"""
verify-finance.py — Pedagogical verification for financial education content.
─────────────────────────────────────────────────────────────────────────────
Same architecture as verify-pedagogy.py but tuned for financial / economic
claims (definitions, methods, numbers, sources).

Sends each claim to Perplexity (sonar-pro) and Gemini (cross-check). Forces
the LLM to identify the specific claim component and cite authoritative
sources (NGPF, Khan Academy, MoneySmart, Israeli Ministry of Finance,
Bank of Israel, etc.) before issuing a verdict.

Usage:
    python verify-finance.py claims.json [--out report.md]

Same input JSON format as verify-pedagogy.py.
"""
import argparse
import json
import os
import re
import sys
import urllib.request
import urllib.error


PPLX_URL = "https://api.perplexity.ai/chat/completions"
PPLX_MODEL = "sonar-pro"
GEMINI_MODEL = "gemini-2.5-flash"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

SYSTEM_PROMPT = (
    "אתה מומחה לחינוך פיננסי — מכיר את התוכניות המובילות בעולם (NGPF, Khan Academy, "
    "MoneySmart Australia, BBC Bitesize), את הרגולציה הישראלית (בנק ישראל, רשות ני\"ע, "
    "משרד החינוך), ואת המתודולוגיות הקלאסיות (Kakeibo, Lean Canvas, SMART, Bean Game).\n\n"
    "כלל-ברזל: **אל תאשר טענה כקבוצה. פרק אותה לרכיביה ואמת כל רכיב מול מקור סמכותי.**\n\n"
    "אם הטענה מזכירה:\n"
    "  • מתודולוגיה (Kakeibo / Lean Canvas / SMART) — אמת את ההגדרה והמקור.\n"
    "  • שיטה (50/30/20 / Zero-Based) — אמת את הנוסחה ואת מקור הניסוח.\n"
    "  • נתון מספרי (משכורת / מחיר / שיעור עמלה / נתון PISA) — אמת מקור עדכני, 2024-2026.\n"
    "  • טענה היסטורית (Kakeibo בן 120 שנה, NGPF הוקם...) — אמת תאריך.\n"
    "  • נתון מדיני (חוק, רגולציה) — אמת חוק ספציפי.\n\n"
    "**אסור לבסס על 'ידוע ש...' או 'בדרך כלל...'. רק על מקור ספציפי שאתה יכול לציין.**\n"
    "אם אין לך מקור — verdict = 'לא בטוח'.\n\n"
    "החזר JSON תקני בלבד:\n"
    "{\n"
    '  "component": "הרכיב הספציפי שבדקת",\n'
    '  "verdict": "תקין" | "שגוי" | "לא בטוח",\n'
    '  "reason": "הסבר 1-2 משפטים",\n'
    '  "source": "ציטוט קצר + שם המקור (NGPF / Bank of Israel / Ministry / ...)"\n'
    "}"
)


def query_perplexity(api_key: str, user_prompt: str, max_tokens: int = 700) -> dict:
    body = json.dumps({
        "model": PPLX_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        "max_tokens": max_tokens,
        "temperature": 0.1,
    }).encode("utf-8")

    req = urllib.request.Request(
        PPLX_URL,
        data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json; charset=utf-8",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return {"error": f"HTTP {e.code}: {e.read().decode('utf-8')[:300]}"}
    except Exception as e:
        return {"error": str(e)}


def parse_verdict(text: str) -> dict:
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if not m:
        return {"verdict": "לא בטוח", "reason": text[:200], "source": "—"}
    try:
        return json.loads(m.group(0))
    except json.JSONDecodeError:
        return {"verdict": "לא בטוח", "reason": text[:200], "source": "—"}


def query_gemini(api_key: str, user_prompt: str) -> dict:
    body = json.dumps({
        "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
        "generationConfig": {"temperature": 0.1, "maxOutputTokens": 700, "responseMimeType": "application/json"},
    }).encode("utf-8")

    req = urllib.request.Request(
        f"{GEMINI_URL}?key={api_key}",
        data=body,
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return parse_verdict(text)
    except Exception as e:
        return {"verdict": "שגיאה", "reason": str(e)[:200], "source": "—"}


def verify_claim(pplx_key: str, gemini_key, topic: str, claim_text: str) -> dict:
    user_prompt = (
        f"נושא: {topic}\n\n"
        f'קביעה לבדיקה: "{claim_text}"\n\n'
        "פרק לרכיב הספציפי שאפשר לאמת, אמת מול מקור סמכותי, החזר JSON."
    )
    resp = query_perplexity(pplx_key, user_prompt)
    if "error" in resp:
        return {"verdict": "שגיאה", "reason": resp["error"], "source": "—", "citations": [], "gemini": None}

    try:
        text = resp["choices"][0]["message"]["content"]
        verdict = parse_verdict(text)
        verdict["citations"] = resp.get("citations", [])[:3]
    except (KeyError, IndexError):
        verdict = {"verdict": "שגיאה", "reason": "תגובה לא תקינה", "source": "—", "citations": []}

    if gemini_key:
        verdict["gemini"] = query_gemini(gemini_key, user_prompt)
        if (verdict["gemini"].get("verdict") in ("שגוי", "לא בטוח") and verdict.get("verdict") == "תקין"):
            verdict["disagreement"] = True
            verdict["verdict"] = "לא בטוח"
            verdict["reason"] = f"⚠️ אי-הסכמה: פרפלקסיטי='תקין', ג'מיני='{verdict['gemini'].get('verdict')}'. {verdict.get('reason','')}"
    else:
        verdict["gemini"] = None

    return verdict


def emoji_for(verdict: str) -> str:
    return {"תקין": "✅", "שגוי": "❌", "לא בטוח": "⚠️", "שגיאה": "🔧"}.get(verdict, "❓")


def main():
    parser = argparse.ArgumentParser(description="Verify financial education claims via Perplexity.")
    parser.add_argument("claims_file")
    parser.add_argument("--key", default=os.environ.get("PERPLEXITY_API_KEY"))
    parser.add_argument("--gemini-key", default=os.environ.get("GEMINI_API_KEY"))
    parser.add_argument("--out")
    args = parser.parse_args()

    if not args.key:
        print("ERROR: PERPLEXITY_API_KEY not set.", file=sys.stderr)
        sys.exit(2)

    with open(args.claims_file, encoding="utf-8") as f:
        data = json.load(f)

    topic = data.get("topic", "")
    level = data.get("level", "")
    claims = data.get("claims", [])

    lines = [
        f"# אימות חינוכי-פיננסי — {topic}",
        f"_רמה: {level}_",
        f"_נבדקו {len(claims)} קביעות מול Perplexity (sonar-pro)._",
        "",
    ]
    summary = {"תקין": 0, "שגוי": 0, "לא בטוח": 0, "שגיאה": 0}

    for c in claims:
        cid = c.get("id", "?")
        claim_text = c["claim"]
        result = verify_claim(args.key, args.gemini_key, topic, claim_text)
        verdict = result.get("verdict", "לא בטוח")
        summary[verdict] = summary.get(verdict, 0) + 1
        emoji = emoji_for(verdict)
        lines.append(f"## {emoji} {cid} — {verdict}")
        lines.append(f"**קביעה:** {claim_text}")
        if result.get("component"):
            lines.append(f"**רכיב שנבדק:** {result.get('component')}")
        lines.append(f"**הסבר:** {result.get('reason', '—')}")
        lines.append(f"**מקור:** {result.get('source', '—')}")
        cites = result.get("citations", [])
        if cites:
            lines.append("**ציטוטים:**")
            for cite in cites:
                lines.append(f"- {cite}")
        gem = result.get("gemini")
        if gem:
            gem_verdict = gem.get("verdict", "—")
            gem_emoji = emoji_for(gem_verdict)
            lines.append(f"**קרוס-צ'ק ג'מיני:** {gem_emoji} {gem_verdict}")
            lines.append(f"  ↳ _{gem.get('reason','—')}_")
        if result.get("disagreement"):
            lines.append("**⚠️ אזהרה: אי-הסכמה בין המודלים.**")
        lines.append("")

    lines.insert(3, f"**סיכום:** ✅ {summary['תקין']} · ❌ {summary['שגוי']} · ⚠️ {summary['לא בטוח']} · 🔧 {summary['שגיאה']}\n")

    report = "\n".join(lines)
    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(report)
        print(f"Wrote report to {args.out}")
    else:
        sys.stdout.reconfigure(encoding="utf-8")
        print(report)

    sys.exit(1 if (summary["שגוי"] + summary["לא בטוח"]) > 0 else 0)


if __name__ == "__main__":
    main()
