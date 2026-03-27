const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, HeadingLevel,
  PageBreak
} = require("docx");

// RTL helper
const rtlPara = (children, opts = {}) =>
  new Paragraph({
    bidirectional: true,
    alignment: AlignmentType.RIGHT,
    ...opts,
    children,
  });

const rtlRun = (text, opts = {}) =>
  new TextRun({ text, rightToLeft: true, font: "David", ...opts });

// Border style
const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
const borders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

// Cell margins
const cellMargins = { top: 40, bottom: 40, left: 80, right: 80 };

// Header cell (shaded)
const headerCell = (text, width) =>
  new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
    margins: cellMargins,
    verticalAlign: "center",
    children: [rtlPara([rtlRun(text, { bold: true, size: 20, font: "David" })], { alignment: AlignmentType.CENTER })],
  });

// Data cell
const dataCell = (text, width, opts = {}) =>
  new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    margins: cellMargins,
    verticalAlign: "center",
    children: [rtlPara([rtlRun(text, { size: 18, font: "David" })], { alignment: opts.center ? AlignmentType.CENTER : AlignmentType.RIGHT })],
  });

// Meetings data
const meetings = [
  { num: "1", topic: "מבוא לפסיכולוגיה חיובית", date: "18.1", content: "חשיפה למרכיבי הליבה, הרעיונות והנחות היסוד של הפסיכולוגיה החיובית" },
  { num: "2", topic: "שינוי הינו אפשרי – הלכה למעשה", date: "1.2", content: "כוחה של האמונה בשינוי, התערבויות חינוכיות מבוססות מחקר שחוללו שינויים חיוביים" },
  { num: "3", topic: "הרשות להיות אנושי", date: "15.2", content: "היכולת לאפשר לעצמנו מרחב להרגיש ולבטא את מגוון הרגשות האנושיים" },
  { num: "4", topic: "רגשות חיוביים", date: "1.3", content: "גישת ההרחבה והבניה – חשיבות העלאת רגשות חיוביים באופן יזום לקידום צמיחה פסיכולוגית" },
  { num: "5", topic: "מאמונות למציאות", date: "15.3", content: "הקשר בין אמונות למציאות – ציפיות חיוביות, אופטימיות ותקווה, מיקוד ופרשנות חיובית" },
  { num: "6", topic: "שינוי – הלכה למעשה", date: "12.4", content: "דרכים ליצירת שינוי מהותי, יציב וממושך – ה-ABC של הפסיכולוגיה: רגש, התנהגות ומחשבה" },
  { num: "7", topic: "פוקוס והכרת תודה כדרך חיים", date: "19.4", content: "תפקיד המיקוד והפרשנות ביצירת מציאות חיינו; כלים לטיפוח הכרת תודה והערכה" },
  { num: "8", topic: "חוזקות אישיות", date: "3.5", content: "זיהוי חוזקות אופי אישיות והגברת מודעות לשימוש בהן בתחומי חיים שונים" },
  { num: "9", topic: "הצבת מטרות אישיות ויישומן", date: "10.5", content: "הצבת מטרות מותאמות לעצמי (Self Concordant Goals), ניסוח ותכנון מטרות משמעותיות" },
  { num: "10", topic: "גוף ונפש בעבודה החינוכית", date: "17.5", content: "איזון בין גוף ונפש – שינה, תזונה, אימון גופני, איזון רגשי וקשיבות פנימית" },
  { num: "11", topic: "מדיטציה מודעת – קשיבות", date: "24.5", content: "מיינדפולנס – היכולת להיות נוכח בהווה; הפחתת מתח, שיפור איכות חיים ויציבות נפשית" },
  { num: "12", topic: "לחץ וזרימה", date: "31.5", content: "כלים מבוססי מחקר למיתון חווית לחץ והגברת חוויות של זרימה (Flow) ושלווה" },
  { num: "13", topic: "פרפקציוניזם וקבלה עצמית", date: "7.6", content: "התמודדות עם ביקורת עצמית, קבלה עצמית, והצמיחה מכשלונות" },
];

// Column widths (total = ~14400 for landscape A4 with small margins)
// Columns RTL: מנחה | שעות המפגש | תאריך | סך שעות | מטרות/תוכן | סוג מפגש | נושא המפגש | יחידת לימוד
const colWidths = [1400, 1400, 1400, 1100, 4200, 1200, 2600, 1100];
const totalWidth = colWidths.reduce((a, b) => a + b, 0);

// Build header row
const headerRow = new TableRow({
  tableHeader: true,
  children: [
    headerCell("מנחה המפגש", colWidths[0]),
    headerCell("שעות המפגש", colWidths[1]),
    headerCell("תאריך מפגש", colWidths[2]),
    headerCell("סך שעות אקדמיות", colWidths[3]),
    headerCell("מטרות/תוכן", colWidths[4]),
    headerCell("סוג מפגש\nמקוון? פרונטלי?", colWidths[5]),
    headerCell("נושא המפגש", colWidths[6]),
    headerCell("יחידת לימוד", colWidths[7]),
  ],
});

// Build data rows
const dataRows = meetings.map((m) =>
  new TableRow({
    children: [
      dataCell("מיכל גולדפרב", colWidths[0], { center: true }),  // מנחה
      dataCell("13:30-15:30", colWidths[1], { center: true }),  // שעות המפגש
      dataCell(m.date || "", colWidths[2], { center: true }),   // תאריך
      dataCell("2", colWidths[3], { center: true }),            // סך שעות
      dataCell(m.content, colWidths[4]),                    // מטרות/תוכן
      dataCell("פרונטלי", colWidths[5], { center: true }), // סוג מפגש
      dataCell(m.topic, colWidths[6]),                      // נושא
      dataCell(m.num, colWidths[7], { center: true }),      // יחידת לימוד
    ],
  })
);

// Bullet field
const bulletField = (label, value, highlight = false) =>
  rtlPara([
    rtlRun("• ", { size: 22, font: "David" }),
    rtlRun(label + ": ", { bold: true, size: 22, font: "David" }),
    rtlRun(value, {
      size: 22,
      font: "David",
      ...(highlight ? { shading: { fill: "FFFF00", type: ShadingType.CLEAR } } : {}),
    }),
  ], { spacing: { after: 80 } });

const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          size: {
            width: 11906,   // A4 short edge
            height: 16838,  // A4 long edge
            orientation: "landscape",
          },
          margin: { top: 720, right: 720, bottom: 720, left: 720 },
        },
      },
      children: [
        // Title
        rtlPara(
          [rtlRun("סילבוס השתלמות ", { bold: true, size: 40, font: "David" }),
           rtlRun("מיטיב – פסיכולוגיה חיובית – שנה ראשונה", { bold: true, size: 40, font: "David", underline: {} })],
          { alignment: AlignmentType.CENTER, spacing: { after: 300 } }
        ),

        // Fields
        bulletField("תחום דעת", "פסיכולוגיה חיובית"),
        bulletField("קהל יעד", "אנשי חינוך – מורים, יועצים, מנהלים"),
        bulletField("מידע מורחב",
          "תוכנית מיטיב מבוססת על מחקר מתחום הפסיכולוגיה החיובית ועוסקת בתפקוד המיטבי של אנשים וקבוצות. התוכנית מספקת כלים מעשיים לקידום רגשות חיוביים, חוזקות אישיות, מימוש עצמי ורווחה נפשית בקרב אנשי חינוך ותלמידים.",
          true),
        bulletField("נושאים מרכזיים",
          "רגשות חיוביים ורווחה נפשית; חוזקות אישיות ומימוש עצמי; קשיבות, זרימה ואיזון גוף-נפש; מערכות יחסים ותמיכה חברתית",
          true),
        bulletField("מטרות",
          "הכרת עקרונות הפסיכולוגיה החיובית; פיתוח כלים מעשיים לקידום רווחה נפשית; זיהוי וחיזוק חוזקות אישיות; יישום בסביבה החינוכית",
          true),
        bulletField("מבנה ההשתלמות", "13 מפגשים פרונטליים"),
        bulletField("דרישות לקבלת גמול", "נוכחות במפגשים והגשת משימת סיכום"),
        bulletField("לוח זמנים", ""),

        // Spacer
        new Paragraph({ spacing: { after: 200 }, children: [] }),

        // Table
        new Table({
          width: { size: totalWidth, type: WidthType.DXA },
          columnWidths: colWidths,
          rows: [headerRow, ...dataRows],
        }),

        // Footer note
        new Paragraph({ spacing: { before: 200 }, children: [] }),
        rtlPara(
          [rtlRun("הגשת מטלת סיום עד לתאריך– (לא יאוחר מה 1.6)", { size: 20, font: "David", bold: true })],
          { alignment: AlignmentType.CENTER }
        ),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("syllabus-meitiv-v3.docx", buffer);
  console.log("Created syllabus-meitiv-v3.docx");
});
