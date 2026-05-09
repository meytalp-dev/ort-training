/**
 * ImpactOS אוריינות מידע — Auth
 *
 * Login + Register + Session management.
 * משתמש ב-Apps Script + Google Sheets כ-backend.
 */

const Auth = {

  async login(email, password) {
    if (!email || !password) {
      throw new Error('יש להזין אימייל וסיסמה');
    }

    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'login',
        email: email.trim().toLowerCase(),
        password: password,
      }),
    });

    const result = await response.json();

    if (!result.ok) {
      throw new Error(result.error || 'כניסה נכשלה');
    }

    localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(result.user));
    localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, result.token);

    return result.user;
  },

  async register({ name, email, password, role }) {
    if (!name || !email || !password || !role) {
      throw new Error('יש למלא את כל השדות');
    }

    if (password.length < 6) {
      throw new Error('סיסמה חייבת להיות לפחות 6 תווים');
    }

    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'register',
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        role: role,  // 'student' | 'teacher'
      }),
    });

    const result = await response.json();

    if (!result.ok) {
      throw new Error(result.error || 'הרשמה נכשלה');
    }

    localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(result.user));
    localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, result.token);

    return result.user;
  },

  getCurrentUser() {
    try {
      const data = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  logout() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.PROFILE);
    window.location.href = 'index.html';
  },

  redirectToDashboard(role) {
    const dashboards = {
      student: 'student.html',
      teacher: 'teacher.html',
    };
    const target = dashboards[role] || 'student.html';
    window.location.href = target;
  },

};

// Form handlers (called from index.html)

async function handleLogin(event) {
  event.preventDefault();
  const form = event.target;
  const email = form.querySelector('input[type="email"]').value;
  const password = form.querySelector('input[type="password"]').value;

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'מתחבר.ת...';

  try {
    const user = await Auth.login(email, password);
    Auth.redirectToDashboard(user.role);
  } catch (error) {
    alert(error.message);
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const form = event.target;
  const name = form.querySelector('input[type="text"]').value;
  const email = form.querySelector('input[type="email"]').value;
  const password = form.querySelector('input[type="password"]').value;
  const role = window.selectedRole || 'student';

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'יוצר.ת חשבון...';

  try {
    const user = await Auth.register({ name, email, password, role });
    Auth.redirectToDashboard(user.role);
  } catch (error) {
    alert(error.message);
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}
