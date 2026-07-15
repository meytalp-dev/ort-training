/* ============================================================
   רֶצֶף — שער ה-AI (הגבול הארכיטקטוני הנאכף)
   ai-boundary.js  ·  משימה W0-S4  ·  תואם ai-data-boundary.md,
   security-minimization.md §3 שורה 1, prd.md §6, ai-redlines.md (איסור 4)
   ------------------------------------------------------------
   הגבול, במשפט: שום נתון תלמיד לא נשלח למודל AI חיצוני.
   AI מותר אך ורק על חומר לימוד, ואך ורק בצד הצוות (מורה/יוצר תוכן).

   איך זה נאכף (choke point):
     כל קריאת AI ברֶצֶף — עכשיו ובעתיד — חייבת לעבור דרך gateway().
     gateway() מריץ assertContentOnly() על המעטפה לפני שהוא נוגע במודל;
     מעטפה שנכשלת => זריקת AiBoundaryError, המודל לא נקרא. אין מסלול עוקף.

   שימוש (צד מורה בלבד):
     <script src="ai-boundary.js"></script>
     const envelope = {
       scope: 'learning_material',
       actor: { role: 'teacher' },
       material: { title: '...', body: '...', goals: [...] }
     };
     RETZEF_AI_BOUNDARY.gateway(envelope, callModel)  // callModel = הקריאה בפועל למודל
       .then(...).catch(err => { ... });  // AiBoundaryError => הגבול חסם

   כלל הברזל לכל סוכן AI עתידי: אם הקוד קורא למודל בלי לעבור דרך
   gateway() — הוא חוצה את הגבול, גם אם המעטפה "נראית נקייה".
   ============================================================ */
(function (root) {
  'use strict';

  /* ---------- 1. מה מותר ---------- */
  // scope: הערך היחיד המותר. אין "student", אין "mixed".
  var ALLOWED_SCOPES = ['learning_material'];
  // actor.role: תפקידי צוות-תוכן בלבד. 'student' לעולם לא כאן.
  var ALLOWED_ROLES = ['teacher', 'content_author', 'supervisor'];

  /* ---------- 2. מה אסור (נגזר מ-data-model.md §3) ---------- */
  // ישויות/מחלקות של תלמיד — שם כזה כמפתח במעטפה = חסימה.
  var FORBIDDEN_ENTITIES = [
    'student', 'submission', 'checkin', 'check_in',
    'dailypresence', 'daily_presence', 'presence',
    'contactlog', 'contact_log', 'studentprogress', 'student_progress',
    'supportprofile', 'support_profile', 'attachment', 'guardian'
  ];
  // דפוסי-שדה שמסגירים נתון תלמיד — נבדקים כתת-מחרוזת במפתח (case-insensitive).
  var FORBIDDEN_KEY_PATTERNS = [
    'studentid', 'student_id', 'pupilid', 'learnerid',
    'grade', 'score', 'mark',                 // ציון/הגשה
    'distress', 'checkin', 'check_in', 'mood', // check-in רגשי (מב"ר)
    'presence', 'lastactive', 'activeseconds', // מצב/מעקב
    'guardian', 'parentphone', 'nationalid', 'teudat', 'tz',
    'firstname', 'lastname', 'fullname', 'phone', 'email',
    'studentnote', 'freetext', 'studenttext', 'studentanswer', 'studentinput'
  ];

  // מפתחות תוכן מותרים בתוך material — כל מפתח אחר נבדק בזהירות אך לא נחסם
  // רק מפני שהוא לא ברשימה (הרשימה השחורה למעלה היא הקובעת). כאן רק לתיעוד.
  var CONTENT_KEYS_HINT = ['title', 'body', 'goals', 'questions', 'anchorText',
    'summary', 'language', 'level', 'slides', 'override_body', 'sourceRef'];

  /* ---------- 3. שגיאת הגבול ---------- */
  function AiBoundaryError(message, detail) {
    this.name = 'AiBoundaryError';
    this.message = message;
    this.detail = detail || null;
  }
  AiBoundaryError.prototype = Object.create(Error.prototype);
  AiBoundaryError.prototype.constructor = AiBoundaryError;

  /* ---------- 4. סורק עומק — מחפש נתון תלמיד בכל מפתח/ערך ---------- */
  function normKey(k) { return String(k).toLowerCase().replace(/[\s-]/g, '_'); }

  function scanForForbidden(obj, path, hits, depth) {
    if (depth > 8) return; // הגנה מפני מבנה מעגלי/עמוק מדי
    if (obj === null || typeof obj !== 'object') return;
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      var raw = keys[i];
      var nk = normKey(raw);
      var here = path ? path + '.' + raw : raw;

      // מפתח ששמו ישות תלמיד
      if (FORBIDDEN_ENTITIES.indexOf(nk) !== -1) {
        hits.push({ path: here, reason: 'entity:' + nk });
      } else {
        // מפתח שמכיל דפוס אסור כתת-מחרוזת
        for (var p = 0; p < FORBIDDEN_KEY_PATTERNS.length; p++) {
          var flat = nk.replace(/_/g, '');
          if (flat.indexOf(FORBIDDEN_KEY_PATTERNS[p].replace(/_/g, '')) !== -1) {
            hits.push({ path: here, reason: 'pattern:' + FORBIDDEN_KEY_PATTERNS[p] });
            break;
          }
        }
      }
      // המשך לעומק
      var val = obj[raw];
      if (val && typeof val === 'object') scanForForbidden(val, here, hits, depth + 1);
    }
  }

  /* ---------- 5. השער החוסם — assertContentOnly ---------- */
  // זורק AiBoundaryError אם המעטפה חוצה את הגבול. אחרת מחזיר את המעטפה.
  function assertContentOnly(envelope) {
    if (!envelope || typeof envelope !== 'object') {
      throw new AiBoundaryError('מעטפת AI חסרה או לא תקינה — אין קריאה למודל בלי מעטפה מובנית.');
    }
    // scope
    if (ALLOWED_SCOPES.indexOf(envelope.scope) === -1) {
      throw new AiBoundaryError(
        'scope לא מותר: "' + envelope.scope + '". מותר רק: ' + ALLOWED_SCOPES.join(', ') + '.',
        { field: 'scope' });
    }
    // actor.role — לעולם לא תלמיד
    var role = envelope.actor && envelope.actor.role;
    if (ALLOWED_ROLES.indexOf(role) === -1) {
      throw new AiBoundaryError(
        'actor.role לא מורשה לשלוח למודל: "' + role + '". AI מותר רק בצד הצוות; תלמיד לעולם לא.',
        { field: 'actor.role' });
    }
    // material קיים
    if (!envelope.material || typeof envelope.material !== 'object') {
      throw new AiBoundaryError('חסר material (חומר הלימוד) — אין מה לשלוח למודל.', { field: 'material' });
    }
    // סריקת עומק על כל המעטפה — שום נתון תלמיד לא עובר
    var hits = [];
    scanForForbidden(envelope, '', hits, 0);
    if (hits.length) {
      throw new AiBoundaryError(
        'המעטפה מכילה נתון תלמיד — הגבול חסם את הקריאה למודל (' + hits.length + ' ממצאים).',
        { hits: hits });
    }
    return envelope;
  }

  // גרסה שקטה לבדיקה מקדימה בממשק (true/false) — לא מחליפה את השער בקריאה בפועל.
  function isContentOnly(envelope) {
    try { assertContentOnly(envelope); return true; } catch (e) { return false; }
  }

  /* ---------- 6. gateway — נקודת המעבר היחידה למודל ---------- */
  // envelope: המעטפה המובנית. callModel: פונקציה שמבצעת את הקריאה בפועל
  // ומקבלת את envelope.material בלבד (אף פעם לא את המעטפה המלאה או נתוני תלמיד).
  // מחזיר Promise; נכשל ב-AiBoundaryError לפני שהמודל נוגע בכלום.
  function gateway(envelope, callModel) {
    return new Promise(function (resolve2, reject) {
      var ok;
      try {
        ok = assertContentOnly(envelope);
      } catch (e) {
        reject(e); // הגבול חסם — callModel לא נקרא בכלל
        return;
      }
      if (typeof callModel !== 'function') {
        reject(new AiBoundaryError('gateway קיבל callModel שאינו פונקציה.'));
        return;
      }
      // רק כאן, ורק חומר הלימוד, מגיע למודל
      try {
        resolve2(callModel(ok.material));
      } catch (e2) {
        reject(e2);
      }
    });
  }

  /* ============================================================
     6b. מסלול מצרפי (aggregate_metrics) — תוספת נאכפת, לא חורגת מהגבול.
     ------------------------------------------------------------
     ליכולות AI על *נתונים מצרפיים בלבד* (זיהוי מגמות / המלצות ניהוליות)
     — לוח מנהל/פיקוח. הכלל: אף פעם על קטין בודד. שתי אכיפות מצטברות:
       (1) אותה סריקת-עומק של המסלול הראשי — כל שדה מזהה תלמיד (שם, ת"ז,
           studentId, ציון, נוכחות, check-in…) → חסימה. אין מסלול עוקף.
       (2) דיכוי תאים קטנים (k-anonymity): כל גודל-קבוצה קטן מ-MIN_CELL
           עלול לזהות קטין בודד → חסימה. רק מספרים על קבוצה גדולה דיה.
     המודל מקבל מספרים מצרפיים בלבד — לעולם לא שורת-תלמיד ולא תא זעיר.
     ============================================================ */
  var ALLOWED_AGG_SCOPES = ['aggregate_metrics'];
  // תפקידי צוות-ניהול שרשאים לבקש תובנות מצרפיות. 'student' לעולם לא כאן.
  var ALLOWED_AGG_ROLES = ['principal', 'supervisor', 'admin', 'inspector'];
  // סף k-anonymity: תא/קבוצה קטן מזה נחסם (עלול להצביע על קטין בודד).
  var MIN_CELL = 10;
  // שמות שדות שמייצגים גודל-קבוצה — כל ערך מספרי כזה חייב להיות ≥ MIN_CELL.
  var CELL_SIZE_KEYS = ['n', 'count', 'size', 'students', 'group_size', 'sample', 'denominator'];

  // סריקת עומק — מאתרת תא קטן (0 < n < MIN_CELL) בכל מקום במעטפה.
  function scanForSmallCells(obj, path, hits, depth) {
    if (depth > 8) return;
    if (obj === null || typeof obj !== 'object') return;
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      var raw = keys[i];
      var nk = normKey(raw);
      var here = path ? path + '.' + raw : raw;
      var val = obj[raw];
      if (CELL_SIZE_KEYS.indexOf(nk) !== -1 && typeof val === 'number') {
        if (val > 0 && val < MIN_CELL) {
          hits.push({ path: here, value: val, reason: 'cell<' + MIN_CELL });
        }
      }
      if (val && typeof val === 'object') scanForSmallCells(val, here, hits, depth + 1);
    }
  }

  // השער החוסם למסלול המצרפי. זורק AiBoundaryError אם חוצה את הגבול.
  function assertAggregateOnly(envelope) {
    if (!envelope || typeof envelope !== 'object') {
      throw new AiBoundaryError('מעטפת AI חסרה או לא תקינה — אין קריאה למודל בלי מעטפה מובנית.');
    }
    if (ALLOWED_AGG_SCOPES.indexOf(envelope.scope) === -1) {
      throw new AiBoundaryError(
        'scope לא מותר במסלול המצרפי: "' + envelope.scope + '". מותר רק: ' + ALLOWED_AGG_SCOPES.join(', ') + '.',
        { field: 'scope' });
    }
    var role = envelope.actor && envelope.actor.role;
    if (ALLOWED_AGG_ROLES.indexOf(role) === -1) {
      throw new AiBoundaryError(
        'actor.role לא מורשה לתובנות מצרפיות: "' + role + '". רק תפקיד ניהול/פיקוח; תלמיד לעולם לא.',
        { field: 'actor.role' });
    }
    if (!Array.isArray(envelope.metrics) || envelope.metrics.length === 0) {
      throw new AiBoundaryError('חסר metrics (מדדים מצרפיים) — אין מספרים לשלוח למודל.', { field: 'metrics' });
    }
    // (1) אותה סריקה של המסלול הראשי — שום נתון מזהה-תלמיד לא עובר.
    var idHits = [];
    scanForForbidden(envelope, '', idHits, 0);
    if (idHits.length) {
      throw new AiBoundaryError(
        'המעטפה מכילה נתון תלמיד — הגבול חסם את הקריאה למודל (' + idHits.length + ' ממצאים).',
        { hits: idHits });
    }
    // (2) דיכוי תאים קטנים — אף קבוצה קטנה מ-MIN_CELL לא יוצאת (אנטי-זיהוי).
    var cellHits = [];
    scanForSmallCells(envelope.metrics, 'metrics', cellHits, 0);
    if (cellHits.length) {
      throw new AiBoundaryError(
        'תא מצרפי קטן מ-' + MIN_CELL + ' — עלול לזהות קטין בודד, הגבול חסם (' + cellHits.length + ' ממצאים).',
        { hits: cellHits, minCell: MIN_CELL });
    }
    return envelope;
  }

  function isAggregateOnly(envelope) {
    try { assertAggregateOnly(envelope); return true; } catch (e) { return false; }
  }

  // gateway מצרפי — נקודת מעבר יחידה למודל עבור תובנות על מספרים מצרפיים.
  // callModel מקבל payload מצרפי בלבד: { grouping, period, metrics } — לעולם לא מעטפה/תלמיד.
  function aggregateGateway(envelope, callModel) {
    return new Promise(function (resolve2, reject) {
      var ok;
      try {
        ok = assertAggregateOnly(envelope);
      } catch (e) {
        reject(e); // הגבול חסם — callModel לא נקרא בכלל
        return;
      }
      if (typeof callModel !== 'function') {
        reject(new AiBoundaryError('aggregateGateway קיבל callModel שאינו פונקציה.'));
        return;
      }
      try {
        resolve2(callModel({
          grouping: ok.grouping || null,
          period: ok.period || null,
          metrics: ok.metrics
        }));
      } catch (e2) {
        reject(e2);
      }
    });
  }

  /* ---------- 7. describe — מניפסט קריא-מכונה (לתיעוד/בדיקות) ---------- */
  function describe() {
    return {
      rule: 'no student data leaves to an external AI model; AI only on learning material (teacher-side) or aggregate metrics (staff-side)',
      allowedScopes: ALLOWED_SCOPES.slice(),
      allowedRoles: ALLOWED_ROLES.slice(),
      forbiddenEntities: FORBIDDEN_ENTITIES.slice(),
      forbiddenKeyPatterns: FORBIDDEN_KEY_PATTERNS.slice(),
      contentKeysHint: CONTENT_KEYS_HINT.slice(),
      aggregate: {
        allowedScopes: ALLOWED_AGG_SCOPES.slice(),
        allowedRoles: ALLOWED_AGG_ROLES.slice(),
        minCell: MIN_CELL,
        cellSizeKeys: CELL_SIZE_KEYS.slice()
      },
      enforcedBy: 'gateway()→assertContentOnly() · aggregateGateway()→assertAggregateOnly()',
      doc: 'ai-data-boundary.md'
    };
  }

  /* ---------- 8. ייצוא ---------- */
  root.RETZEF_AI_BOUNDARY = {
    AiBoundaryError: AiBoundaryError,
    ALLOWED_SCOPES: ALLOWED_SCOPES,
    ALLOWED_ROLES: ALLOWED_ROLES,
    FORBIDDEN_ENTITIES: FORBIDDEN_ENTITIES,
    FORBIDDEN_KEY_PATTERNS: FORBIDDEN_KEY_PATTERNS,
    assertContentOnly: assertContentOnly,
    isContentOnly: isContentOnly,
    gateway: gateway,
    // מסלול מצרפי (aggregate_metrics) — תובנות על מספרים בלבד, לעולם לא קטין בודד.
    ALLOWED_AGG_SCOPES: ALLOWED_AGG_SCOPES,
    ALLOWED_AGG_ROLES: ALLOWED_AGG_ROLES,
    MIN_CELL: MIN_CELL,
    assertAggregateOnly: assertAggregateOnly,
    isAggregateOnly: isAggregateOnly,
    aggregateGateway: aggregateGateway,
    describe: describe
  };

  // תמיכה ב-CommonJS אם ירוץ בבדיקת Node.
  if (typeof module !== 'undefined' && module.exports) module.exports = root.RETZEF_AI_BOUNDARY;

})(typeof window !== 'undefined' ? window : this);
