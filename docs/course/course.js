/* ============================================
   Learni Course – Progress Tracking & Navigation
   ============================================ */

const CourseData = {
  modules: [
    { id: 0, title: 'הכנה', lessons: ['מה זה AI ולמה זה רלוונטי', 'מה זה Claude Code — סקירה', 'התקנה צעד-צעד'] },
    { id: 1, title: 'הצעד הראשון', lessons: ['יצירת פרויקט + CLAUDE.md', 'התוצר הראשון — WOW', 'איך לדבר עם Claude', 'פרסום — GitHub Pages'] },
    { id: 2, title: 'סקילס וסוכנים', lessons: ['מה זה סקילס וסוכנים', 'התקנת חבילת סקילס', 'יצירת סקיל מותאם אישית', 'דוגמאות מעשיות'] },
    { id: 3, title: 'חיבורים חיצוניים', lessons: ['מה זה MCP — חיבור לעולם', 'Gmail + Calendar + Drive', 'Canva + Google Sheets', 'אוטומציה — Hooks + סוכנים'] },
    { id: 4, title: 'פרויקט מסכם', lessons: ['בחירת פרויקט + תכנון', 'בניה מודרכת', 'הגשה + תעודה'] }
  ],
  totalLessons: 18
};

/* --- Storage --- */
const STORAGE_KEY = 'learni-course-progress';

function getProgress() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch { /* silent fail */ }
}

function isLessonComplete(moduleId, lessonIndex) {
  const progress = getProgress();
  const key = `m${moduleId}_l${lessonIndex}`;
  return progress[key] === true;
}

function markLessonComplete(moduleId, lessonIndex) {
  const progress = getProgress();
  const key = `m${moduleId}_l${lessonIndex}`;
  progress[key] = true;
  saveProgress(progress);
  updateAllUI();
}

function markLessonIncomplete(moduleId, lessonIndex) {
  const progress = getProgress();
  const key = `m${moduleId}_l${lessonIndex}`;
  delete progress[key];
  saveProgress(progress);
  updateAllUI();
}

function getModuleProgress(moduleId) {
  const module = CourseData.modules.find(m => m.id === moduleId);
  if (!module) return { completed: 0, total: 0, percent: 0 };
  let completed = 0;
  module.lessons.forEach((_, i) => {
    if (isLessonComplete(moduleId, i)) completed++;
  });
  return {
    completed,
    total: module.lessons.length,
    percent: Math.round((completed / module.lessons.length) * 100)
  };
}

function isModuleComplete(moduleId) {
  const { percent } = getModuleProgress(moduleId);
  return percent === 100;
}

function getOverallProgress() {
  let completed = 0;
  CourseData.modules.forEach(mod => {
    mod.lessons.forEach((_, i) => {
      if (isLessonComplete(mod.id, i)) completed++;
    });
  });
  return {
    completed,
    total: CourseData.totalLessons,
    percent: Math.round((completed / CourseData.totalLessons) * 100)
  };
}

function getUserName() {
  try {
    return localStorage.getItem('learni-course-name') || '';
  } catch { return ''; }
}

function setUserName(name) {
  try {
    localStorage.setItem('learni-course-name', name);
  } catch { /* silent */ }
}

/* --- UI Updates --- */
function updateAllUI() {
  updateHeaderProgress();
  updateModuleCards();
  updateSidebar();
  updateModuleProgressBar();
}

function updateHeaderProgress() {
  const fill = document.querySelector('.nav-progress-fill');
  const text = document.querySelector('.nav-progress-text');
  if (!fill) return;
  const { percent } = getOverallProgress();
  fill.style.width = percent + '%';
  if (text) text.textContent = percent + '%';
}

function updateModuleCards() {
  document.querySelectorAll('.module-card').forEach(card => {
    const moduleId = parseInt(card.dataset.module);
    if (isNaN(moduleId)) return;
    const { percent, completed, total } = getModuleProgress(moduleId);
    const fill = card.querySelector('.progress-mini-fill');
    const percentText = card.querySelector('.progress-percent');
    if (fill) fill.style.width = percent + '%';
    if (percentText) percentText.textContent = completed + '/' + total;
    card.classList.toggle('is-complete', percent === 100);
  });
}

function updateSidebar() {
  document.querySelectorAll('.sidebar-lesson').forEach(item => {
    const moduleId = parseInt(item.dataset.module);
    const lessonIndex = parseInt(item.dataset.lesson);
    if (isNaN(moduleId) || isNaN(lessonIndex)) return;
    item.classList.toggle('completed', isLessonComplete(moduleId, lessonIndex));
  });
}

function updateModuleProgressBar() {
  const bar = document.querySelector('.module-progress-fill');
  const text = document.querySelector('.module-progress-text');
  const moduleId = parseInt(document.body.dataset.module);
  if (!bar || isNaN(moduleId)) return;
  const { percent, completed, total } = getModuleProgress(moduleId);
  bar.style.width = percent + '%';
  if (text) text.textContent = `${completed} מתוך ${total} שיעורים`;
}

/* --- Lesson Navigation --- */
function showLesson(index) {
  const sections = document.querySelectorAll('.lesson-section');
  const sidebarItems = document.querySelectorAll('.sidebar-lesson');

  sections.forEach((s, i) => {
    s.classList.toggle('active', i === index);
  });

  sidebarItems.forEach((s, i) => {
    s.classList.toggle('active', i === index);
  });

  // Scroll to top of content
  const content = document.querySelector('.module-content');
  if (content) content.scrollTo({ top: 0, behavior: 'smooth' });

  // Update URL hash without scrolling
  history.replaceState(null, '', '#lesson-' + index);
}

function nextLesson() {
  const current = document.querySelector('.lesson-section.active');
  if (!current) return;
  const sections = Array.from(document.querySelectorAll('.lesson-section'));
  const idx = sections.indexOf(current);
  if (idx < sections.length - 1) {
    showLesson(idx + 1);
  }
}

function prevLesson() {
  const current = document.querySelector('.lesson-section.active');
  if (!current) return;
  const sections = Array.from(document.querySelectorAll('.lesson-section'));
  const idx = sections.indexOf(current);
  if (idx > 0) {
    showLesson(idx - 1);
  }
}

function completeAndNext(moduleId, lessonIndex) {
  // Check if this lesson has a quiz that hasn't been passed
  const activeSection = document.querySelector('.lesson-section.active');
  if (activeSection) {
    const quiz = activeSection.querySelector('.quiz-container');
    if (quiz) {
      const result = quiz.querySelector('.quiz-result');
      if (!result || result.style.display !== 'block' || !result.classList.contains('success')) {
        quiz.scrollIntoView({ behavior: 'smooth', block: 'center' });
        quiz.style.outline = '2px solid var(--accent)';
        quiz.style.outlineOffset = '4px';
        setTimeout(() => { quiz.style.outline = ''; quiz.style.outlineOffset = ''; }, 2000);
        return;
      }
    }
  }

  markLessonComplete(moduleId, lessonIndex);
  const module = CourseData.modules.find(m => m.id === moduleId);
  if (!module) return;

  if (lessonIndex < module.lessons.length - 1) {
    // Next lesson in same module
    showLesson(lessonIndex + 1);
  } else if (moduleId < CourseData.modules.length - 1) {
    // Next module
    window.location.href = `module-${moduleId + 1}.html`;
  } else {
    // Course complete — go to certificate
    window.location.href = 'certificate.html';
  }
}

/* --- Mobile Sidebar Toggle --- */
function toggleSidebar() {
  const sidebar = document.querySelector('.module-sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (sidebar) sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('open');
}

/* --- Quiz Logic --- */
function checkQuiz(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  let correct = 0;
  let total = 0;

  form.querySelectorAll('.quiz-question').forEach(q => {
    total++;
    const correctAnswer = q.dataset.correct;
    const selected = q.querySelector('.quiz-option.selected');
    if (!selected) return;

    const answer = selected.dataset.value;
    q.querySelectorAll('.quiz-option').forEach(opt => {
      opt.classList.remove('correct', 'incorrect');
      if (opt.dataset.value === correctAnswer) {
        opt.classList.add('correct');
      } else if (opt.classList.contains('selected') && opt.dataset.value !== correctAnswer) {
        opt.classList.add('incorrect');
      }
    });

    if (answer === correctAnswer) correct++;
  });

  const result = form.querySelector('.quiz-result');
  if (result) {
    result.style.display = 'block';
    result.innerHTML = `<strong>ציון: ${correct}/${total}</strong> ${correct === total ? '— מצוין!' : '— נסו שוב'}`;
    result.className = 'quiz-result ' + (correct === total ? 'success' : 'retry');
  }
}

function selectQuizOption(element) {
  const question = element.closest('.quiz-question');
  question.querySelectorAll('.quiz-option').forEach(opt => {
    opt.classList.remove('selected', 'correct', 'incorrect');
  });
  element.classList.add('selected');
}

/* --- Init --- */
document.addEventListener('DOMContentLoaded', () => {
  updateAllUI();

  // Restore lesson from hash
  const hash = window.location.hash;
  if (hash && hash.startsWith('#lesson-')) {
    const idx = parseInt(hash.replace('#lesson-', ''));
    if (!isNaN(idx)) showLesson(idx);
  }

  // Sidebar click handlers
  document.querySelectorAll('.sidebar-lesson').forEach((item, index) => {
    item.addEventListener('click', () => showLesson(index));
  });

  // Mobile sidebar toggle
  const toggle = document.querySelector('.sidebar-toggle');
  if (toggle) toggle.addEventListener('click', toggleSidebar);

  // Close sidebar + overlay on content click (mobile)
  const content = document.querySelector('.module-content');
  if (content) {
    content.addEventListener('click', () => {
      const sidebar = document.querySelector('.module-sidebar');
      const overlay = document.querySelector('.sidebar-overlay');
      if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
      }
    });
  }

  // Quiz option clicks
  document.querySelectorAll('.quiz-option').forEach(opt => {
    opt.addEventListener('click', () => selectQuizOption(opt));
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowLeft') nextLesson();
    if (e.key === 'ArrowRight') prevLesson();
  });

  // Support bar — inject into module pages
  if (document.body.dataset.module !== undefined) {
    const footer = document.querySelector('.course-footer');
    if (footer) {
      const supportBar = document.createElement('div');
      supportBar.className = 'support-bar';
      supportBar.innerHTML = `
        <span>נתקעתם? אנחנו כאן לעזור:</span>
        <a href="mailto:learni.contact@gmail.com">learni.contact@gmail.com</a>
      `;
      footer.parentNode.insertBefore(supportBar, footer);
    }
  }
});
