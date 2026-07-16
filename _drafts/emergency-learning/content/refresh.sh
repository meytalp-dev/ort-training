#!/usr/bin/env bash
# רֶצֶף — "רַעֲנֵן": סורק את המצב האמיתי של הריפו.
# מריצים: bash _drafts/emergency-learning/content/refresh.sh
#
# למה זה קיים: GPT לא דוחף באופן עקבי (פעם ל-main, פעם לענף צדדי בלי PR,
# פעם רק לצ'אט). הלוח קורא רק מ-main → עבודה שנחתה בענף נעלמת מהעיניים.
# הסקריפט הזה סורק main *וגם* את כל הענפים, ומדגיש מה יתום.

set -u
cd "$(git rev-parse --show-toplevel)" || exit 1
C="_drafts/emergency-learning/content"

echo "════════════════════════════════════════"
echo "  רֶצֶף · רַעֲנֵן — מצב אמיתי"
echo "════════════════════════════════════════"

echo
echo "── מושך מ-origin ──"
git fetch --all --prune --quiet 2>/dev/null
git pull --quiet --no-rebase origin main 2>/dev/null && echo "main מעודכן" || echo "⚠ pull נכשל — בדוק ידנית"

echo
echo "── מסנכרן את הלוח למציאות (produced.js) ──"
if command -v node >/dev/null 2>&1; then
  node "$C/gen-produced.js" || echo "⚠ gen-produced נכשל — הלוח עלול להציג מספרים ישנים"
else
  echo "⚠ node לא נמצא — produced.js לא סונכרן"
fi

echo
echo "── יחידות ב-main, לפי מודולה ──"
total=0
for d in $(find "$C" -mindepth 2 -maxdepth 2 -type d -name "module-*" | sort); do
  n=$(find "$d" -name "unit-*.md" 2>/dev/null | wc -l)
  total=$((total + n))
  printf "  %-46s %3d\n" "${d#$C/}" "$n"
done
echo "  ─────────────────────────────────────────"
printf "  %-46s %3d\n" "סה\"כ" "$total"

echo
echo "── ⚠ ענפים יתומים (עבודה שלא ב-main) ──"
found=0
for b in $(git branch -r --format='%(refname:short)' | grep -v 'HEAD\|/main$'); do
  ahead=$(git rev-list --count "main..$b" 2>/dev/null || echo 0)
  [ "$ahead" -eq 0 ] && continue
  found=1
  units=$(git diff --name-only "main...$b" 2>/dev/null | grep -c "unit-.*\.md$")
  when=$(git log -1 --format='%ad' --date=format:'%d.%m %H:%M' "$b")
  echo "  🔶 $b"
  echo "     $ahead קומיטים · $units יחידות · אחרון: $when"
  echo "     → לא ב-main. לא בלוח. דורש הכרעה: למזג או לדחות."
done
[ "$found" -eq 0 ] && echo "  ✅ אין. כל העבודה ב-main."

echo
echo "── ⚠ קישורים שבורים במניפסטים ──"
# מדלגים על שורות "מתוכנן" — מניפסט תקין מפרט גם יחידות עתידיות שטרם הופקו.
# זה לא שבר: GPT כותב "— קיים —" למה שהפיק ו"— מתוכנן —" לשאר.
bad=0
for m in $(find "$C" -name "_manifest.md"); do
  dir=$(dirname "$m")
  while IFS= read -r line; do
    case "$line" in *מתוכנן*) continue ;; esac
    f=$(printf '%s' "$line" | grep -o "unit-[a-z0-9-]*\.md" | head -1)
    [ -z "$f" ] && continue
    if [ ! -f "$dir/$f" ]; then echo "  🔴 ${m#$C/} → $f (מוצהר כקיים, חסר בדיסק)"; bad=1; fi
  done < "$m"
done
[ "$bad" -eq 0 ] && echo "  ✅ אין."

echo
echo "── ⚠ תוויות רמה אסורות (DNA §0: התלמיד לא רואה תווית רמה) ──"
hits=$(grep -rl "רמה: מתקשה\|רמה: חלש\|רמה נמוכה" "$C" --include="unit-*.md" 2>/dev/null)
if [ -n "$hits" ]; then echo "$hits" | sed "s|$C/|  🔴 |"; else echo "  ✅ אין."; fi

echo
echo "════════════════════════════════════════"
echo "  הבא: Claude מפריך את החדש ומתעד ב-refutation-log.md"
echo "════════════════════════════════════════"
