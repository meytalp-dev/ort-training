/**
 * ImpactOS Tnufa English — API helper
 *
 * Wrapper נוח ל-fetch מול Apps Script.
 * מטפל ב-auth, error handling, ו-loading states.
 */

const API = {

  /**
   * Generic call to Apps Script
   */
  async call(action, payload = {}) {
    const user = Auth.getCurrentUser();
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);

    const body = {
      action,
      ...payload,
    };

    // Add auth if user logged in
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
      // Network error
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

  // ===== Sessions =====

  async startSession() {
    const result = await this.call('startSession');
    return result.sessionId;
  },

  async endSession(sessionId, stats) {
    return await this.call('endSession', {
      sessionId,
      activitiesCompleted: stats.activitiesCompleted || 0,
      timeOnTaskSeconds: stats.timeOnTaskSeconds || 0,
    });
  },

  async logActivity(activity) {
    return await this.call('logActivity', activity);
  },

  async getProgress() {
    const result = await this.call('getProgress');
    return result.progress;
  },

  // ===== AI =====

  async aiFeedback(taskType, studentText, context) {
    const result = await this.call('aiFeedback', {
      taskType,
      studentText,
      context,
    });
    return result.feedback;
  },

  async aiGenerateText({ cefrLevel, topic, length, textType }) {
    const result = await this.call('aiGenerateText', {
      cefrLevel,
      topic,
      length,
      textType,
    });
    return result.text;
  },

  // ===== Teacher dashboard =====

  async getClassRoster() {
    const result = await this.call('getClassRoster');
    return { classId: result.classId, students: result.students };
  },

  async getClassStats() {
    const result = await this.call('getClassStats');
    return {
      classId: result.classId,
      studentCount: result.studentCount,
      diagnosticsCompleted: result.diagnosticsCompleted,
      heatmap: result.heatmap,
      cefrDistribution: result.cefrDistribution,
    };
  },

  async getStudentDetail(studentId) {
    const result = await this.call('getStudentDetail', { studentId });
    return {
      student: result.student,
      sessions: result.sessions,
      breakdown: result.breakdown,
      recentActivities: result.recentActivities,
    };
  },

  // ===== Connectivity check =====

  async ping() {
    return await this.call('ping');
  },

};

/**
 * Helper to require auth — redirect to login if not authenticated
 */
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

/**
 * Helper for showing errors nicely
 */
function showError(message) {
  // TODO: replace with nicer toast UI
  alert('⚠ ' + message);
}

/**
 * Helper for showing success
 */
function showSuccess(message) {
  // TODO: replace with nicer toast UI
  console.log('✓ ' + message);
}
