/* רֶצֶף — מודולות שכבר הופקו + שלב בפס. מפתח: subjId|מספר-מודולה → {n: מס' יחידות, stage}.
 * stage: "built" = GPT סיים ייצור (טיוטה בריפו) · "reviewed" = Claude בדק (הערות ב-refutation-log.md).
 * נוצר אוטומטית מסריקת הדיסק ע"י refresh.sh/רַעֲנֵן. עודכן: 16.7.2026 (ערב — אחרי שחרור חסם ה"כתבי המשך"). */
window.PRODUCED = {
  "hair-design|1": { n: 15, stage: "reviewed" },
  "hair-design|2": { n: 12, stage: "reviewed" },
  "hair-design|4": { n: 9, stage: "reviewed" },
  "hair-design|5": { n: 11, stage: "reviewed" },
  "hair-design|7": { n: 11, stage: "reviewed" },
  "hair-design|8": { n: 9, stage: "reviewed" },
  "hair-design|9": { n: 3, stage: "built" },
  "confectionery|2": { n: 10, stage: "reviewed" },
  "media-design|1": { n: 6, stage: "built" },
  "media-design|2": { n: 2, stage: "built" },
  "media-design|3": { n: 2, stage: "built" },
  "media-design|4": { n: 1, stage: "built" },
  "media-design|5": { n: 1, stage: "reviewed" },
  "media-design|6": { n: 1, stage: "reviewed" },
  "media-design|8": { n: 9, stage: "built" },
  "media-design|9": { n: 2, stage: "built" },
  "media-design|10": { n: 7, stage: "built" },
  "textile-design|5": { n: 1, stage: "reviewed" },
  "ict-systems|3": { n: 9, stage: "built" },
  "ict-systems|7": { n: 1, stage: "reviewed" },
  "ict-systems|9": { n: 2, stage: "built" },
  "welding|1": { n: 3, stage: "built" },
  "football|4": { n: 2, stage: "built" },
  "hebrew|5": { n: 1, stage: "built" },
  "financial|3": { n: 1, stage: "built" },
  "financial|5": { n: 2, stage: "built" },
  "financial|8": { n: 2, stage: "built" }
};
