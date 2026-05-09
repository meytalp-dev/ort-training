/**
 * ImpactOS Tnufa English — Configuration
 *
 * הגדרות מערכת. עדכן את API_URL אחרי deploy של Apps Script.
 */

const CONFIG = {
  // Apps Script Web App URL
  API_URL: 'https://script.google.com/macros/s/AKfycbx3myXebZIbXes6vK17K90R-rjh5FqAXHhXjsoVzwT7wNfcu_w6ZXBoDHB6pX9MFcj47w/exec',

  // Brand
  APP_NAME: 'ImpactOS Tnufa English',
  APP_VERSION: '0.1.0-mvp',

  // Storage keys
  STORAGE_KEYS: {
    USER: 'impactos_user',
    TOKEN: 'impactos_token',
    PROFILE: 'impactos_profile',
  },

  // Feature flags
  FEATURES: {
    speaking_practice: false,  // V1
    mock_exam: false,          // V1
    parent_dashboard: false,   // V1
  },

  // Pedagogical settings
  PEDAGOGY: {
    daily_session_minutes: 18,
    chunks_per_week: 12,
    max_mock_exams: 2,
    spaced_retrieval_intervals: [1, 3, 7, 30],  // ימים
  },
};

// Freeze to prevent accidental modification
Object.freeze(CONFIG);
Object.freeze(CONFIG.STORAGE_KEYS);
Object.freeze(CONFIG.FEATURES);
Object.freeze(CONFIG.PEDAGOGY);
