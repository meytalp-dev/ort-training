/**
 * Schools Data Extractor
 * Extracts data from all school files into a unified JSON database
 * Sources: Climate surveys (xlsx), KBS forms (docx), Committee presentations (pptx), Three-year plans (xlsx)
 */

import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import mammoth from 'mammoth';
import JSZip from 'jszip';
// PDF extraction disabled - Hebrew encoding issues with pdfjs-dist
// PDFs are tracked as metadata only

const BASE = 'imports/schools-data';
const OUTPUT = 'docs/schools-dashboard/schools-data.json';

// Unified school database
const schools = {};

// Known name aliases - maps variant names to canonical name
const NAME_ALIASES = {
  'אנרגיטק': 'עמל אנרגיטק',
  'אנרגי טק': 'עמל אנרגיטק',
  'עמל אנרג י טק': 'עמל אנרגיטק',
  'אנרג_יטק': 'עמל אנרגיטק',
  'בארשבע': 'עתיד באר שבע',
  'יוצר באר שבע': 'עתיד באר שבע',
  'עתיד באר שבע': 'עתיד באר שבע',
  'בית חנינא בנות': 'בית חנינה בנות',
  'טכנולוגי לבנות בית חנינה': 'בית חנינה בנות',
  'בית חנינא בנים': 'בית חנינה בנים',
  'אלאמאני סחנין 54100': 'אלאמאני סכנין',
  'אל אמאני סכנין': 'אלאמאני סכנין',
  'אלאמאני סכנין': 'אלאמאני סכנין',
  'גליל ירכא בנים': 'עתיד ירכא בנים',
  'עתיד בנים ירכא': 'עתיד ירכא בנים',
  'אלמנארה כפר יסיף': 'כפר יאסיף',
  'כפר יסיף': 'כפר יאסיף',
  'כפר יאסיף': 'כפר יאסיף',
  'אור העתיד גן יבנה': 'אור העתיד תורני גן יבנה',
  'אור העתיד תורני גן יבנה': 'אור העתיד תורני גן יבנה',
  'לקיה': 'לקייה',
  'לקייה': 'לקייה',
  'טורעאן': 'טורען',
  'טורען': 'טורען',
  'רמת דויד  1': 'עמל רמת דוד',
  'רמת דויד    רמת דויד': 'עמל רמת דוד',
  'עמל רמת דוד': 'עמל רמת דוד',
  'עמלטק אין': 'עמל טק אין',
  'עמל טק אין': 'עמל טק אין',
  'תיכון החברתי תא יפו': 'התיכון החברתי תל אביב יפו',
  'התיכון החברתי ת א יפו': 'התיכון החברתי תל אביב יפו',
  'חברתי תא': 'התיכון החברתי תל אביב יפו',
  'תיכון חברתי חיפה': 'התיכון החברתי חיפה',
  'התיכון החברתי חיפה תכנית ת': 'התיכון החברתי חיפה',
  'אורט תעשייה אווירית': 'אורט תעשיה אווירית',
  'אורט תעשיה אווירית': 'אורט תעשיה אווירית',
  'תוכנית עבודה ת עתיד מסעדה': 'עתיד מסעדה',
  'עתיד מסעדה': 'עתיד מסעדה',
  'מסעדה': 'עתיד מסעדה',
  'בתי ספרעתיד יוצר ביר אל מכסור': 'עתיד ביר אל מכסור',
  'ביר אל מכסור': 'עתיד ביר אל מכסור',
  'עתיד יוצר קמג': 'עתיד קמג',
  'עתיד קמג': 'עתיד קמג',
  'קמג': 'עתיד קמג',
  'תכנית ת עתיד אור מנחם': 'חבד אור מנחם אשקלון',
  'חבד אור מנחם אשקלון': 'חבד אור מנחם אשקלון',
  'עתיד כפר חבד  אוהלי תמימים': 'עתיד כפר חבד',
  'כפר חבד': 'עתיד כפר חבד',
  'עתיד כפר חבד': 'עתיד כפר חבד',
  'כפר חבד': 'עתיד כפר חבד',
  'טכנולוגי אכסאל': 'אכסאל',
  'אכסאל': 'אכסאל',
  'טכנולוגי אבו סנאן': 'ירכא אבו סנאן',
  'ירכא אבו סנאן': 'ירכא אבו סנאן',
  'טכנולוגי כסרע סמיע': 'כסרא סמיע',
  'כסרא סמיע': 'כסרא סמיע',
  'טכנולוגי בית אל': 'בית אל',
  'בית אל': 'בית אל',
  'באדיאת': 'באדיאת',
  'בדאיאת': 'באדיאת',
  'דרור גליל': 'דרור הגליל',
  'דרור הגליל': 'דרור הגליל',
  'עתיד פלמחים': 'פלמחים',
  'פלמחים': 'פלמחים',
  'צור ים  ת': 'עתיד צור ים',
  'עתיד צור ים': 'עתיד צור ים',
  'זוקו תכנית ת ינואר 26': 'זוקו',
  'זוקו': 'זוקו',
  'עמל טייבה עותק של    2': 'עמל טייבה',
  'עמל טייבה': 'עמל טייבה',
  'שיח': 'תיכון שיח',
  'תיכון שיח': 'תיכון שיח',
  'תיכון החממה': 'תיכון החממה',
  'חממה': 'תיכון החממה',
  'אלאופוק בנים  בתי ספר 54112': 'אלאופוק בנים',
  'עמל רהט)': 'עמל רהט',
  'עמל רהט בנות': 'עמל רהט בנות',
  'עמל רהט בנים': 'עמל רהט בנים',
  'ישיבת חנוך לנער חבד צפת': 'חנוך לנער צפת',
  'מכון חסידי טכנולוגי צפת': 'מכון חסידי צפת',
  'טכנולוגי רימונים טבריה': 'רימונים טבריה',
  'תיכון קולינרי רימונים טבריה': 'רימונים טבריה',
  'טכנולוגי טל חרמון': 'טל חרמון',
  'ישיבת טל חרמון': 'טל חרמון',
  'גוליס בנות': 'עתיד גוליס בנות',
  'עתיד גוליס בנות   ירכא': 'עתיד גוליס בנות',
  'עתיד גוליס בנות': 'עתיד גוליס בנות',
  'מהאראת שפרעם': 'תיכון בקהילה מהאראת שפרעם',
  'תיכון בקהילה מהאראת שפרעם': 'תיכון בקהילה מהאראת שפרעם',
  'עתיד עצמה קרית ביאליק': 'עתיד עצמה קרית ביאליק',
  'מסאראת ואדי ערה': 'מסאראת ואדי ערה',
  'מעיינות מרחביה': 'מעיינות מרחביה',
  'אום אל פחם בנות': 'אום אל פחם בנות',
  'אום אל פחם בנים': 'אום אל פחם בנים',
  'אורט קרית גת': 'אורט קרית גת',
  'קרית גת': 'אורט קרית גת',
  'דן גורמה תל אביב': 'דן גורמה תל אביב',
  'דן גורמה': 'דן גורמה תל אביב',
  'עתיד כרמיאל': 'עתיד כרמיאל',
  'כרמיאל': 'עתיד כרמיאל',
  'אורט בית הערבה': 'אורט בית הערבה',
  'אורט כרמל חיפה': 'אורט כרמל',
  'אורט כרמל': 'אורט כרמל',
  'אורט אורמת': 'אורט אורמת',
  'דרור נווה מדבר': 'דרור נווה מדבר',
  'נווה מדבר': 'דרור נווה מדבר',
  'עמל אשדוד': 'עמל אשדוד',
  'אשדוד': 'עמל אשדוד',
  'עמל נצרת': 'עמל נצרת',
  'נצרת': 'עמל נצרת',
  'צור ברק': 'צור ברק',
  'נחלים': 'נחלים',
  'שגב שלום': 'שגב שלום',
  'תל שבע': 'תל שבע',
  'ערערה': 'ערערה',
  'רביד': 'רביד',
  'בית דוד': 'עתיד בית דוד',
  'עתיד בית דוד': 'עתיד בית דוד',
  'חושן': 'חושן',
  'כפר זיתים': 'כפר זיתים',
  'מעיינות צפת': 'מעיינות צפת',
  'עתיד תפן': 'עתיד תפן',
  'תפן': 'עתיד תפן',
};

function getOrCreate(name) {
  const key = resolveCanonical(name);
  if (!schools[key]) {
    schools[key] = {
      id: key,
      name: key,
      climate: {},
      kbs: {},
      committee: {},
      threeYear: {},
      activities: {}
    };
  }
  return schools[key];
}

function resolveCanonical(name) {
  const cleaned = name.trim()
    .replace(/\s+/g, ' ')
    .replace(/[_]/g, ' ')
    .replace(/\(.*?\)/g, '')
    .replace(/\d{1,2}\.\d{1,2}/g, '')
    .trim();

  // Direct alias match
  if (NAME_ALIASES[cleaned]) return NAME_ALIASES[cleaned];

  // Try without common prefixes/suffixes
  const stripped = cleaned
    .replace(/^(טכנולוגי|עתיד|עמל|אורט|ישיבת|תיכון)\s+/, '')
    .trim();
  if (NAME_ALIASES[stripped]) return NAME_ALIASES[stripped];

  // Return cleaned name if no alias found
  return cleaned;
}

function normalizeName(name) {
  return resolveCanonical(name);
}

// ============================================================
// 1. CLIMATE SURVEYS (Excel)
// ============================================================
async function extractClimate() {
  const dir = path.join(BASE, 'אקלים');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.xlsx'));

  console.log(`\n📊 Climate surveys: ${files.length} files`);

  for (const file of files) {
    try {
      const match = file.match(/^(.+?)\s*\((מורים|פדגוגיה|תלמידים)\)/);
      if (!match) continue;

      const schoolName = match[1].trim();
      const surveyType = match[2]; // מורים/פדגוגיה/תלמידים

      const wb = XLSX.readFile(path.join(dir, file));
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      const school = getOrCreate(schoolName);
      if (!school.climate[surveyType]) school.climate[surveyType] = {};

      // Parse dimensions and scores
      for (const row of data) {
        if (!row || row.length < 2) continue;
        const label = String(row[0] || '').trim();

        // Response rate
        if (label.includes('אחוז היענות') || label.includes('שיעור היענות')) {
          school.climate[surveyType].responseRate = row[1];
        }
        if (label.includes('מספר עונים') || label.includes('מספר משיבים')) {
          school.climate[surveyType].respondents = row[1];
        }

        // Dimension scores - look for numeric values
        const dimensions = [
          'יחסי מורים', 'עבודת צוות', 'שייכות', 'קירבה', 'הורים',
          'הנהלת', 'מסוגלות', 'מוגנות', 'פדגוגיה', 'אלימות',
          'ביטחון', 'סביבה לימודית', 'מוטיבציה', 'הערכה'
        ];

        for (const dim of dimensions) {
          if (label.includes(dim)) {
            const scores = row.slice(1).filter(v => typeof v === 'number');
            if (scores.length > 0) {
              school.climate[surveyType][label] = {
                current: scores[0],
                benchmark: scores[1] || null,
                previous: scores[2] || null
              };
            }
            break;
          }
        }
      }

      // Also store raw data for detailed queries
      school.climate[surveyType]._raw = data.filter(r => r && r.length > 1).map(r =>
        r.map(cell => cell !== undefined && cell !== null ? cell : '')
      );

    } catch (e) {
      console.log(`  ⚠ Error: ${file}: ${e.message}`);
    }
  }
}

// ============================================================
// 2. KBS FORMS (DOCX)
// ============================================================
async function extractKBS() {
  const dir = path.join(BASE, 'קבסים');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.docx') || f.endsWith('.pdf'));

  console.log(`\n📋 KBS forms: ${files.length} files`);

  for (const file of files) {
    try {
      if (file.endsWith('.pdf')) continue; // Skip PDFs (Hebrew encoding issues)

      const result = await mammoth.extractRawText({ path: path.join(dir, file) });
      const text = result.value;

      // Extract school name from filename
      let schoolName = file
        .replace('טופס מידע לקבס', '')
        .replace('טופס מידע עדכני לקבס', '')
        .replace('.docx', '')
        .replace(/\(\d+\)/g, '')
        .replace(/[-_]/g, ' ')
        .trim();

      if (!schoolName || schoolName.length < 2) continue;

      const school = getOrCreate(schoolName);

      // Parse structured fields from text
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

      school.kbs.fullText = text;

      parseKbsFields(school, lines);

    } catch (e) {
      console.log(`  ⚠ Error: ${file}: ${e.message}`);
    }
  }
}

// Shared KBS field parser
function parseKbsFields(school, lines) {
  const fieldPatterns = [
    { key: 'principal', patterns: ['מנהל', 'מנהלת'] },
    { key: 'address', patterns: ['כתובת', 'רחוב'] },
    { key: 'phone', patterns: ['טלפון', 'נייד'] },
    { key: 'email', patterns: ['מייל', 'דוא"ל', 'אימייל'] },
    { key: 'tracks', patterns: ['מגמות', 'מגמה', 'מסלול'] },
    { key: 'studentCount', patterns: ['מספר תלמידים', 'כמות תלמידים'] },
    { key: 'uniqueness', patterns: ['ייחודיות', 'ייחוד'] },
    { key: 'redLines', patterns: ['קווים אדומים', 'קו אדום'] },
    { key: 'website', patterns: ['אתר', 'לינק', 'קישור'] },
    { key: 'transport', patterns: ['הסעות', 'תחבורה'] },
  ];

  for (const { key, patterns } of fieldPatterns) {
    for (let i = 0; i < lines.length; i++) {
      if (patterns.some(p => lines[i].includes(p))) {
        const colonIdx = lines[i].indexOf(':');
        let value = '';
        if (colonIdx > -1) {
          value = lines[i].substring(colonIdx + 1).trim();
        }
        if (!value && i + 1 < lines.length) {
          value = lines[i + 1];
        }
        if (value) {
          school.kbs[key] = value;
        }
        break;
      }
    }
  }
}

// ============================================================
// 3. COMMITTEE PRESENTATIONS (PPTX)
// ============================================================
async function extractCommittee() {
  const dir = path.join(BASE, 'וועדה מלווה תשפו');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.pptx'));

  console.log(`\n🏫 Committee presentations: ${files.length} files`);

  for (const file of files) {
    try {
      const schoolName = file.replace('.pptx', '').trim();
      const school = getOrCreate(schoolName);

      const data = fs.readFileSync(path.join(dir, file));
      const zip = await JSZip.loadAsync(data);

      // Extract all slide text
      const slides = [];
      const slideFiles = Object.keys(zip.files)
        .filter(f => f.match(/ppt\/slides\/slide\d+\.xml$/))
        .sort((a, b) => {
          const numA = parseInt(a.match(/slide(\d+)/)[1]);
          const numB = parseInt(b.match(/slide(\d+)/)[1]);
          return numA - numB;
        });

      for (const slideFile of slideFiles) {
        const content = await zip.files[slideFile].async('string');
        const texts = [];
        const matches = content.matchAll(/<a:t>([^<]*)<\/a:t>/g);
        for (const m of matches) {
          if (m[1].trim()) texts.push(m[1].trim());
        }
        slides.push(texts.join(' | '));
      }

      school.committee.slides = slides;
      school.committee.slideCount = slides.length;

      // Parse key data from slides
      parseCommitteeData(school, slides);

    } catch (e) {
      console.log(`  ⚠ Error: ${file}: ${e.message}`);
    }
  }

  // PDF committee files - metadata only (Hebrew PDF encoding issues)
  const pdfFiles = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'));
  console.log(`  + ${pdfFiles.length} PDF files (metadata only - Hebrew encoding issues)`);
  for (const file of pdfFiles) {
    const schoolName = file
      .replace('.pdf', '')
      .replace('וועדה מלווה', '')
      .replace('ועדה מלווה', '')
      .replace(/\(\d+\)/g, '')
      .replace('תשפו', '')
      .replace(/[-–]/g, ' ')
      .trim();
    if (schoolName.length > 1) {
      const school = getOrCreate(schoolName);
      school.committee.source = 'pdf';
      school.committee.filename = file;
    }
  }
}

function parseCommitteeData(school, slides) {
  const allText = slides.join(' ');

  // Helper: extract pipe-separated tokens from a slide
  function tokens(slideText) {
    return slideText.split('|').map(t => t.trim()).filter(Boolean);
  }

  // Helper: find value after a label in pipe-separated text
  function findAfterLabel(slideText, label) {
    const toks = tokens(slideText);
    for (let i = 0; i < toks.length - 1; i++) {
      if (toks[i].includes(label)) {
        const next = toks[i + 1];
        if (next && /\d/.test(next)) return next;
      }
    }
    return null;
  }

  // ===== SCHOOL DATA SLIDE (נתוני ביה"ס) =====
  for (const slide of slides) {
    if (!slide.includes('נתוני ביה"ס') && !slide.includes('נתוני בית הספר') && !slide.includes('נתוני ביה״ס')) continue;

    // Latest student count (תשפ"ו)
    const studentMatch = slide.match(/תלמידים\s*תשפ"?ו[^|]*\|\s*(\d{2,4})/);
    if (studentMatch) school.committee.studentCount = parseInt(studentMatch[1]);
    // Fallback: any student count
    if (!school.committee.studentCount) {
      const toks = tokens(slide);
      for (let i = toks.length - 1; i >= 0; i--) {
        if (toks[i].includes('תלמידים') && i + 1 < toks.length) {
          const num = parseInt(toks[i + 1]);
          if (num >= 10 && num <= 2000) {
            school.committee.studentCount = num;
            break;
          }
        }
      }
    }

    // Student count history
    school.committee.studentHistory = {};
    const years = ['תשפ"ג', 'תשפ"ד', 'תשפ"ה', 'תשפ"ו'];
    const toks = tokens(slide);
    for (let i = 0; i < toks.length; i++) {
      for (const year of years) {
        if (toks[i].includes('תלמידים') && toks[i].includes(year) && i + 1 < toks.length) {
          const num = parseInt(toks[i + 1]);
          if (num >= 5 && num <= 2000) school.committee.studentHistory[year] = num;
        }
      }
    }

    // Class count
    const classVal = findAfterLabel(slide, 'כיתות');
    if (classVal) school.committee.classCount = parseInt(classVal);

    // Tracks changes
    const trackChange = findAfterLabel(slide, 'שינוי במגמות');
    if (trackChange) school.committee.trackChanges = trackChange;
    break;
  }

  // ===== STAFF DATA SLIDE (עובדי הוראה וכח אדם) =====
  for (const slide of slides) {
    if (!slide.includes('עובדי הוראה') || !slide.includes('מספר')) continue;
    if (slide.includes('בעלי תפקידים')) continue; // Skip role holders slide

    const toks = tokens(slide);
    for (let i = 0; i < toks.length - 1; i++) {
      const t = toks[i];
      const next = parseInt(toks[i + 1]);
      if (isNaN(next)) continue;

      if (t.includes('המורים בבית הספר') || t === 'מורים') {
        school.committee.teacherCount = next;
      } else if (t.includes('המנהלה') || t.includes('עובדי מנהלה')) {
        school.committee.adminStaff = next;
      } else if (t.includes('תואר ראשון')) {
        school.committee.teachersBA = next;
      } else if (t.includes('תואר שני')) {
        school.committee.teachersMA = next;
      } else if (t.includes('מוסמכים')) {
        school.committee.teachersCertified = next;
      } else if (t.includes('שלא עפ')) {
        school.committee.teachersOutOfCert = next;
      }
    }
    break;
  }

  // ===== ROLE HOLDERS (בעלי תפקידים) =====
  for (const slide of slides) {
    if (!slide.includes('בעלי תפקידים')) continue;
    const toks = tokens(slide);
    const roles = {};
    const roleNames = ['מנהל', 'סגן', 'רכז פדגוגי', 'רכז מגמת', 'רכז חברתי', 'רכז נשירה', 'יועץ', 'רכז חניכות', 'רכזת שכבה', 'רכז תקשוב', 'רכז הכלה'];
    for (let i = 0; i < toks.length; i++) {
      for (const role of roleNames) {
        if (toks[i].includes(role) && i + 1 < toks.length && !toks[i + 1].includes('כן') && !toks[i + 1].includes('לא') && toks[i + 1].length > 2 && toks[i + 1].length < 40) {
          roles[toks[i]] = toks[i + 1];
        }
      }
    }
    if (Object.keys(roles).length) school.committee.roleHolders = roles;

    // Extract principal from role holders
    for (const [role, name] of Object.entries(roles)) {
      if (role.includes('מנהל') && !role.includes('סגן') && !role.includes('מנהלה')) {
        school.committee.principal = name;
      }
    }
    break;
  }

  // ===== BAGRUT DATA (נתוני גמר ובגרות) =====
  for (const slide of slides) {
    if (!slide.includes('נתוני גמר') && !slide.includes('בגרות חובה')) continue;

    school.committee.bagrutData = {};
    const toks = tokens(slide);

    // Parse year-by-year data: year | graduates | vocational% | techBagrut% | fullBagrut%
    const years = ['תשפ"ג', 'תשפ"ד', 'תשפ"ה', 'צפי לתשפ"ו', 'תשפ"ו'];
    for (let i = 0; i < toks.length; i++) {
      for (const year of years) {
        if (toks[i].includes(year) && !toks[i].includes('תלמידים')) {
          const yearData = {};
          // Collect following numeric tokens
          const nums = [];
          for (let j = i + 1; j < Math.min(i + 8, toks.length); j++) {
            const cleaned = toks[j].replace('%', '').trim();
            const num = parseInt(cleaned);
            if (!isNaN(num) && num <= 1000) nums.push(num);
            // Stop if we hit another year
            if (years.some(y => toks[j].includes(y))) break;
          }

          if (nums.length >= 1) yearData.graduates = nums[0];
          if (nums.length >= 2) yearData.vocationalCert = nums[1]; // % זכאים לתעודת מקצוע
          if (nums.length >= 3) yearData.techBagrut = nums[2]; // % זכאים לבגרות טכנולוגית
          if (nums.length >= 4) yearData.fullBagrut = nums[3]; // % זכאים לבגרות מלאה

          const yearKey = year.replace('צפי ל', '');
          school.committee.bagrutData[yearKey] = yearData;
        }
      }
    }

    // Set latest rates
    const latestYear = school.committee.bagrutData['תשפ"ו'] || school.committee.bagrutData['תשפ"ה'];
    if (latestYear) {
      if (latestYear.vocationalCert) school.committee.vocationalCertRate = latestYear.vocationalCert;
      if (latestYear.techBagrut) school.committee.techBagrutRate = latestYear.techBagrut;
      if (latestYear.fullBagrut) school.committee.bagrutRate = latestYear.fullBagrut;
      if (latestYear.graduates) school.committee.graduates = latestYear.graduates;
    }
    break;
  }

  // ===== EMPLOYMENT DATA (נתוני תעסוקה) =====
  for (const slide of slides) {
    if (!slide.includes('נתוני תעסוקה')) continue;

    school.committee.employmentData = {};
    const toks = tokens(slide);

    // Parse track employment: track name | enrolled | employed
    const tracks = [];
    let currentTrack = null;
    for (let i = 0; i < toks.length; i++) {
      if (toks[i].includes('שם המגמה') || toks[i].includes('מספר התלמידים')) continue;
      if (toks[i].includes('שכבת')) continue;

      // Look for track names followed by numbers
      if (i + 2 < toks.length) {
        const num1 = parseInt(toks[i + 1]);
        const num2 = parseInt(toks[i + 2]);
        if (!isNaN(num1) && !isNaN(num2) && num1 <= 500 && num2 <= 500 && toks[i].length > 2 && !/^\d/.test(toks[i])) {
          tracks.push({ name: toks[i], enrolled: num1, employed: num2 });
        }
      }
    }

    if (tracks.length) {
      school.committee.tracks = [...new Set(tracks.map(t => t.name))];
      school.committee.employmentData.tracks = tracks;
      // Calculate overall employment rate
      const totalEnrolled = tracks.reduce((s, t) => s + t.enrolled, 0);
      const totalEmployed = tracks.reduce((s, t) => s + t.employed, 0);
      if (totalEnrolled > 0) {
        school.committee.employmentRate = Math.round((totalEmployed / totalEnrolled) * 100);
      }
    }
    break;
  }

  // ===== DROPOUT DATA (התמדה ונשירה) =====
  for (const slide of slides) {
    if (!slide.includes('התמדה ונשירה') || !slide.includes('נתוני')) continue;
    if (!slide.includes('עוזבים') && !slide.includes('שכבה')) continue;

    school.committee.dropoutData = {};
    const toks = tokens(slide);
    const grades = ['ט', 'י', 'יא', 'יב'];
    for (let i = 0; i < toks.length; i++) {
      for (const grade of grades) {
        if (toks[i].includes('שכבה ' + grade) && !toks[i].includes('שכבה י"') && !toks[i].includes('שכבה יא')) {
          // Collect following numbers
          const nums = [];
          for (let j = i + 1; j < Math.min(i + 8, toks.length); j++) {
            const num = parseInt(toks[j]);
            if (!isNaN(num) && num <= 500) nums.push(num);
            if (toks[j].includes('שכבה')) break;
          }
          if (nums.length >= 2) {
            school.committee.dropoutData[grade] = { leavers: nums[0], total: nums[1] };
          }
        }
      }
    }
    break;
  }

  // ===== 3 PRIDES & LEAPS =====
  for (let i = 0; i < slides.length; i++) {
    if (slides[i].includes('גאים') || slides[i].includes('גאווה')) {
      school.committee.prides = slides[i];
    }
    if (slides[i].includes('קפיצ') && slides[i].includes('מדרגה')) {
      school.committee.leaps = slides[i];
    }
  }

  // ===== PRINCIPAL from slide 2 (the story slide) =====
  if (!school.committee.principal && slides.length > 1) {
    const storySlide = slides[1];
    const principalMatch = storySlide.match(/מנהל[:\s|]*([א-ת'\s]{3,30}?)(?:\s*\|)/);
    if (principalMatch) school.committee.principal = principalMatch[1].trim();
  }

  // ===== TRACKS from employment data or track detail slides =====
  if (!school.committee.tracks || !school.committee.tracks.length) {
    const trackNames = [];
    for (const slide of slides) {
      const match = slide.match(/מגמה\s*[–\-]\s*([^|]+)/g);
      if (match) {
        for (const m of match) {
          const name = m.replace(/מגמה\s*[–\-]\s*/, '').trim();
          if (name.length > 2 && name.length < 40 && !trackNames.includes(name)) {
            trackNames.push(name);
          }
        }
      }
    }
    if (trackNames.length) school.committee.tracks = trackNames;
  }

  // Store all text for search
  school.committee.fullText = allText;
}

// ============================================================
// 4. THREE-YEAR PLANS (Excel)
// ============================================================
async function extractThreeYear() {
  const dir = path.join(BASE, 'תלת שנתי');
  const supervisors = fs.readdirSync(dir).filter(f =>
    fs.statSync(path.join(dir, f)).isDirectory()
  );

  console.log(`\n📅 Three-year plans: ${supervisors.length} supervisors`);

  for (const supervisor of supervisors) {
    const supDir = path.join(dir, supervisor);
    const files = fs.readdirSync(supDir).filter(f => f.endsWith('.xlsx') || f.endsWith('.pdf'));

    for (const file of files) {
      try {
        if (file.endsWith('.pdf')) continue;

        // Extract school name from filename
        let schoolName = file
          .replace('תוכנית תלת שנתית', '')
          .replace('תלת שנתי', '')
          .replace('תוכנית עבודה תלת שנתית', '')
          .replace('בתי ספר מקצועיים', '')
          .replace('תשפו', '')
          .replace(/\d{1,2}\.\d{1,2}/g, '')
          .replace(/\(\d+\)/g, '')
          .replace('.xlsx', '')
          .replace(/[-_]/g, ' ')
          .trim();

        if (!schoolName || schoolName.length < 2) continue;

        const wb = XLSX.readFile(path.join(supDir, file));
        const school = getOrCreate(schoolName);

        school.threeYear.supervisor = supervisor;
        school.threeYear.sheets = {};

        for (const sheetName of wb.SheetNames) {
          const ws = wb.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

          if (data.length < 2) continue;

          // Store sheet data
          school.threeYear.sheets[sheetName] = data
            .filter(r => r && r.some(c => c !== undefined && c !== null && c !== ''))
            .map(r => r.map(c => c !== undefined && c !== null ? c : ''));

          // Extract exam subjects and student counts
          for (const row of data) {
            if (!row) continue;
            const rowText = row.map(c => String(c || '')).join(' ');

            // Look for subject exam data
            const subjects = ['מתמטיקה', 'אנגלית', 'עברית', 'ספרות', 'היסטוריה', 'אזרחות', 'תנ"ך'];
            for (const subj of subjects) {
              if (rowText.includes(subj)) {
                if (!school.threeYear.subjects) school.threeYear.subjects = {};
                const nums = row.filter(c => typeof c === 'number');
                if (nums.length > 0) {
                  school.threeYear.subjects[subj] = nums;
                }
              }
            }
          }
        }

      } catch (e) {
        console.log(`  ⚠ Error: ${file}: ${e.message}`);
      }
    }
  }
}

// ============================================================
// 5. MERGE & NORMALIZE
// ============================================================
function mergeAndNormalize() {
  console.log('\n🔗 Merging and normalizing...');

  // Name normalization mapping
  const nameMap = {
    'אנרגיטק': 'אנרג_יטק',
    'אנרגי טק': 'אנרג_יטק',
    'עמל אנרגיטק': 'אנרג_יטק',
  };

  // Try to merge schools with similar names
  const keys = Object.keys(schools);
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const a = keys[i];
      const b = keys[j];
      // Check if one name contains the other
      if (a.includes(b) || b.includes(a)) {
        // Merge shorter into longer
        const [keep, merge] = a.length >= b.length ? [a, b] : [b, a];
        if (schools[merge]) {
          const s = schools[keep];
          const m = schools[merge];
          // Merge data
          if (!Object.keys(s.climate).length && Object.keys(m.climate).length) s.climate = m.climate;
          if (!Object.keys(s.kbs).length && Object.keys(m.kbs).length) s.kbs = m.kbs;
          if (!Object.keys(s.committee).length && Object.keys(m.committee).length) s.committee = m.committee;
          if (!Object.keys(s.threeYear).length && Object.keys(m.threeYear).length) s.threeYear = m.threeYear;
          delete schools[merge];
        }
      }
    }
  }

  // Create summary stats for each school
  for (const school of Object.values(schools)) {
    school.summary = {};

    // Best student count source
    school.summary.studentCount =
      school.committee.studentCount ||
      (school.kbs.studentCount ? parseInt(school.kbs.studentCount) : null);

    school.summary.principal = school.committee.principal || school.kbs.principal || null;
    school.summary.bagrutRate = school.committee.bagrutRate || null;
    school.summary.vocationalCertRate = school.committee.vocationalCertRate || null;
    school.summary.employmentRate = school.committee.employmentRate || null;
    school.summary.dropoutRate = school.committee.dropoutRate || null;
    school.summary.supervisor = school.threeYear.supervisor || null;

    // Climate summary - average across types
    const climateScores = {};
    for (const [type, data] of Object.entries(school.climate)) {
      for (const [key, val] of Object.entries(data)) {
        if (key.startsWith('_') || typeof val !== 'object' || !val.current) continue;
        if (!climateScores[key]) climateScores[key] = [];
        climateScores[key].push(val.current);
      }
    }
    if (Object.keys(climateScores).length) {
      school.summary.climateHighlights = {};
      for (const [key, scores] of Object.entries(climateScores)) {
        school.summary.climateHighlights[key] =
          Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10;
      }
    }

    // Data completeness
    school.summary.dataSources = [];
    if (Object.keys(school.climate).length) school.summary.dataSources.push('אקלים');
    if (Object.keys(school.kbs).length > 1) school.summary.dataSources.push('קב"ס');
    if (school.committee.slides || school.committee.source) school.summary.dataSources.push('ועדה מלווה');
    if (Object.keys(school.threeYear).length > 1) school.summary.dataSources.push('תלת שנתי');
  }
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('🏫 Schools Data Extractor');
  console.log('========================\n');

  await extractClimate();
  await extractKBS();
  await extractCommittee();
  await extractThreeYear();
  mergeAndNormalize();

  // Remove raw slide text and fullText to reduce file size for the main JSON
  // Keep a separate detailed file
  const detailed = JSON.parse(JSON.stringify(schools));

  for (const school of Object.values(schools)) {
    if (school.committee.slides) delete school.committee.slides;
    if (school.committee.fullText) delete school.committee.fullText;
    if (school.kbs.fullText) delete school.kbs.fullText;
    for (const type of Object.keys(school.climate)) {
      if (school.climate[type]._raw) delete school.climate[type]._raw;
    }
    for (const sheet of Object.keys(school.threeYear.sheets || {})) {
      // Keep first 5 rows only for summary
      if (school.threeYear.sheets[sheet]?.length > 5) {
        school.threeYear.sheets[sheet] = school.threeYear.sheets[sheet].slice(0, 5);
      }
    }
  }

  const schoolCount = Object.keys(schools).length;
  console.log(`\n✅ Done! ${schoolCount} schools extracted`);

  // Save compact version for dashboard
  fs.writeFileSync(OUTPUT, JSON.stringify(schools, null, 2), 'utf8');
  console.log(`📁 Compact: ${OUTPUT} (${(fs.statSync(OUTPUT).size / 1024).toFixed(0)} KB)`);

  // Save detailed version for chatbot
  const detailedPath = OUTPUT.replace('.json', '-detailed.json');
  fs.writeFileSync(detailedPath, JSON.stringify(detailed, null, 2), 'utf8');
  console.log(`📁 Detailed: ${detailedPath} (${(fs.statSync(detailedPath).size / 1024).toFixed(0)} KB)`);

  // Print summary
  console.log('\n📊 Summary:');
  for (const school of Object.values(schools)) {
    const sources = school.summary.dataSources.join(', ');
    const students = school.summary.studentCount || '?';
    console.log(`  ${school.name}: ${students} תלמידים | ${sources}`);
  }
}

main().catch(console.error);
