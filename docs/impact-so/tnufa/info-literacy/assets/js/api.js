/**
 * ImpactOS אוריינות מידע — API helper
 *
 * Wrapper נוח ל-fetch מול Apps Script.
 * מטפל ב-auth, error handling, ו-loading states.
 */

const API = {

  async call(action, payload = {}) {
    const user = Auth.getCurrentUser();
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);

    const body = { action, ...payload };

    if (user && token) {
      body.userId = user.userId;
      body.token = token;
    }

    try {
      const response = await fetch(CONFIG.API_URL, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'שגיאה בשרת');
      }

      return result;
    } catch (error) {
      if (error.message === 'Failed to fetch') {
        throw new Error('אין חיבור לשרת. בדק.י את החיבור לאינטרנט');
      }
      throw error;
    }
  },

  // ===== Profile =====

  async getProfile() {
    const result = await this.call('getProfile');
    return result.profile;
  },

  async saveProfile(updates) {
    return await this.call('saveProfile', updates);
  },

  // ===== Diagnostic =====

  async submitDiagnostic(payload) {
    return await this.call('submitDiagnostic', payload);
  },

  // ===== Portfolio =====

  async addPortfolioItem(item) {
    return await this.call('addPortfolioItem', item);
  },

  async getPortfolio() {
    const result = await this.call('getPortfolio');
    return result.items || [];
  },

  // ===== AI Log =====

  async logAIUse(entry) {
    return await this.call('logAIUse', entry);
  },

  async getAILog() {
    const result = await this.call('getAILog');
    return result.entries || [];
  },

  // ===== Sessions =====

  async logActivity(activity) {
    return await this.call('logActivity', activity);
  },

  async getProgress() {
    const result = await this.call('getProgress');
    return result.progress;
  },

  // ===== Teacher =====

  async getClassRoster() {
    const result = await this.call('getClassRoster');
    return result.students || [];
  },

  async getClassHeatmap() {
    const result = await this.call('getClassHeatmap');
    return result.heatmap || {};
  },

  // ===== AI =====

  async aiFeedback(taskType, studentText, context) {
    const result = await this.call('aiFeedback', { taskType, studentText, context });
    return result.feedback;
  },

  async ping() {
    return await this.call('ping');
  },

};

function requireAuth(allowedRoles = null) {
  const user = Auth.getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return null;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    alert('אין לך הרשאה לדף הזה');
    Auth.redirectToDashboard(user.role);
    return null;
  }
  return user;
}

function showError(message) {
  alert('⚠ ' + message);
}

function showSuccess(message) {
  console.log('✓ ' + message);
}

// Helper: דמו mode — מאפשר בדיקה בלי backend
function isDemoMode() {
  return !CONFIG.API_URL || CONFIG.API_URL.includes('REPLACE_AFTER_DEPLOY');
}
