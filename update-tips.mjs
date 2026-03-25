#!/usr/bin/env node
/**
 * Claude Code Tips Agent - סוכן טיפים יומי
 * מייצר טיפים חדשים על Claude Code ומעדכן את דף links.html
 *
 * Usage:
 *   export ANTHROPIC_API_KEY="sk-ant-..."
 *   node update-tips.mjs
 *
 * Cron (twice daily):
 *   0 8,20 * * * cd /path/to/project && node update-tips.mjs >> /tmp/tips.log 2>&1
 */

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const HTML_FILE = join(__dirname, "docs", "training", "claude-code", "links.html");
const MODEL = "claude-haiku-4-5";

const START_MARKER = "<!-- AUTO-GENERATED: Daily Tip - DO NOT EDIT -->";
const END_MARKER = "<!-- END: Daily Tip -->";

// Existing tips so Claude generates different ones
const EXISTING_TIPS = [
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
];

const PROMPT = `אתה מומחה ל-Claude Code (הכלי של Anthropic לפיתוח מהטרמינל/VSCode).
קהל היעד: מורים בבתי ספר מקצועיים בישראל שמתחילים להשתמש ב-Claude Code.

ייצר בדיוק 2 טיפים חדשים, מעשיים ומפתיעים על Claude Code.

כללים:
- עברית פשוטה וקצרה (משפט אחד לכותרת, 1-2 משפטים לתיאור)
- טיפים מעשיים שאפשר ליישם מיד
- שונים מהטיפים הקיימים: ${EXISTING_TIPS.join(", ")}
- כל טיפ שייך לאחת הקטגוריות: communication, methods, shortcuts, errors

החזר JSON בלבד (בלי markdown, בלי \`\`\`):
[
  {"category": "communication|methods|shortcuts|errors", "title": "כותרת קצרה", "description": "תיאור קצר ומעשי"}
]`;

const CATEGORY_COLORS = {
  communication: "#14B8A6",
  methods: "#7C3AED",
  shortcuts: "#F59E0B",
  errors: "#E76F7A",
};

const CATEGORY_ICONS = {
  communication:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  methods:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
  shortcuts:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 16h8"/></svg>',
  errors:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>',
};

// --- Generate tips via Claude API ---
async function generateTips() {
  const client = new Anthropic();
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: PROMPT }],
  });

  let text = response.content[0].text.trim();
  // Clean potential markdown wrapper
  text = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");

  const tips = JSON.parse(text);
  if (!Array.isArray(tips) || tips.length === 0) {
    throw new Error(`Expected array of tips, got: ${text}`);
  }
  return tips;
}

// --- Build HTML section ---
function buildHtml(tips) {
  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const cards = tips.map((tip) => {
    const cat = tip.category || "methods";
    const color = CATEGORY_COLORS[cat] || "#7C3AED";
    const icon = CATEGORY_ICONS[cat] || CATEGORY_ICONS.methods;
    return `            <div class="tip-item">
                <div style="color:${color}; flex-shrink:0; margin-top:2px;">${icon}</div>
                <div>
                    <div class="tip-item-title">${tip.title}</div>
                    <div class="tip-item-desc">${tip.description}</div>
                </div>
            </div>`;
  });

  return `${START_MARKER}
        <!-- Daily Tip Floating Button -->
        <button class="daily-tip-btn" onclick="toggleDailyTip()" title="הטיפ היומי" id="daily-tip">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"/></svg>
        </button>

        <!-- Daily Tip Overlay -->
        <div class="daily-tip-overlay" id="tipOverlay" onclick="toggleDailyTip()"></div>

        <!-- Daily Tip Drawer -->
        <div class="daily-tip-drawer" id="tipDrawer">
            <div class="daily-tip-drawer-header">
                <h3>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"/></svg>
                    הטיפ היומי
                </h3>
                <button class="close-btn" onclick="toggleDailyTip()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
            <div class="tip-date">עודכן: ${dateStr}</div>
${cards.join("\n")}
        </div>
        ${END_MARKER}`;
}

// --- Update HTML file ---
function updateHtml(newSection) {
  let html = readFileSync(HTML_FILE, "utf-8");

  const markerRegex = new RegExp(
    escapeRegExp(START_MARKER) + "[\\s\\S]*?" + escapeRegExp(END_MARKER)
  );

  if (markerRegex.test(html)) {
    html = html.replace(markerRegex, newSection);
  } else {
    const insertPoint = "<!-- ============ TIPS ACCORDION ============ -->";
    if (html.includes(insertPoint)) {
      html = html.replace(insertPoint, newSection + "\n\n        " + insertPoint);
    } else {
      console.error("ERROR: Could not find insertion point in HTML");
      process.exit(1);
    }
  }

  writeFileSync(HTML_FILE, html, "utf-8");
  console.log(`Updated: ${HTML_FILE}`);
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// --- Git commit + push ---
function gitCommitPush() {
  try {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    execSync(`git add "${HTML_FILE}"`, { cwd: __dirname });
    execSync(`git commit -m "Update daily tip (${dateStr})"`, { cwd: __dirname });
    execSync("git push", { cwd: __dirname });
    console.log("Git: committed and pushed");
  } catch (err) {
    console.error("Git error:", err.message);
  }
}

// --- Main ---
async function main() {
  console.log(`[${new Date().toISOString()}] Starting tips update...`);

  const tips = await generateTips();
  console.log(`Generated ${tips.length} tips:`);
  for (const t of tips) {
    console.log(`  - [${t.category}] ${t.title}`);
  }

  const sectionHtml = buildHtml(tips);
  updateHtml(sectionHtml);
  gitCommitPush();

  console.log("Done!");
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
