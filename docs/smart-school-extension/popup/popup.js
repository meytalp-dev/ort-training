// ImpactOS ↔ SmartSchool — Popup script (Phase 1 — both screens supported)

const STORAGE_KEY = 'impactos_grades_v1';
const TEMPLATE_KEY = 'impactos_event_tpl_v1';

// ============== Page detection ==============
async function detectSmartSchoolPage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const isSmartSchool = tab?.url && /smart-?school\.(co\.il|org\.il)/.test(tab.url);
  const statusEl = document.getElementById('status-text');
  const dotEl = document.querySelector('.dot');
  if (isSmartSchool) {
    statusEl.textContent = 'מזוהה: את ב-SmartSchool ✓';
    dotEl.classList.remove('orange'); dotEl.classList.add('green');
    document.getElementById('btn-fill-event').disabled = false;
    document.getElementById('btn-fill-grades').disabled = false;
  } else {
    statusEl.textContent = 'את לא ב-SmartSchool. עברי לטופס שם.';
    dotEl.classList.remove('orange'); dotEl.classList.add('red');
  }
  return isSmartSchool;
}

// ============== Grades storage ==============
async function loadGrades() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  return data[STORAGE_KEY] || [];
}
async function saveGrades(grades) { await chrome.storage.local.set({ [STORAGE_KEY]: grades }); }

function renderGrades(grades) {
  const list = document.getElementById('grades-list');
  if (!grades || grades.length === 0) {
    list.innerHTML = '<div class="empty">אין עדיין ציונים שמורים.</div>';
    return;
  }
  list.innerHTML = grades.map(g => `
    <div class="row">
      <div><strong>${g.name}</strong><br><span style="font-size:11px;opacity:0.65">${g.cls || ''}</span></div>
      <div style="font-family:'Rubik',sans-serif;font-weight:800;font-size:16px;color:${g.score >= 70 ? '#4A9B7F' : g.score >= 55 ? '#E8A849' : '#8B3A4A'}">${g.score}</div>
    </div>
  `).join('');
}

// ============== Template storage ==============
async function loadTemplate() {
  const d = await chrome.storage.local.get(TEMPLATE_KEY);
  return d[TEMPLATE_KEY] || { eventName: 'תרגול פרק כ"ח · בעלת האוב', period: 'שליש ג', weight: '0', subject: 'תנ"ך' };
}
async function saveTemplate(tpl) { await chrome.storage.local.set({ [TEMPLATE_KEY]: tpl }); }

function readTemplateFromUI() {
  return {
    eventName: document.getElementById('tpl-event-name').value.trim(),
    period:    document.getElementById('tpl-period').value,
    weight:    document.getElementById('tpl-weight').value,
    subject:   document.getElementById('tpl-subject').value.trim(),
  };
}

function setTemplateInUI(tpl) {
  document.getElementById('tpl-event-name').value = tpl.eventName || '';
  document.getElementById('tpl-period').value     = tpl.period || 'שליש ג';
  document.getElementById('tpl-weight').value     = tpl.weight || '0';
  document.getElementById('tpl-subject').value    = tpl.subject || 'תנ"ך';
}

// ============== Fetch grades (demo) ==============
async function fetchGradesFromImpactOS() {
  // Demo data — Phase 2: real fetch from ImpactOS endpoint
  const demoGrades = [
    { id: 1,  name: 'אסולין ליאל',    cls: "ט'1", score: 75 },
    { id: 3,  name: 'בר חן נריה',     cls: "ט'1", score: 68 },
    { id: 4,  name: 'חזות אור',       cls: "ט'1", score: 62 },
    { id: 5,  name: 'חייט אריה',      cls: "ט'1", score: 58 },
    { id: 10, name: 'אילון נועה',     cls: "ט'2", score: 92 },
    { id: 15, name: 'למברטו הודיה',   cls: "ט'2", score: 84 },
    { id: 17, name: 'מזרחי אוריה',    cls: "ט'2", score: 88 },
    { id: 18, name: 'מזרחי אנאל',     cls: "ט'2", score: 95 },
    { id: 23, name: 'רופא שרה',       cls: "ט'2", score: 80 },
  ];
  await saveGrades(demoGrades);
  renderGrades(demoGrades);
  alert('נטענו ' + demoGrades.length + ' ציונים (דמו).');
}

// ============== Fill event creation form (Screen 1) ==============
async function fillEventForm() {
  const tpl = readTemplateFromUI();
  await saveTemplate(tpl);
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const result = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (template) => {
      // Label-based field detection — finds inputs by their associated Hebrew label text.
      // Stable across SmartSchool UI changes (labels rarely change, classes do).
      function findInputByLabel(labelTexts) {
        const labels = labelTexts.flatMap(t => [t, t + ':', t + ' :']);
        // Try via <label for=...>
        for (const lbl of document.querySelectorAll('label, th, td, span, div')) {
          const txt = (lbl.textContent || '').trim();
          if (!labels.some(l => txt === l || txt.includes(l))) continue;
          // Look for input in same row/parent
          let host = lbl.closest('tr, .form-row, .field, .form-group') || lbl.parentElement;
          if (host) {
            const inp = host.querySelector('input:not([type="hidden"]), select, textarea');
            if (inp) return inp;
          }
          // Look at next sibling
          let sib = lbl.nextElementSibling;
          while (sib && !sib.querySelector?.('input, select, textarea')) sib = sib.nextElementSibling;
          if (sib) {
            const inp = sib.querySelector('input, select, textarea');
            if (inp) return inp;
          }
        }
        return null;
      }

      function setValue(input, value) {
        if (!input) return false;
        if (input.tagName === 'SELECT') {
          // Find matching option by text
          for (const opt of input.options) {
            if ((opt.textContent || '').trim().includes(value)) {
              input.value = opt.value;
              input.dispatchEvent(new Event('change', { bubbles: true }));
              return true;
            }
          }
          return false;
        }
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }

      const filled = [];
      const failed = [];

      const eventNameInput = findInputByLabel(['שם אירוע הערכה', 'שם האירוע']);
      if (setValue(eventNameInput, template.eventName)) filled.push('שם אירוע'); else failed.push('שם אירוע');

      const periodInput = findInputByLabel(['תקופת לימוד']);
      if (setValue(periodInput, template.period)) filled.push('תקופת לימוד'); else failed.push('תקופת לימוד');

      const subjectInput = findInputByLabel(['נושא']);
      if (setValue(subjectInput, template.subject)) filled.push('נושא'); else failed.push('נושא');

      const weightInput = findInputByLabel(['משקל']);
      if (setValue(weightInput, template.weight)) filled.push('משקל'); else failed.push('משקל');

      return { filled, failed };
    },
    args: [tpl],
  });
  const r = result[0]?.result || {};
  const msg = (r.filled?.length
    ? '✓ מולאו: ' + r.filled.join(', ')
    : 'לא הצלחתי למלא אף שדה — ייתכן שאת לא במסך הנכון.')
    + (r.failed?.length ? '\nלא נמצאו: ' + r.failed.join(', ') : '');
  alert(msg);
}

// ============== Fill grades (Screen 2) ==============
async function fillGrades() {
  const grades = await loadGrades();
  if (!grades || grades.length === 0) {
    alert('אין ציונים לטעון. משכי קודם ציונים מ-ImpactOS.');
    return;
  }
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const result = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (gradesPayload) => {
      // Strategy: find rows that contain a student name (Hebrew text) + a number input.
      // For each row, match the name to a grade in payload and fill.
      const filled = [];
      const notFound = [];
      const rows = document.querySelectorAll('tr, .student-row, [data-student], .grade-row');

      function normalize(s) { return (s || '').replace(/\s+/g, ' ').trim(); }

      gradesPayload.forEach(g => {
        const targetName = normalize(g.name);
        let matched = null;
        for (const row of rows) {
          const txt = normalize(row.textContent);
          if (!txt.includes(targetName)) continue;
          // Find a number input in this row
          const input = row.querySelector('input[type="number"], input[type="text"][maxlength="3"], input.grade-input');
          if (input) { matched = input; break; }
        }
        if (matched) {
          matched.value = g.score;
          matched.dispatchEvent(new Event('input', { bubbles: true }));
          matched.dispatchEvent(new Event('change', { bubbles: true }));
          filled.push(g.name);
        } else {
          notFound.push(g.name);
        }
      });
      return { filled, notFound, totalGrades: gradesPayload.length };
    },
    args: [grades],
  });
  const r = result[0]?.result || {};
  const msg = `✓ מולאו ${r.filled?.length || 0} מתוך ${r.totalGrades || 0} תלמידים.`
    + (r.notFound?.length ? '\n\nלא נמצאו בטופס:\n' + r.notFound.join(', ') : '');
  alert(msg);
}

// ============== Init ==============
document.addEventListener('DOMContentLoaded', async () => {
  await detectSmartSchoolPage();
  renderGrades(await loadGrades());
  setTemplateInUI(await loadTemplate());

  document.getElementById('btn-fetch').addEventListener('click', fetchGradesFromImpactOS);
  document.getElementById('btn-fill-event').addEventListener('click', fillEventForm);
  document.getElementById('btn-fill-grades').addEventListener('click', fillGrades);

  // Auto-save template on change
  ['tpl-event-name', 'tpl-period', 'tpl-weight', 'tpl-subject'].forEach(id => {
    document.getElementById(id).addEventListener('change', async () => {
      await saveTemplate(readTemplateFromUI());
    });
  });
});
