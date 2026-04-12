// ===== SECTION DEFINITIONS =====
const SECTIONS={
  students:{title:'תלמידים',color:'#10B981'},
  staff:{title:'צוות',color:'#8B5CF6'},
  management:{title:'ניהול',color:'#7AADAD'},
  marketing:{title:'שיווק',color:'#F97316'},
  budget:{title:'תקציב',color:'#D4A574'}
};
let currentSection='all';

const agents=[
  // ===== תלמידים =====
  {id:'admission',section:'students',title:'קבלת תלמידים',desc:'לידים, ראיון, קליטה ותיק תלמיד',icon:_s('<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>','#10B981'),ready:true,url:'student-admission.html'},
  {id:'student-portfolio',section:'students',title:'תיק תלמיד דיגיטלי',desc:'198 תלמידים — פרטים, ציונים, דוחות יועצת',icon:_s('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M12 6v7"/><path d="M9 10l3 3 3-3"/>','#10B981'),ready:true,url:'student-portfolio.html'},
  {id:'student-file',section:'students',title:'תיק תלמיד',desc:'מידע אישי, אנשי קשר, הערות צוות',icon:_s('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>','#10B981'),ready:true,url:'student-file.html'},
  {id:'student-map',section:'students',title:'מפת התפתחות',desc:'מפת התפתחות אישית לכל תלמיד',icon:_s('<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>','#10B981'),ready:true,url:'student-map.html'},
  {id:'student-journey',section:'students',title:'מסע התלמיד',desc:'תוכנית אישית, רפלקציות ותעודת מסע',icon:_s('<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>','#10B981'),ready:true,url:'student-journey.html'},
  {id:'student-feedback',section:'students',title:'שיחות יחד',desc:'משוב משותף מורה-תלמיד על 9 תחומים',icon:_s('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>','#10B981'),ready:true,url:'student-feedback.html'},
  {id:'conversations',section:'students',title:'שיחות אישיות',desc:'תיעוד שיחות 1:1, מעקב יעדים וממדים',icon:_s('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>','#10B981'),ready:true,url:'personal-conversations.html'},
  {id:'dimensions',section:'students',title:'חמשת הממדים',desc:'פולס, דשבורדים, מערכי שיעור',icon:_s('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>','#10B981'),ready:true,url:'five-dimensions.html'},
  {id:'skills',section:'students',title:'מיומנויות לחיים',desc:'דשבורד ומשחק מיומנויות',icon:_s('<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><circle cx="12" cy="12" r="10"/><path d="M12 17h.01"/>','#10B981'),ready:true,url:'skills.html'},
  {id:'skills-game',section:'students',title:'משחק מיומנויות',desc:'מסע המיומנויות — Level Up',icon:_s('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>','#10B981'),ready:true,url:'skills-game.html'},
  {id:'adventure-game',section:'students',title:'משחק הרפתקאות',desc:'מסע המתקנים — Level Up',icon:_s('<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>','#10B981'),ready:true,url:'adventure-game.html'},
  {id:'pulse',section:'students',title:'מערכת פולס',desc:'שאלונים, דשבורד מנהלת, מחולל קישורים',icon:_s('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>','#10B981'),ready:true,url:'pulse-dashboard.html'},
  {id:'talking-walls',section:'students',title:'קירות מדברים',desc:'תצוגות אינטראקטיביות',icon:_s('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/>','#10B981'),ready:true,url:'talking-walls.html'},
  {id:'activity-live',section:'students',title:'פעילות חיה',desc:'פעילות חיה — חמשת הממדים',icon:_s('<path d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l2 2-2 2M18 13l2 2-2 2"/><path d="M10.3 7.7 14 12l-3.7 4.3"/>','#10B981'),ready:true,url:'activity-live.html'},
  {id:'alerts',section:'students',title:'תלמידים בסיכון',desc:'זיהוי והתראות על תלמידים בסיכון',icon:_s('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>','#10B981'),ready:false},

  // ===== צוות =====
  {id:'monthly-reports',section:'staff',title:'דוחות חודשיים',desc:'דוח מחנך, דוח יועצת, ביקורי בית, דשבורד מנהלת',icon:_s('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l2 2 4-4"/>','#8B5CF6'),ready:true,url:'monthly-reports.html'},
  {id:'teacher-feedback',section:'staff',title:'משוב מורים',desc:'מערכת משוב והערכה',icon:_s('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>','#8B5CF6'),ready:true,url:'teacher-feedback.html'},
  {id:'teacher-assessment',section:'staff',title:'הערכה עצמית',desc:'שאלון הערכה עצמית למורים',icon:_s('<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>','#8B5CF6'),ready:true,url:'teacher-assessment.html'},
  {id:'teacher-plan',section:'staff',title:'תוכנית למידה שנתית',desc:'תוכנית למידה אישית למורים',icon:_s('<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>','#8B5CF6'),ready:true,url:'teacher-plan.html'},
  {id:'teacher-plan-dashboard',section:'staff',title:'דשבורד תוכניות',desc:'סיכום ומעקב תוכניות למידה',icon:_s('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>','#8B5CF6'),ready:true,url:'teacher-plan-dashboard.html'},
  {id:'teacher-form',section:'staff',title:'שאלון מורים',desc:'תכנון שנה הבאה — שאלון מורים',icon:_s('<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>','#8B5CF6'),ready:true,url:'teacher-form.html'},
  {id:'staff-calendar',section:'staff',title:'לוח צוות',desc:'לוח אירועים ומשימות לצוות',icon:_s('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>','#8B5CF6'),ready:true,url:'staff-calendar.html'},
  {id:'mornings',section:'staff',title:'פתיחות בוקר',desc:'שיבוצים, תיעוד, בנק רעיונות לצוות',icon:_s('<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>','#8B5CF6'),ready:true,url:'morning-opening.html'},

  // ===== ניהול =====
  {id:'positions',section:'management',title:'תכנון משרות',desc:'ניהול משרות, תקנים, פערים וגיוס מורים',icon:_s('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>','#7AADAD'),ready:true},
  {id:'calendar',section:'management',title:'תכנון שנתי',desc:'לוח שנה, אירועים ומערכת שעות',icon:_s('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>','#7AADAD'),ready:true},
  {id:'curriculum',section:'management',title:'תכנון פדגוגי',desc:'שיבוץ מורים, דשבורד וכרטיסי מורים',icon:_s('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>','#7AADAD'),ready:true},
  {id:'tasks',section:'management',title:'ניהול משימות',desc:'מעקב משימות, תזכורות ותעדוף עבודה',icon:_s('<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>','#7AADAD'),ready:true},
  {id:'strategy',section:'management',title:'תוכנית אסטרטגית',desc:'חזון, ייעוד, ניתוח מצב ויעדים',icon:_s('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>','#7AADAD'),ready:true},
  {id:'stratreport',section:'management',title:'דוח אסטרטגי',desc:'כל המחקר והניתוח במסמך אחד',icon:_s('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>','#7AADAD'),ready:true},
  {id:'handbook',section:'management',title:'ספר בית הספר',desc:'נהלים, כללים ומענה לשאלות',icon:_s('<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>','#7AADAD'),ready:true},
  {id:'timetable',section:'management',title:'מערכת שעות',desc:'מערכת שעות דיגיטלית',icon:_s('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="9" y1="10" x2="9" y2="22"/>','#7AADAD'),ready:true,url:'timetable.html'},
  {id:'planning-hub',section:'management',title:'מרכז תכנון',desc:'תכנון שנתי מרוכז עם צ׳קליסט',icon:_s('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>','#7AADAD'),ready:true,url:'planning-hub.html'},
  {id:'gantt',section:'management',title:'לוח גאנט',desc:'ציר זמן ומעקב פרויקטים',icon:_s('<line x1="4" y1="6" x2="14" y2="6"/><line x1="4" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="10" y2="18"/>','#7AADAD'),ready:true,url:'gantt.html'},
  {id:'planning-dashboard',section:'management',title:'דשבורד תכנון',desc:'דשבורד תכנון שנתי',icon:_s('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>','#7AADAD'),ready:true,url:'planning-dashboard.html'},
  {id:'roles',section:'management',title:'הגדרות תפקידים',desc:'תפקידים ותחומי אחריות',icon:_s('<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6"/><path d="M23 11h-6"/>','#7AADAD'),ready:true,url:'roles.html'},
  {id:'employment',section:'management',title:'תעסוקה',desc:'מעסיקים, שיבוצים, טפסים, ביקורים',icon:_s('<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>','#7AADAD'),ready:true,url:'employment.html'},
  {id:'bnot-sherut',section:'management',title:'בנות שירות',desc:'שיבוץ, מעקב נוכחות, הערכות, משימות',icon:_s('<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>','#7AADAD'),ready:true,url:'bnot-sherut.html'},
  {id:'planning-form',section:'management',title:'טופס תוכנית עבודה',desc:'טופס תכנון שנתי לצוותים',icon:_s('<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>','#7AADAD'),ready:true,url:'planning-form.html'},

  // ===== שיווק =====
  {id:'jobboard',section:'marketing',title:'פרסום משרות',desc:'מודעות גיוס, ניהול משרות ודף ציבורי',icon:_s('<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>','#F97316'),ready:true},
  {id:'landing-recruitment',section:'marketing',title:'דף גיוס תלמידים',desc:'לחלום. ליצור. להוביל.',icon:_s('<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>','#F97316'),ready:true,url:'landing-recruitment.html'},
  {id:'parent-testimonials',section:'marketing',title:'המלצות הורים',desc:'28 ציטוטים אותנטיים מהורים',icon:_s('<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>','#F97316'),ready:true,url:'parent-testimonials.html'},
  {id:'job-card-builder',section:'marketing',title:'מחולל מודעות',desc:'יצירת מודעות גיוס מעוצבות',icon:_s('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>','#F97316'),ready:true,url:'job-card-builder.html'},

  // ===== תקציב =====
  {id:'budget-system',section:'budget',title:'מערכת תקציבית',desc:'ניהול תקציב, סעיפים והקצאות',icon:_s('<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>','#D4A574'),ready:true,url:'budget-system.html'},
  {id:'shiluv-dashboard',section:'budget',title:'סלי שילוב',desc:'דשבורד שעות שילוב ותוספתיות',icon:_s('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>','#D4A574'),ready:true,url:'shiluv-dashboard.html'},
  {id:'attendance-report',section:'budget',title:'דוח נוכחות',desc:'דוח נוכחות למידה מרחוק',icon:_s('<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>','#D4A574'),ready:true,url:'attendance-report.html'},
  {id:'resources',section:'budget',title:'גיוס משאבים',desc:'שיתופי פעולה וגיוס משאבים',icon:_s('<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>','#D4A574'),ready:true,url:'resources.html'},
];

// ===================== INIT =====================
const now=new Date();calYear=now.getFullYear();calMonth=now.getMonth();
renderDashboard();
loadRemoteData();
checkTaskReminders();

// ===================== SECTIONS & PAGES =====================
function showSection(sectionId){
  currentSection=sectionId;
  document.querySelectorAll('[id^="page-"]').forEach(p=>p.style.display='none');
  document.getElementById('page-dashboard').style.display='';
  document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));
  const labels={all:'הכל',students:'תלמידים',staff:'צוות',management:'ניהול',marketing:'שיווק',budget:'תקציב'};
  const target=labels[sectionId]||'';
  document.querySelectorAll('.nav button').forEach(b=>{if(b.textContent.trim()===target)b.classList.add('active')});
  renderDashboard();
}

