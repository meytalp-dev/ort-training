// Supabase configuration for Impact SO Lashon
// Publishable key — safe to expose in browser. RLS protects all tables.

const SUPABASE_URL = 'https://vwtcznwkdvnjkvjkooyk.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_S25_kaFNDKkMKt1Zd6mnKg_75uBnTEe';

// Lazy-loaded Supabase client. Auto-imports library from CDN.
let _client = null;

async function getSupabase() {
  if (_client) return _client;
  if (!window.supabase) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  _client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
  return _client;
}

// Auth helpers
async function getCurrentUser() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

async function getCurrentTeacher() {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('teachers')
    .select('*, schools(*)')
    .eq('user_id', user.id)
    .single();
  if (error) return null;
  return data;
}

async function requireAuth(redirectTo = 'auth/login.html') {
  const user = await getCurrentUser();
  if (!user) {
    // Resolve redirect path relative to current page
    const path = window.location.pathname;
    const inSubdir = path.includes('/teacher/') || path.includes('/auth/') || path.includes('/student/');
    const prefix = inSubdir ? '../' : '';
    window.location.href = prefix + redirectTo;
    return null;
  }
  return user;
}

async function logout() {
  const supabase = await getSupabase();
  await supabase.auth.signOut();
  const path = window.location.pathname;
  const inSubdir = path.includes('/teacher/') || path.includes('/auth/') || path.includes('/student/');
  const prefix = inSubdir ? '../' : '';
  window.location.href = prefix + 'index.html';
}

// Expose globally
window.ImpactAuth = {
  getSupabase,
  getCurrentUser,
  getCurrentTeacher,
  requireAuth,
  logout,
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
};
