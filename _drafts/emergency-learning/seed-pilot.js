/* ============================================================================
 * רֶצֶף — שכבת נתוני-דמה של הפיילוט (מודל שני-צירים)
 * ----------------------------------------------------------------------------
 * מקור אמת אחד לכל מסכי הפרוטוטייפ עד שמחברים Supabase.
 * תואם ל-`data-model.md` v3.0 (§3.3b שני-צירים) ול-`operational-envelope.md` §1.
 *
 * הפיילוט (החלטה 16.7.2026): כיתת-אם אחת · 3 קבוצות לימוד · ~22 תלמידים.
 *   - ציר פסטורלי:  Class  (כיתת אם — check-in / דופק מחנך / חירום)
 *   - ציר אקדמי:    LearningGroup (הקצאות / ציונים / דיפרנציאציה)
 *
 * 🔑 מבחן שני-הצירים = חפיפה חלקית: כל הכיתה בעברית+מגמה, אבל רק חלק בתגבור.
 *    אם המסכים מציגים נכון "לדני 3 מורים ולרוני 2" — המודל הוכח.
 *
 * ⚠️ mock בלבד. access_token/PIN כאן הם placeholders — לא סוד אמיתי,
 *    לא זהות חוצת-מכשירים. הכל מתחלף בחיווט Supabase (שלב אחרון).
 * ==========================================================================*/

(function (root) {
  'use strict';

  const YEAR = 'תשפ"ז';

  /* --- בית ספר -------------------------------------------------------------- */
  const school = {
    id: 'sch_bh', name: 'אורט בית הערבה', network: 'אורט', district: 'מחוז דרום',
  };

  /* --- כיתת אם (ציר פסטורלי) ------------------------------------------------ */
  const classes = [
    { id: 'cls_i1', school_id: 'sch_bh', name: "י'1", grade: 'י',
      homeroom_teacher_id: 'stf_michal', school_year: YEAR, archived: false },
  ];

  /* --- צוות ---------------------------------------------------------------- */
  const staffMembers = [
    { id: 'stf_michal', first_name: 'מיכל',  phone: '0500000101', access_token: 'tok_michal_mock',  active: true },
    { id: 'stf_avi',    first_name: 'אבי',   phone: '0500000102', access_token: 'tok_avi_mock',     active: true },
    { id: 'stf_noa',    first_name: 'נועה',  phone: '0500000103', access_token: 'tok_noa_mock',      active: true },
    { id: 'stf_ronit',  first_name: 'רונית', phone: '0500000104', access_token: 'tok_ronit_mock',    active: true },
    { id: 'stf_david',  first_name: 'דוד',   phone: '0500000105', access_token: 'tok_david_mock',    active: true },
  ];

  // אדם אחד → כמה תפקידים. מיכל = מחנכת + מורת לשון.
  const staffRoles = [
    { id: 'rol_01', staff_id: 'stf_michal', role: 'homeroom',    school_id: 'sch_bh', subject: null,   scope_ref: 'cls_i1', expires_at: null, active: true },
    { id: 'rol_02', staff_id: 'stf_michal', role: 'subject',     school_id: 'sch_bh', subject: 'לשון', scope_ref: 'grp_lashon', expires_at: null, active: true },
    { id: 'rol_03', staff_id: 'stf_avi',    role: 'subject',     school_id: 'sch_bh', subject: 'מגמת חשמל ואלקטרוניקה', scope_ref: 'grp_magama', expires_at: null, active: true },
    { id: 'rol_04', staff_id: 'stf_noa',    role: 'subject',     school_id: 'sch_bh', subject: 'לשון', scope_ref: 'grp_tigbur', expires_at: null, active: true },
    { id: 'rol_05', staff_id: 'stf_ronit',  role: 'principal',   school_id: 'sch_bh', subject: null,   scope_ref: null, expires_at: null, active: true },
    // רכז תקשוב = בעל החשבון (החלטה 3): ניהול משתמשים, איפוס גישה, שיבוץ מחליף.
    { id: 'rol_06', staff_id: 'stf_david',  role: 'coordinator', school_id: 'sch_bh', subject: null,   scope_ref: null, expires_at: null, active: true },
  ];

  /* --- קבוצות לימוד (ציר אקדמי) -------------------------------------------- */
  const learningGroups = [
    { id: 'grp_lashon', school_id: 'sch_bh', name: "לשון י'1",             subject: 'לשון',
      teacher_id: 'stf_michal', grade: 'י', school_year: YEAR, archived: false },
    { id: 'grp_magama', school_id: 'sch_bh', name: 'מגמת חשמל ואלקטרוניקה', subject: 'מגמת חשמל ואלקטרוניקה',
      teacher_id: 'stf_avi',    grade: 'י', school_year: YEAR, archived: false },
    { id: 'grp_tigbur', school_id: 'sch_bh', name: 'תגבור לשון',           subject: 'לשון',
      teacher_id: 'stf_noa',    grade: 'י', school_year: YEAR, archived: false },
  ];

  /* --- תלמידים (22, כולם בכיתת האם י'1) ------------------------------------ */
  // שמות מגוונים. tigbur=true → מצורף גם לקבוצת התגבור (חפיפה חלקית).
  const roster = [
    { id: 'std_01', name: 'דני',    tigbur: true  },
    { id: 'std_02', name: 'רוני',   tigbur: false },
    { id: 'std_03', name: 'ליאן',   tigbur: true  },
    { id: 'std_04', name: 'עומר',   tigbur: false },
    { id: 'std_05', name: 'שירה',   tigbur: true  },
    { id: 'std_06', name: 'אחמד',   tigbur: false },
    { id: 'std_07', name: 'נועם',   tigbur: true  },
    { id: 'std_08', name: 'יסמין',  tigbur: false },
    { id: 'std_09', name: 'איתי',   tigbur: true  },
    { id: 'std_10', name: 'מריה',   tigbur: false },
    { id: 'std_11', name: 'בר',     tigbur: true  },
    { id: 'std_12', name: 'סאלי',   tigbur: false },
    { id: 'std_13', name: 'גיא',    tigbur: false },
    { id: 'std_14', name: 'תמר',    tigbur: true  },
    { id: 'std_15', name: 'לירן',   tigbur: false },
    { id: 'std_16', name: 'הדס',    tigbur: false },
    { id: 'std_17', name: 'יונתן',  tigbur: false },
    { id: 'std_18', name: 'אור',    tigbur: false },
    { id: 'std_19', name: 'רותם',   tigbur: false },
    { id: 'std_20', name: 'כרם',    tigbur: false },
    { id: 'std_21', name: 'מיכאל',  tigbur: false },
    { id: 'std_22', name: 'ספיר',   tigbur: false },
  ];

  const students = roster.map((s, i) => ({
    id: s.id,
    first_name: s.name,          // שם פרטי בלבד (מינימיזציה — אין שם משפחה/ת"ז)
    class_id: 'cls_i1',          // ציר פסטורלי — FK בודד
    phone: '05011' + String(1000 + i),
    guardian_phone: '05022' + String(1000 + i),
    guardian_opted_out: false,
    access_token: 'tok_' + s.id + '_mock',
    pin_hash: null,              // נקבע רק בהרשמה למופע-הערכה (§7)
    registered: i < 3,           // רק כמה נרשמו לשכבת הלמידה — השאר עדיין check-in בלבד
    active: true,
    created_at: '2026-09-01T08:00:00+03:00',
  }));

  /* --- Enrollment (רב-רבים — הציר האקדמי) ---------------------------------- */
  // כל הכיתה: לשון + מגמה. תגבור: רק החלק שמסומן → חפיפה חלקית.
  const enrollments = [];
  let e = 0;
  const enr = (student_id, group_id) =>
    enrollments.push({ id: 'enr_' + String(++e).padStart(2, '0'), student_id, learning_group_id: group_id });
  roster.forEach((s) => {
    enr(s.id, 'grp_lashon');
    enr(s.id, 'grp_magama');
    if (s.tigbur) enr(s.id, 'grp_tigbur');
  });
  // → 22 בלשון, 22 במגמה, 8 בתגבור. דני(std_01)=3 קבוצות/3 מורים; רוני(std_02)=2.

  /* --- נושאים / מיומנויות / רצף -------------------------------------------- */
  const topics = [
    { id: 'top_mishpat', subject: 'לשון', grade: 'י', title: 'משפט פשוט ומורכב', curriculum_ref: '011281', display_order: 3 },
  ];
  const skills = [
    { id: 'skl_nosenasu', subject: 'לשון', title: 'זיהוי נושא ונשוא', topic_id: 'top_mishpat' },
  ];
  const learningSequences = [
    { id: 'seq_lashon_i', subject: 'לשון', grade: 'י', topic_id: 'top_mishpat',
      title: "מסלול לשון י׳", unit_count: 6, curriculum_ref: '011281', authored_by: 'stf_michal' },
  ];

  /* --- יחידות תוכן (3 רמות כתובות מראש — לא ייצור-AI) ----------------------- */
  // תרגול מותאם (החלטה 2): המערכת בוחרת רמה, לא ממציאה. הרמה נגזרת מסימני-הרגע.
  const contentUnits = [
    { id: 'unt_mishpat_1', title: 'משפט פשוט מול משפט מורכב', subject: 'לשון', grade: 'י',
      body: 'פתיח: איך יודעים אם משפט פשוט או מורכב?', unit_type: 'task', level: 'standard',
      track_id: null, sequence_id: 'seq_lashon_i', topic_id: 'top_mishpat', skill_ids: ['skl_nosenasu'],
      sequence_order: 1, content_source: 'internal', external_ref: null,
      duration: { mode: 'estimated', targetMinutes: 5, allowExtension: true },
      modes_allowed: ['routine', 'remote', 'emergency'], accessibility: true,
      parent_unit_id: null, curated_by: 'stf_michal', active: true },
    { id: 'unt_mishpat_test', title: 'בוחן: זיהוי סוג משפט', subject: 'לשון', grade: 'י',
      body: '5 משפטים — סווגו פשוט/מורכב.', unit_type: 'assessment', level: 'standard',
      track_id: null, sequence_id: 'seq_lashon_i', topic_id: 'top_mishpat', skill_ids: ['skl_nosenasu'],
      sequence_order: 6, content_source: 'internal', external_ref: null,
      duration: { mode: 'fixed', targetMinutes: 20, allowExtension: false },
      modes_allowed: ['routine', 'remote'], accessibility: true,
      parent_unit_id: null, curated_by: 'stf_michal', active: true },
  ];

  /* --- הקצאות (יעד פולימורפי — class/group/student) ------------------------ */
  const assignments = [
    // הקצאה אקדמית רגילה → קבוצת לימוד (הזרימה השכיחה בשגרה).
    { id: 'asg_lashon', content_unit_id: 'unt_mishpat_1', target_type: 'group', target_id: 'grp_lashon',
      assigned_by: 'stf_michal', mode: 'routine', scheduled_for: '2026-11-12', override_body: null,
      duration_override: { mode: 'self_paced', allowExtension: true }, created_at: '2026-11-12T07:30:00+03:00' },
    // הקצאה כיתתית → כל כיתת האם (טיפוסי לחירום/פסטורלי).
    { id: 'asg_emrg', content_unit_id: 'unt_mishpat_1', target_type: 'class', target_id: 'cls_i1',
      assigned_by: 'stf_michal', mode: 'emergency', scheduled_for: '2026-11-12', override_body: null,
      duration_override: { mode: 'self_paced', allowExtension: true }, created_at: '2026-11-12T06:10:00+03:00' },
  ];

  /* --- הגשות (מדדי-רגע לדיפרנציאציה — לא תווית על התלמיד) ------------------- */
  const submissions = [
    { id: 'sub_01', assignment_id: 'asg_lashon', student_id: 'std_01', status: 'completed',
      feedback: 'יפה, שים לב למילת הקישור.', grade: null, support_level: 'on_own', mastery: 'core',
      hint_used: true, recovered_after_error: true, rescue_path: false, seen_by_teacher: true,
      mode: 'routine', completed_at: '2026-11-12T09:10:00+03:00' },
    { id: 'sub_02', assignment_id: 'asg_lashon', student_id: 'std_03', status: 'started',
      feedback: null, grade: null, support_level: 'with_you', mastery: null,
      hint_used: false, recovered_after_error: false, rescue_path: false, seen_by_teacher: false,
      mode: 'routine', completed_at: null },
  ];

  /* --- מצב מערכת (ברירת מחדל שגרה) ----------------------------------------- */
  const systemModes = [
    { id: 'sm_pilot', school_id: 'sch_bh', mode: 'routine', activated_by: 'stf_ronit',
      scheduled_for: null, note: 'פתיחת שנה — מצב שגרה', activated_at: '2026-09-01T07:00:00+03:00' },
  ];

  /* ------------------------------------------------------------------------ */
  const seed = {
    schools: [school], classes, learningGroups, staffMembers, staffRoles,
    students, enrollments, topics, skills, learningSequences,
    contentUnits, assignments, submissions, systemModes,
    checkins: [], dailyPresence: [], contactLogs: [], notifications: [], auditEvents: [],
  };

  /* --- עזרי שני-צירים (מה שהמסכים ישתמשו בהם) ----------------------------- */
  seed.helpers = {
    // קבוצות הלימוד של תלמיד (הציר האקדמי).
    groupsOfStudent(studentId) {
      const ids = enrollments.filter((x) => x.student_id === studentId).map((x) => x.learning_group_id);
      return learningGroups.filter((g) => ids.includes(g.id));
    },
    // המורים של תלמיד: מחנך (פסטורלי) + מורי הקבוצות (אקדמי).
    teachersOfStudent(studentId) {
      const stu = students.find((s) => s.id === studentId);
      const cls = classes.find((c) => c.id === (stu && stu.class_id));
      const ids = new Set();
      if (cls) ids.add(cls.homeroom_teacher_id);
      seed.helpers.groupsOfStudent(studentId).forEach((g) => ids.add(g.teacher_id));
      return staffMembers.filter((m) => ids.has(m.id));
    },
    // חברי קבוצה.
    studentsOfGroup(groupId) {
      const ids = enrollments.filter((x) => x.learning_group_id === groupId).map((x) => x.student_id);
      return students.filter((s) => ids.includes(s.id));
    },
  };

  /* --- חשיפה: גלובל + מודול -------------------------------------------------*/
  root.PILOT_SEED = seed;
  if (typeof module !== 'undefined' && module.exports) module.exports = seed;
})(typeof window !== 'undefined' ? window : globalThis);
