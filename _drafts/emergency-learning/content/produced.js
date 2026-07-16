/* רֶצֶף — מודולות שכבר הופקו + שלב בפס. מפתח: subjId|מספר-מודולה → {n: מס' יחידות, stage}.
 * stage: "built" = GPT סיים ייצור (טיוטה בריפו) · "reviewed" = Claude בדק (הערות ב-refutation-log.md).
 * מתעדכן ע"י Claude אחרי git pull. הלוח מסמן ומציב בעמודה הנכונה. עודכן: 16.7.2026 (סבב אימות 2). */
window.PRODUCED = {
  "hair-design|1": { n: 15, stage: "reviewed" },
  "hair-design|2": { n: 12, stage: "reviewed" },
  "hair-design|4": { n: 9,  stage: "reviewed" },
  "hair-design|5": { n: 11, stage: "reviewed" },
  "hair-design|7": { n: 11, stage: "reviewed" },
  "hair-design|8": { n: 9,  stage: "reviewed" },
  "hair-design|9": { n: 3,  stage: "built" },
  "confectionery|2": { n: 10, stage: "reviewed" },
  "media-design|5": { n: 1,  stage: "reviewed" },
  "media-design|6": { n: 1,  stage: "reviewed" },
  "hebrew|5":      { n: 1,  stage: "built" },
  "media-design|1":{ n: 3,  stage: "built" },
  "welding|1":     { n: 3,  stage: "built" }
};
