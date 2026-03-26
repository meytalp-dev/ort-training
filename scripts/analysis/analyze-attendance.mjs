import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// ========== CONFIG ==========
const ATTENDANCE_DIR = 'imports/attendance/';
const OUTPUT_FILE = 'docs/management/attendance-report.html';
const DATES = ['8/3', '9/3', '10/3', '11/3', '12/3', '15/3', '16/3', '17/3', '18/3'];
const CLASS_NAMES = ['ט1', 'ט2', 'י1', 'י2', 'י3', 'יא1', 'יא2', 'יא3', 'יב1', 'יב3'];
const EXCLUDED_CLASSES = ['יא2', 'יב2']; // excluded from calculations
const EXCLUDED_STUDENTS = [
  'בן חמו דניאל', 'שלום נועם', 'אברגל אליה', 'אמינוף נהוראי',
  'טירוורך אברהם', 'מימוני משה', 'פרנסה אוראל',
  'אונדריצק חנה', 'אברהם נקיטה', 'לנגר אלמוג'
];
function isExcludedStudent(name) {
  if (!name) return false;
  const n = name.trim().replace(/[׳']/g, '');
  return EXCLUDED_STUDENTS.some(ex => {
    const e = ex.replace(/[׳']/g, '');
    return n.includes(e) || e.includes(n);
  });
}
const ACTIVE_CLASSES = CLASS_NAMES.filter(c => !EXCLUDED_CLASSES.includes(c));

// ========== READ ALL FILES ==========
const files = fs.readdirSync(ATTENDANCE_DIR)
  .filter(f => f.endsWith('.xlsx'))
  .sort((a, b) => {
    const getDate = f => {
      const m = f.match(/(\d+)_3/);
      return m ? parseInt(m[1]) : 0;
    };
    return getDate(a) - getDate(b);
  });

console.log(`Found ${files.length} files`);

// Data structure: allData[className][studentName] = { days: [ {chinuch, lesson1, lesson2, task1, task2, chinuchTask} ... ] }
const allData = {};
const classDayData = {}; // classDayData[className][dayIndex] = { students, chinuch, lesson1, lesson2, tasks }

for (const className of CLASS_NAMES) {
  allData[className] = {};
  classDayData[className] = [];
}

function toBool(val) {
  if (val === true || val === 'TRUE' || val === 'true') return true;
  return false;
}

function parseHeaders(headers) {
  // Returns column mapping: { chinuch, lesson1, lesson2, task1, task2, chinuchTask }
  // Variant A (standard): name, chinuch, lesson1, task, lesson2, task (6 cols)
  // Variant B (יא1/יא3 sometimes): name, chinuch, task, lesson1, task, lesson2, task (7 cols)

  const mapping = { chinuch: -1, lesson1: -1, lesson2: -1, task1: -1, task2: -1, chinuchTask: -1 };

  let taskCount = 0;
  let lastAttendanceType = null; // 'chinuch', 'lesson1', 'lesson2'

  for (let i = 1; i < headers.length; i++) {
    const h = (headers[i] || '').toString();

    if (h.includes('חינוך')) {
      mapping.chinuch = i;
      lastAttendanceType = 'chinuch';
    } else if (h.includes('שיעור 1') || h.includes('שיעור 1')) {
      mapping.lesson1 = i;
      lastAttendanceType = 'lesson1';
    } else if (h.includes('שיעור 2')) {
      mapping.lesson2 = i;
      lastAttendanceType = 'lesson2';
    } else if (h.includes('מטלה')) {
      taskCount++;
      if (lastAttendanceType === 'chinuch') {
        mapping.chinuchTask = i;
        lastAttendanceType = null; // consumed
      } else if (lastAttendanceType === 'lesson1' || (mapping.task1 === -1 && mapping.lesson1 !== -1)) {
        mapping.task1 = i;
        lastAttendanceType = null;
      } else if (lastAttendanceType === 'lesson2' || (mapping.task2 === -1 && mapping.lesson2 !== -1)) {
        mapping.task2 = i;
        lastAttendanceType = null;
      } else {
        // fallback: assign to first unassigned task
        if (mapping.task1 === -1) mapping.task1 = i;
        else if (mapping.task2 === -1) mapping.task2 = i;
      }
    }
  }

  return mapping;
}

for (let dayIndex = 0; dayIndex < files.length; dayIndex++) {
  const filePath = path.join(ATTENDANCE_DIR, files[dayIndex]);
  const wb = XLSX.readFile(filePath);
  console.log(`Processing: ${files[dayIndex]} (day ${DATES[dayIndex]})`);

  for (const className of CLASS_NAMES) {
    if (!wb.SheetNames.includes(className)) {
      classDayData[className][dayIndex] = { students: 0, chinuch: 0, lesson1: 0, lesson2: 0, tasks: 0, totalTaskSlots: 0 };
      continue;
    }

    const ws = wb.Sheets[className];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

    if (rows.length === 0) {
      classDayData[className][dayIndex] = { students: 0, chinuch: 0, lesson1: 0, lesson2: 0, tasks: 0, totalTaskSlots: 0 };
      continue;
    }

    const headers = rows[0];
    const mapping = parseHeaders(headers);

    let dayStats = { students: 0, chinuch: 0, lesson1: 0, lesson2: 0, tasks: 0, totalTaskSlots: 0 };

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const name = row[0];

      // Skip empty names and excluded students
      if (!name || (typeof name === 'string' && name.trim() === '')) continue;
      if (isExcludedStudent(name)) continue;

      dayStats.students++;

      const chinuch = toBool(row[mapping.chinuch]);
      const lesson1 = mapping.lesson1 >= 0 ? toBool(row[mapping.lesson1]) : false;
      const lesson2 = mapping.lesson2 >= 0 ? toBool(row[mapping.lesson2]) : false;
      const task1 = mapping.task1 >= 0 ? toBool(row[mapping.task1]) : false;
      const task2 = mapping.task2 >= 0 ? toBool(row[mapping.task2]) : false;
      const chinuchTask = mapping.chinuchTask >= 0 ? toBool(row[mapping.chinuchTask]) : false;

      if (chinuch) dayStats.chinuch++;
      if (lesson1) dayStats.lesson1++;
      if (lesson2) dayStats.lesson2++;

      // Count tasks
      let taskSlots = 0;
      let tasksDone = 0;
      if (mapping.task1 >= 0) { taskSlots++; if (task1) tasksDone++; }
      if (mapping.task2 >= 0) { taskSlots++; if (task2) tasksDone++; }
      if (mapping.chinuchTask >= 0) { taskSlots++; if (chinuchTask) tasksDone++; }

      dayStats.tasks += tasksDone;
      dayStats.totalTaskSlots += taskSlots;

      // Store per-student data
      if (!allData[className][name]) {
        allData[className][name] = { days: [] };
      }
      allData[className][name].days[dayIndex] = {
        chinuch, lesson1, lesson2, task1, task2, chinuchTask,
        anyAttendance: chinuch || lesson1 || lesson2
      };
    }

    classDayData[className][dayIndex] = dayStats;
  }
}

// ========== COMPUTE STATS ==========

function pct(num, den) {
  if (den === 0) return 0;
  return Math.round((num / den) * 100);
}

function colorClass(p) {
  if (p >= 60) return 'green';
  if (p >= 30) return 'yellow';
  return 'red';
}

// Per-class summary
const classSummaries = {};
for (const className of CLASS_NAMES) {
  const students = allData[className];
  const studentNames = Object.keys(students);
  const totalStudents = studentNames.length;

  let totalChinuch = 0, totalLesson1 = 0, totalLesson2 = 0;
  let totalTasks = 0, totalTaskSlots = 0;
  let totalAttendanceSlots = 0, totalAttendance = 0;

  const dailyRates = [];

  for (let d = 0; d < DATES.length; d++) {
    const ds = classDayData[className][d];
    if (!ds || ds.students === 0) {
      dailyRates.push(0);
      continue;
    }

    totalChinuch += ds.chinuch;
    totalLesson1 += ds.lesson1;
    totalLesson2 += ds.lesson2;
    totalTasks += ds.tasks;
    totalTaskSlots += ds.totalTaskSlots;

    const dayAttendance = ds.chinuch + ds.lesson1 + ds.lesson2;
    const daySlots = ds.students * 3;
    totalAttendance += dayAttendance;
    totalAttendanceSlots += daySlots;

    dailyRates.push(pct(dayAttendance, daySlots));
  }

  const totalSessionSlots = totalStudents * DATES.length;

  // Trend: compare first half vs second half
  const firstHalf = dailyRates.slice(0, 4);
  const secondHalf = dailyRates.slice(5);
  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / (firstHalf.length || 1);
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / (secondHalf.length || 1);
  const trend = avgSecond > avgFirst + 2 ? 'improving' : avgSecond < avgFirst - 2 ? 'declining' : 'stable';

  classSummaries[className] = {
    totalStudents,
    avgChinuch: pct(totalChinuch, totalSessionSlots),
    avgLesson1: pct(totalLesson1, totalSessionSlots),
    avgLesson2: pct(totalLesson2, totalSessionSlots),
    avgTasks: pct(totalTasks, totalTaskSlots),
    overallAttendance: pct(totalAttendance, totalAttendanceSlots),
    dailyRates,
    trend,
    hasNoNames: totalStudents === 0
  };
}

// School-wide
const allClassesSorted = [...ACTIVE_CLASSES].sort((a, b) =>
  classSummaries[b].overallAttendance - classSummaries[a].overallAttendance
);

const schoolTotalAttendance = ACTIVE_CLASSES.reduce((sum, c) => {
  let total = 0;
  for (let d = 0; d < DATES.length; d++) {
    const ds = classDayData[c][d];
    if (ds) total += ds.chinuch + ds.lesson1 + ds.lesson2;
  }
  return sum + total;
}, 0);

const schoolTotalSlots = ACTIVE_CLASSES.reduce((sum, c) => {
  return sum + classSummaries[c].totalStudents * DATES.length * 3;
}, 0);

const schoolOverall = pct(schoolTotalAttendance, schoolTotalSlots);

// Individual highlights
const excellentStudents = []; // attended almost all
const neverAttended = []; // never attended any session
const goodAttBadTask = []; // good attendance but low task submission

for (const className of ACTIVE_CLASSES) {
  const students = allData[className];
  for (const [name, data] of Object.entries(students)) {
    let attendedCount = 0;
    let totalSessions = 0;
    let tasksDone = 0;
    let taskSlots = 0;

    for (let d = 0; d < DATES.length; d++) {
      const day = data.days[d];
      if (!day) continue;
      totalSessions += 3; // chinuch + lesson1 + lesson2
      if (day.chinuch) attendedCount++;
      if (day.lesson1) attendedCount++;
      if (day.lesson2) attendedCount++;

      if (day.task1) tasksDone++;
      if (day.task2) tasksDone++;
      if (day.chinuchTask) tasksDone++;
      taskSlots += 2; // at minimum 2 task slots per day
    }

    const attRate = pct(attendedCount, totalSessions);
    const taskRate = pct(tasksDone, taskSlots);

    if (attRate >= 70) {
      excellentStudents.push({ name, className, attRate, taskRate });
    }

    if (attendedCount === 0) {
      neverAttended.push({ name, className });
    }

    if (attRate >= 40 && taskRate < 20) {
      goodAttBadTask.push({ name, className, attRate, taskRate });
    }
  }
}

excellentStudents.sort((a, b) => b.attRate - a.attRate);
goodAttBadTask.sort((a, b) => b.attRate - a.attRate);

// Flags
const flags = [];
if (classSummaries['יב1'] && (classSummaries['יב1'].hasNoNames || classSummaries['יב1'].totalStudents === 0)) {
  flags.push({ className: 'יב1', message: 'לכיתה זו אין שמות תלמידים בקבצים -- יש לבדוק את הנתונים' });
}
// Note: יא2 and יב2 excluded from report per request

// ========== GENERATE HTML ==========

function progressBar(value, label) {
  const cc = colorClass(value);
  return `<div class="progress-container">
    <div class="progress-label">${label}</div>
    <div class="progress-bar-bg">
      <div class="progress-bar-fill ${cc}" style="width:${Math.max(value, 2)}%"></div>
    </div>
    <div class="progress-value ${cc}">${value}%</div>
  </div>`;
}

function trendIcon(trend) {
  if (trend === 'improving') return `<span class="trend-up" title="מגמה חיובית">&#9650;</span>`;
  if (trend === 'declining') return `<span class="trend-down" title="מגמה שלילית">&#9660;</span>`;
  return `<span class="trend-stable" title="יציב">&#9644;</span>`;
}

function sparkline(dailyRates) {
  const max = 100;
  const width = 180;
  const height = 40;
  const step = width / (dailyRates.length - 1 || 1);
  const points = dailyRates.map((v, i) => `${i * step},${height - (v / max) * height}`).join(' ');
  const fillPoints = `0,${height} ${points} ${(dailyRates.length - 1) * step},${height}`;
  return `<svg class="sparkline" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <polygon points="${fillPoints}" fill="rgba(0,188,212,0.15)" />
    <polyline points="${points}" fill="none" stroke="#00bcd4" stroke-width="2" />
    ${dailyRates.map((v, i) => `<circle cx="${i * step}" cy="${height - (v / max) * height}" r="2.5" fill="#00bcd4" />`).join('')}
  </svg>`;
}

const classCards = ACTIVE_CLASSES.map(className => {
  const s = classSummaries[className];
  const flag = flags.find(f => f.className === className);

  return `
  <div class="class-card ${flag ? 'flagged' : ''}">
    <div class="class-header">
      <h3>כיתה ${className}</h3>
      <div class="class-meta">
        <span class="student-count">${s.totalStudents} תלמידים</span>
        ${trendIcon(s.trend)}
      </div>
    </div>
    ${flag ? `<div class="flag-alert"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e65100" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> ${flag.message}</div>` : ''}
    <div class="class-stats">
      ${progressBar(s.avgChinuch, 'שיעור חינוך')}
      ${progressBar(s.avgLesson1, 'שיעור 1')}
      ${progressBar(s.avgLesson2, 'שיעור 2')}
      ${progressBar(s.avgTasks, 'הגשת מטלות')}
    </div>
    <div class="class-overall">
      <span class="overall-label">נוכחות כוללת</span>
      <span class="overall-value ${colorClass(s.overallAttendance)}">${s.overallAttendance}%</span>
    </div>
    <div class="sparkline-section">
      <div class="sparkline-label">מגמה יומית (${DATES[0]} - ${DATES[DATES.length - 1]})</div>
      ${sparkline(s.dailyRates)}
      <div class="sparkline-dates">
        ${DATES.map(d => `<span>${d}</span>`).join('')}
      </div>
    </div>
  </div>`;
}).join('\n');

// Daily school-wide rates
const schoolDailyRates = DATES.map((_, d) => {
  let att = 0, slots = 0;
  for (const c of ACTIVE_CLASSES) {
    const ds = classDayData[c][d];
    if (ds && ds.students > 0) {
      att += ds.chinuch + ds.lesson1 + ds.lesson2;
      slots += ds.students * 3;
    }
  }
  return pct(att, slots);
});

const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>דוח נוכחות למידה מרחוק -- אורט בית הערבה</title>
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;900&family=Rubik:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --teal-50: #e0f7fa;
    --teal-100: #b2ebf2;
    --teal-200: #80deea;
    --teal-300: #4dd0e1;
    --teal-400: #26c6da;
    --teal-500: #00bcd4;
    --teal-600: #00acc1;
    --teal-700: #0097a7;
    --teal-800: #00838f;
    --teal-900: #006064;
    --green: #43a047;
    --yellow: #f9a825;
    --red: #e53935;
    --bg: #f5f7fa;
    --card-bg: #ffffff;
    --text: #263238;
    --text-light: #607d8b;
    --shadow: 0 2px 8px rgba(0,0,0,0.08);
    --shadow-lg: 0 4px 20px rgba(0,0,0,0.12);
  }

  body {
    font-family: 'Heebo', 'Rubik', sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
    padding: 0;
    margin: 0;
  }

  .header {
    background: linear-gradient(135deg, var(--teal-700), var(--teal-500));
    color: white;
    padding: 40px 24px;
    text-align: center;
  }

  .header h1 {
    font-size: 2rem;
    font-weight: 900;
    margin-bottom: 8px;
  }

  .header .subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
    font-weight: 300;
  }

  .header .date-range {
    margin-top: 12px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,0.15);
    padding: 8px 20px;
    border-radius: 20px;
    font-size: 0.95rem;
  }

  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px;
  }

  /* Summary cards at top */
  .summary-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
  }

  .summary-card {
    background: var(--card-bg);
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    box-shadow: var(--shadow);
    border-top: 3px solid var(--teal-500);
  }

  .summary-card .big-number {
    font-size: 2.5rem;
    font-weight: 900;
    line-height: 1;
    margin: 8px 0;
  }

  .summary-card .big-number.green { color: var(--green); }
  .summary-card .big-number.yellow { color: var(--yellow); }
  .summary-card .big-number.red { color: var(--red); }

  .summary-card .card-label {
    font-size: 0.9rem;
    color: var(--text-light);
    font-weight: 500;
  }

  /* School-wide sparkline */
  .school-trend {
    background: var(--card-bg);
    border-radius: 12px;
    padding: 24px;
    box-shadow: var(--shadow);
    margin-bottom: 32px;
  }

  .school-trend h2 {
    font-size: 1.3rem;
    margin-bottom: 16px;
    color: var(--teal-800);
  }

  .school-sparkline {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    height: 120px;
    padding: 0 8px;
  }

  .bar-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .bar-wrapper {
    width: 100%;
    height: 100px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .bar {
    width: 80%;
    max-width: 60px;
    border-radius: 6px 6px 0 0;
    transition: height 0.3s;
    min-height: 2px;
  }

  .bar.green { background: linear-gradient(to top, var(--green), #66bb6a); }
  .bar.yellow { background: linear-gradient(to top, var(--yellow), #fdd835); }
  .bar.red { background: linear-gradient(to top, var(--red), #ef5350); }

  .bar-label {
    font-size: 0.75rem;
    color: var(--text-light);
    font-weight: 500;
  }

  .bar-value {
    font-size: 0.85rem;
    font-weight: 700;
  }

  /* Ranking section */
  .ranking-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 32px;
  }

  .ranking-card {
    background: var(--card-bg);
    border-radius: 12px;
    padding: 24px;
    box-shadow: var(--shadow);
  }

  .ranking-card h2 {
    font-size: 1.2rem;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ranking-card h2 svg { flex-shrink: 0; }

  .rank-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
  }

  .rank-item:last-child { border-bottom: none; }

  .rank-num {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.85rem;
    flex-shrink: 0;
  }

  .rank-best .rank-num { background: var(--teal-100); color: var(--teal-800); }
  .rank-worst .rank-num { background: #ffebee; color: var(--red); }

  .rank-name { flex: 1; font-weight: 500; }

  .rank-pct {
    font-weight: 700;
    font-size: 1.1rem;
  }

  .rank-pct.green { color: var(--green); }
  .rank-pct.yellow { color: var(--yellow); }
  .rank-pct.red { color: var(--red); }

  /* Flags */
  .flags-section {
    margin-bottom: 32px;
  }

  .flag-banner {
    background: #fff3e0;
    border: 1px solid #ffe0b2;
    border-radius: 12px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .flag-banner svg { flex-shrink: 0; }

  .flag-banner .flag-text {
    font-weight: 500;
  }

  .flag-banner .flag-class {
    font-weight: 700;
    color: #e65100;
  }

  /* Class detail grid */
  .section-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--teal-800);
    margin: 32px 0 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--teal-200);
  }

  .class-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
  }

  .class-card {
    background: var(--card-bg);
    border-radius: 12px;
    padding: 20px;
    box-shadow: var(--shadow);
    transition: box-shadow 0.2s;
  }

  .class-card:hover { box-shadow: var(--shadow-lg); }

  .class-card.flagged {
    border: 2px solid #ffe0b2;
  }

  .class-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .class-header h3 {
    font-size: 1.3rem;
    color: var(--teal-800);
  }

  .class-meta {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .student-count {
    font-size: 0.85rem;
    background: var(--teal-50);
    color: var(--teal-700);
    padding: 2px 10px;
    border-radius: 10px;
    font-weight: 500;
  }

  .trend-up { color: var(--green); font-size: 1rem; }
  .trend-down { color: var(--red); font-size: 1rem; }
  .trend-stable { color: var(--text-light); font-size: 1rem; }

  .flag-alert {
    background: #fff3e0;
    border-radius: 8px;
    padding: 8px 12px;
    margin-bottom: 12px;
    font-size: 0.85rem;
    color: #e65100;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .class-stats { margin-bottom: 12px; }

  .progress-container {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  .progress-label {
    width: 90px;
    font-size: 0.8rem;
    color: var(--text-light);
    font-weight: 500;
    text-align: start;
  }

  .progress-bar-bg {
    flex: 1;
    height: 8px;
    background: #eceff1;
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.4s;
  }

  .progress-bar-fill.green { background: linear-gradient(to left, var(--green), #66bb6a); }
  .progress-bar-fill.yellow { background: linear-gradient(to left, var(--yellow), #fdd835); }
  .progress-bar-fill.red { background: linear-gradient(to left, var(--red), #ef5350); }

  .progress-value {
    width: 40px;
    text-align: center;
    font-size: 0.85rem;
    font-weight: 700;
  }

  .progress-value.green { color: var(--green); }
  .progress-value.yellow { color: var(--yellow); }
  .progress-value.red { color: var(--red); }

  .class-overall {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-top: 1px solid #eceff1;
    border-bottom: 1px solid #eceff1;
    margin-bottom: 12px;
  }

  .overall-label {
    font-weight: 700;
    font-size: 0.95rem;
  }

  .overall-value {
    font-size: 1.5rem;
    font-weight: 900;
  }

  .overall-value.green { color: var(--green); }
  .overall-value.yellow { color: var(--yellow); }
  .overall-value.red { color: var(--red); }

  .sparkline-section {
    text-align: center;
  }

  .sparkline-label {
    font-size: 0.75rem;
    color: var(--text-light);
    margin-bottom: 4px;
  }

  .sparkline {
    display: block;
    margin: 0 auto;
  }

  .sparkline-dates {
    display: flex;
    justify-content: space-between;
    font-size: 0.65rem;
    color: var(--text-light);
    margin-top: 2px;
    padding: 0 2px;
  }

  /* Individual highlights */
  .highlights-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
  }

  .highlight-card {
    background: var(--card-bg);
    border-radius: 12px;
    padding: 20px;
    box-shadow: var(--shadow);
  }

  .highlight-card h2 {
    font-size: 1.2rem;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .student-list {
    list-style: none;
    max-height: 300px;
    overflow-y: auto;
  }

  .student-list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    border-bottom: 1px solid #f5f5f5;
    font-size: 0.9rem;
  }

  .student-list li:last-child { border-bottom: none; }

  .student-name { font-weight: 500; }
  .student-class { font-size: 0.8rem; color: var(--text-light); margin-right: 8px; }

  .student-badges {
    display: flex;
    gap: 6px;
  }

  .badge {
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .badge.green { background: #e8f5e9; color: var(--green); }
  .badge.yellow { background: #fff8e1; color: #f57f17; }
  .badge.red { background: #ffebee; color: var(--red); }

  .empty-state {
    text-align: center;
    padding: 20px;
    color: var(--text-light);
    font-size: 0.9rem;
  }

  /* Print styles */
  @media print {
    body { background: white; }
    .header { padding: 20px; }
    .container { padding: 12px; }
    .class-card, .summary-card, .ranking-card, .highlight-card, .school-trend {
      box-shadow: none;
      border: 1px solid #e0e0e0;
      break-inside: avoid;
    }
    .class-grid { grid-template-columns: repeat(2, 1fr); }
    .student-list { max-height: none; overflow: visible; }
  }

  @media (max-width: 768px) {
    .ranking-section { grid-template-columns: 1fr; }
    .class-grid { grid-template-columns: 1fr; }
    .highlights-grid { grid-template-columns: 1fr; }
    .summary-row { grid-template-columns: repeat(2, 1fr); }
  }
</style>
</head>
<body>

<div class="header">
  <h1>דוח נוכחות למידה מרחוק</h1>
  <div class="subtitle">אורט בית הערבה -- מרץ 2026</div>
  <div class="date-range">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    ${DATES[0]} -- ${DATES[DATES.length - 1]} מרץ 2026 | 9 ימי למידה
  </div>
</div>

<div class="container">

  <!-- Summary Cards -->
  <div class="summary-row">
    <div class="summary-card">
      <div class="card-label">נוכחות כללית</div>
      <div class="big-number ${colorClass(schoolOverall)}">${schoolOverall}%</div>
      <div class="card-label">ממוצע בית-ספרי</div>
    </div>
    <div class="summary-card">
      <div class="card-label">סה"כ תלמידים</div>
      <div class="big-number" style="color:var(--teal-700)">${ACTIVE_CLASSES.reduce((s, c) => s + classSummaries[c].totalStudents, 0)}</div>
      <div class="card-label">ב-${ACTIVE_CLASSES.length} כיתות</div>
    </div>
    <div class="summary-card">
      <div class="card-label">כיתה מובילה</div>
      <div class="big-number ${colorClass(classSummaries[allClassesSorted[0]].overallAttendance)}">${classSummaries[allClassesSorted[0]].overallAttendance}%</div>
      <div class="card-label">${allClassesSorted[0]}</div>
    </div>
    <div class="summary-card">
      <div class="card-label">מצטייני נוכחות</div>
      <div class="big-number" style="color:var(--teal-700)">${excellentStudents.length}</div>
      <div class="card-label">תלמידים (70%+)</div>
    </div>
    <div class="summary-card">
      <div class="card-label">לא נכנסו כלל</div>
      <div class="big-number red">${neverAttended.length}</div>
      <div class="card-label">תלמידים</div>
    </div>
  </div>

  ${flags.length > 0 ? `
  <div class="flags-section">
    ${flags.map(f => `
    <div class="flag-banner">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e65100" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      <div><span class="flag-class">${f.className}:</span> <span class="flag-text">${f.message}</span></div>
    </div>`).join('')}
  </div>` : ''}

  <!-- School-wide daily trend -->
  <div class="school-trend">
    <h2>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal-700)" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
      מגמת נוכחות יומית -- כלל בית ספרי
    </h2>
    <div class="school-sparkline">
      ${schoolDailyRates.map((rate, i) => `
      <div class="bar-col">
        <div class="bar-value ${colorClass(rate)}">${rate}%</div>
        <div class="bar-wrapper">
          <div class="bar ${colorClass(rate)}" style="height:${Math.max(rate, 2)}%"></div>
        </div>
        <div class="bar-label">${DATES[i]}</div>
      </div>`).join('')}
    </div>
  </div>

  <!-- Ranking -->
  <div class="ranking-section">
    <div class="ranking-card rank-best">
      <h2>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        כיתות מובילות בנוכחות
      </h2>
      ${allClassesSorted.filter(c => classSummaries[c].overallAttendance > 0).slice(0, 5).map((c, i) => `
      <div class="rank-item">
        <div class="rank-num">${i + 1}</div>
        <div class="rank-name">כיתה ${c}</div>
        <div class="rank-pct ${colorClass(classSummaries[c].overallAttendance)}">${classSummaries[c].overallAttendance}%</div>
      </div>`).join('')}
    </div>
    <div class="ranking-card rank-worst">
      <h2>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        כיתות שדורשות התערבות
      </h2>
      ${[...allClassesSorted].reverse().slice(0, 5).map((c, i) => `
      <div class="rank-item">
        <div class="rank-num">${i + 1}</div>
        <div class="rank-name">כיתה ${c}</div>
        <div class="rank-pct ${colorClass(classSummaries[c].overallAttendance)}">${classSummaries[c].overallAttendance}%</div>
      </div>`).join('')}
    </div>
  </div>

  <!-- Per-class details -->
  <h2 class="section-title">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal-700)" stroke-width="2" style="display:inline;vertical-align:middle;margin-left:8px"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
    פירוט לפי כיתות
  </h2>
  <div class="class-grid">
    ${classCards}
  </div>

  <!-- Individual highlights -->
  <h2 class="section-title">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal-700)" stroke-width="2" style="display:inline;vertical-align:middle;margin-left:8px"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    נתונים אישיים
  </h2>
  <div class="highlights-grid">

    <div class="highlight-card">
      <h2 style="color:var(--green)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        מצטייני נוכחות (70%+)
      </h2>
      ${excellentStudents.length > 0 ? `
      <ul class="student-list">
        ${excellentStudents.slice(0, 20).map(s => `
        <li>
          <div><span class="student-name">${s.name}</span> <span class="student-class">(${s.className})</span></div>
          <div class="student-badges">
            <span class="badge green">${s.attRate}% נוכחות</span>
            <span class="badge ${colorClass(s.taskRate)}">${s.taskRate}% מטלות</span>
          </div>
        </li>`).join('')}
      </ul>` : '<div class="empty-state">לא נמצאו תלמידים עם נוכחות 70%+</div>'}
    </div>

    <div class="highlight-card">
      <h2 style="color:var(--red)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        לא נכנסו כלל (0% נוכחות)
      </h2>
      ${neverAttended.length > 0 ? `
      <ul class="student-list">
        ${neverAttended.map(s => `
        <li>
          <div><span class="student-name">${s.name}</span> <span class="student-class">(${s.className})</span></div>
          <span class="badge red">0%</span>
        </li>`).join('')}
      </ul>` : '<div class="empty-state">כל התלמידים נכנסו לפחות פעם אחת</div>'}
    </div>

    <div class="highlight-card">
      <h2 style="color:#f57f17">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f57f17" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        נוכחות טובה, הגשת מטלות נמוכה
      </h2>
      ${goodAttBadTask.length > 0 ? `
      <ul class="student-list">
        ${goodAttBadTask.slice(0, 20).map(s => `
        <li>
          <div><span class="student-name">${s.name}</span> <span class="student-class">(${s.className})</span></div>
          <div class="student-badges">
            <span class="badge green">${s.attRate}% נוכחות</span>
            <span class="badge red">${s.taskRate}% מטלות</span>
          </div>
        </li>`).join('')}
      </ul>` : '<div class="empty-state">לא נמצאו תלמידים בקטגוריה זו</div>'}
    </div>

  </div>

  <div style="text-align:center;padding:24px;color:var(--text-light);font-size:0.85rem;">
    דוח זה נוצר אוטומטית | נתונים מעודכנים ליום 18/3/2026
  </div>

</div>

</body>
</html>`;

// ========== WRITE OUTPUT ==========
fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, html, 'utf8');
console.log(`\nReport written to ${OUTPUT_FILE}`);
console.log(`\n=== SUMMARY ===`);
console.log(`School overall attendance: ${schoolOverall}%`);
console.log(`Total students: ${ACTIVE_CLASSES.reduce((s, c) => s + classSummaries[c].totalStudents, 0)}`);
console.log(`Excluded classes: ${EXCLUDED_CLASSES.join(', ')}`);
console.log(`Excellent students (70%+): ${excellentStudents.length}`);
console.log(`Never attended: ${neverAttended.length}`);
console.log(`Good attendance / low tasks: ${goodAttBadTask.length}`);
console.log(`\nPer-class:`);
for (const c of ACTIVE_CLASSES) {
  const s = classSummaries[c];
  console.log(`  ${c}: ${s.totalStudents} students, ${s.overallAttendance}% attendance, ${s.avgTasks}% tasks, trend: ${s.trend}${s.hasNoNames ? ' [NO NAMES]' : ''}`);
}
console.log(`\nFlags:`);
for (const f of flags) {
  console.log(`  ${f.className}: ${f.message}`);
}
