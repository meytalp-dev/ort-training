// Edura matching engine — match teachers ↔ jobs by subject + region (+ city bonus)
// Usage:
//   const matches = findJobsForTeacher(teacher, allJobs);   // sorted, score >= MIN
//   const matches = findTeachersForJob(job, allTeachers);   // sorted, score >= MIN

(function (root) {
  'use strict';

  const MIN_SCORE = 50;

  // Subject synonyms — group equivalent subject names so spelling/aliasing don't break matches
  const SUBJECT_SYNONYMS = [
    ['מתמטיקה', 'מתימטיקה', 'חשבון'],
    ['פיזיקה', 'פיסיקה'],
    ['תנ"ך', 'תנך', 'תנ"ך/תושב"ע', 'תושב"ע', 'תושבע'],
    ['מדעים', 'מדע וטכנולוגיה', 'מדע ותכנולוגיה'],
    ['מדעי המחשב', 'מחשבים', 'תקשוב'],
    ['חינוך מיוחד', 'חנ"מ', 'חנמ'],
    ['יועצ/ת חינוכי/ת', 'יועץ/ת', 'יועץ', 'יועצת', 'ייעוץ'],
    ['חינוך גופני', 'חנ"ג', 'חינוך גופני בנות', 'חינוך גופני בנים'],
    ['מחנך/ת', 'מחנך/מחנכת', 'מחנכים/ות', 'מחנכת', 'מחנך'],
  ];

  // Generic teacher labels — don't auto-match all subjects, treat as "no specific subject"
  const GENERIC_SUBJECTS = new Set(['מורה', 'מורים', 'כללי', 'אחר', '']);

  // Region neighbors — partial match score for adjacent regions
  const REGION_NEIGHBORS = {
    'מרכז': ['שפלה'],
    'שפלה': ['מרכז', 'דרום'],
    'דרום': ['שפלה'],
    'ירושלים': ['שפלה'],
  };

  // Build a normalized → canonical-key map for fast lookup
  const _subjectKey = (() => {
    const map = new Map();
    SUBJECT_SYNONYMS.forEach(group => {
      const canonical = group[0];
      group.forEach(s => map.set(normalizeText(s), canonical));
    });
    return map;
  })();

  function normalizeText(s) {
    return String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  function canonicalSubject(subject) {
    const norm = normalizeText(subject);
    if (!norm) return '';
    return _subjectKey.get(norm) || norm;
  }

  function isGenericSubject(subject) {
    return GENERIC_SUBJECTS.has(normalizeText(subject));
  }

  function regionScore(rA, rB) {
    const a = normalizeText(rA);
    const b = normalizeText(rB);
    if (!a || !b) return 0;
    if (a === b) return 30;
    const neighbors = REGION_NEIGHBORS[rA] || [];
    if (neighbors.includes(rB)) return 15;
    return 0;
  }

  function subjectScore(sA, sB) {
    if (isGenericSubject(sA) || isGenericSubject(sB)) return 0;
    const cA = canonicalSubject(sA);
    const cB = canonicalSubject(sB);
    if (!cA || !cB) return 0;
    if (cA === cB) return 60;
    // Substring fallback for partial matches like "מורה לתנ"ך" vs "תנ"ך"
    if (cA.includes(cB) || cB.includes(cA)) return 40;
    return 0;
  }

  function cityBonus(cA, cB) {
    const a = normalizeText(cA);
    const b = normalizeText(cB);
    if (!a || !b) return 0;
    return a === b ? 10 : 0;
  }

  function scoreMatch(teacher, job) {
    const subj = subjectScore(teacher.subject, job.subject);
    if (subj === 0) return 0;
    const reg = regionScore(teacher.region, job.region);
    const city = cityBonus(teacher.city, job.city);
    return subj + reg + city;
  }

  function findJobsForTeacher(teacher, jobs) {
    const out = [];
    for (const j of jobs) {
      const score = scoreMatch(teacher, j);
      if (score >= MIN_SCORE) out.push({ job: j, score });
    }
    out.sort((a, b) => b.score - a.score);
    return out;
  }

  function findTeachersForJob(job, teachers) {
    const out = [];
    for (const t of teachers) {
      const score = scoreMatch(t, job);
      if (score >= MIN_SCORE) out.push({ teacher: t, score });
    }
    out.sort((a, b) => b.score - a.score);
    return out;
  }

  root.EduraMatch = {
    findJobsForTeacher,
    findTeachersForJob,
    scoreMatch,
    MIN_SCORE,
  };
})(typeof window !== 'undefined' ? window : globalThis);
