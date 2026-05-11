#!/usr/bin/env python3
"""
verify-pedagogy.py
──────────────────
Sends a list of pedagogical claims to Perplexity for source-based verification.

Usage:
    python verify-pedagogy.py claims.json

Input JSON format:
    {
      "topic": "חסרי פ\"נ",
      "level": "כיתה י\"א · שאלון 011281",
      "claims": [
        {"id": "C1", "claim": "נֶחְלַשׁ שייכת לגזרת חסרי פ\"נ"},
        {"id": "C2", "claim": "המונח התקני לאותיות א.י.ת.נ הוא 'אות חיים'"}
      ]
    }

Output:
    Markdown report to stdout with ✓/✗ per claim + Perplexity source citations.
    Exit code 0 if all verified, 1 if any failed/uncertain.

Requires:
    PERPLEXITY_API_KEY in env, or pass --key
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

# CRITICAL: Prompt forces DECOMPOSITION before judgment.
# Without this, LLMs confirm phrasing bias ("is X true?" → "yes").
SYSTEM_PROMPT = (
    "אתה בלשן עברית מומחה — האקדמיה ללשון העברית ובגרות לשון 011281.\n\n"
    "כלל-ברזל: **אל תאשר טענה ככוללת. פרק אותה לרכיביה ואמת כל רכיב.**\n\n"
    "אם הטענה מזכירה מילה/פועל/שורש — קודם זהה באופן עצמאי:\n"
    "  1. מה השורש האמיתי של המילה (לא מה שהטענה מנחה שהוא)?\n"
    "  2. מה הבניין/הצורה הדקדוקית?\n"
    "  3. רק אז — האם הטענה נכונה?\n\n"
    "אם המילה היא נפעל של שורש אחר (למשל נֶחְלַשׁ = נפעל של ח.ל.שׁ) — הטענה שהיא חסרי פ\"נ שגויה. "
    "ה-נ' היא צורן בניין, לא חלק מהשורש.\n\n"
    "אל תמציא מקורות. אם אין לך מקור סמכותי ספציפי — verdict = 'לא בטוח'.\n\n"
    "החזר JSON תקני בלבד:\n"
    "{\n"
    '  "root": "השורש שזיהית",\n'
    '  "binyan": "הבניין",\n'
    '  "verdict": "תקין" | "שגוי" | "לא בטוח",\n'
    '  "reason": "הסבר קצר",\n'
    '  "source": "ציטוט ממקור סמכותי + שם המקור"\n'
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
    """Extract verdict JSON from Perplexity response text."""
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if not m:
        return {"verdict": "לא בטוח", "reason": text[:200], "source": "—"}
    try:
        return json.loads(m.group(0))
    except json.JSONDecodeError:
        return {"verdict": "לא בטוח", "reason": text[:200], "source": "—"}


def query_gemini(api_key: str, user_prompt: str) -> dict:
    """Cross-check verifier — different LLM, different biases."""
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


def verify_claim(pplx_key: str, gemini_key: str | None, topic: str, claim_text: str) -> dict:
    user_prompt = (
        f"נושא המצגת: {topic}\n\n"
        f'קביעה לבדיקה: "{claim_text}"\n\n'
        "פרק את הקביעה לרכיביה ואמת. החזר JSON עם root / binyan / verdict / reason / source."
    )
    resp = query_perplexity(pplx_key, user_prompt)
    if "error" in resp:
        return {"verdict": "שגיאה", "reason": resp["error"], "source": "—", "citations": [], "gemini": None}

    try:
        text = resp["choices"][0]["message"]["content"]
        verdict = parse_verdict(text)
        verdict["citations"] = resp.get("citations", [])[:3]
    except (KeyError, IndexError):
        verdict = {"verdict": "שגיאה", "reason": "תגובה לא תקינה מ-Perplexity", "source": "—", "citations": []}

    # Cross-check with Gemini if key provided
    if gemini_key:
        verdict["gemini"] = query_gemini(gemini_key, user_prompt)
        # Disagreement detection: if Perplexity says תקין but Gemini says שגוי (or vice versa) — escalate
        if (verdict["gemini"].get("verdict") in ("שגוי", "לא בטוח") and verdict.get("verdict") == "תקין"):
            verdict["disagreement"] = True
            verdict["verdict"] = "לא בטוח"
            verdict["reason"] = f"⚠️ אי-הסכמה: פרפלקסיטי='תקין', ג'מיני='{verdict['gemini'].get('verdict')}'. {verdict.get('reason','')}"
    else:
        verdict["gemini"] = None

    return verdict


def emoji_for(verdict: str) -> str:
    return {
        "תקין": "✅",
        "שגוי": "❌",
        "לא בטוח": "⚠️",
        "שגיאה": "🔧",
    }.get(verdict, "❓")


def main():
    parser = argparse.ArgumentParser(description="Verify pedagogical claims via Perplexity.")
    parser.add_argument("claims_file", help="Path to JSON file with claims")
    parser.add_argument("--key", default=os.environ.get("PERPLEXITY_API_KEY"))
    parser.add_argument("--gemini-key", default=os.environ.get("GEMINI_API_KEY"),
                        help="Optional — cross-check each claim with Gemini (catches LLM-bias hallucinations)")
    parser.add_argument("--out", help="Optional path to write Markdown report")
    args = parser.parse_args()

    if not args.key:
        print("ERROR: PERPLEXITY_API_KEY not set (env or --key).", file=sys.stderr)
        sys.exit(2)

    with open(args.claims_file, encoding="utf-8") as f:
        data = json.load(f)

    topic = data.get("topic", "")
    level = data.get("level", "")
    claims = data.get("claims", [])

    lines = [
        f"# דוח אימות פדגוגי — {topic}",
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
        if result.get("root"):
            lines.append(f"**ניתוח Perplexity:** שורש={result.get('root')} · בניין={result.get('binyan','—')}")
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
            lines.append(f"**קרוס-צ'ק ג'מיני:** {gem_emoji} {gem_verdict} · שורש={gem.get('root','—')} · בניין={gem.get('binyan','—')}")
            lines.append(f"  ↳ _{gem.get('reason','—')}_")
        if result.get("disagreement"):
            lines.append("**⚠️ אזהרה: אי-הסכמה בין המודלים — לבדוק ידנית.**")
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
