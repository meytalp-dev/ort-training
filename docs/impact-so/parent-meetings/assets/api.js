// Parent-Meetings API client.
// Two modes:
//  1) DEMO  — localStorage in the browser (default until Apps Script is deployed).
//  2) LIVE  — real backend via Apps Script Web App, set window.PARENT_MEETINGS_API_URL.

function isLive(){ return !!(window.PARENT_MEETINGS_API_URL && window.PARENT_MEETINGS_API_URL.trim()); }

async function apiLive(action, payload = {}) {
  const url = window.PARENT_MEETINGS_API_URL + (window.PARENT_MEETINGS_API_URL.includes('?') ? '&' : '?') + 'action=' + encodeURIComponent(action);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoid CORS preflight
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('שגיאת רשת: ' + res.status);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'שגיאה לא ידועה');
  return data.result;
}

// === DEMO mode (localStorage) ===
const STORE_KEY = 'pm_events_v1';
function loadStore(){ try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch(e){ return {}; } }
function saveStore(s){ localStorage.setItem(STORE_KEY, JSON.stringify(s)); }

const ApiDemo = {
  createEvent(data){
    const eventId = genId('evt');
    const token = genId('tok');
    const store = loadStore();
    store[eventId] = {
      eventId, token,
      title: data.title,
      teacherName: data.teacherName || '',
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      slotMinutes: data.slotMinutes,
      reminderHour: data.reminderHour || '18:00',
      students: (data.students || []).map(s => ({...s})),
      bookings: [], // {studentName, slot, parentName, parentEmail, parentPhone, bookedAt}
      createdAt: new Date().toISOString(),
    };
    saveStore(store);
    return { eventId, token };
  },
  getEvent({ eventId }){
    const store = loadStore();
    const e = store[eventId];
    if(!e) throw new Error('האירוע לא נמצא');
    // Public-safe view: no token, no parent contacts of others
    return {
      eventId: e.eventId, title: e.title, teacherName: e.teacherName,
      date: e.date, startTime: e.startTime, endTime: e.endTime,
      slotMinutes: e.slotMinutes,
      students: e.students.map(s => ({ name: s.name })),
      taken: e.bookings.map(b => ({ slot: b.slot, studentName: b.studentName })),
    };
  },
  bookSlot(b){
    const store = loadStore();
    const e = store[b.eventId];
    if(!e) throw new Error('האירוע לא נמצא');
    if(e.bookings.some(x => x.slot === b.slot)) throw new Error('השעה הזו כבר תפוסה');
    if(e.bookings.some(x => x.studentName === b.studentName)) throw new Error('כבר נרשמה פגישה לתלמיד הזה');
    e.bookings.push({
      studentName: b.studentName,
      slot: b.slot,
      parentName: b.parentName || '',
      parentEmail: b.parentEmail || '',
      parentPhone: b.parentPhone || '',
      bookedAt: new Date().toISOString(),
      reminderSent: false,
    });
    saveStore(store);
    return { ok: true };
  },
  getBookings({ eventId, token }){
    const store = loadStore();
    const e = store[eventId];
    if(!e) throw new Error('האירוע לא נמצא');
    if(e.token !== token) throw new Error('אין הרשאה');
    return {
      eventId: e.eventId, title: e.title, teacherName: e.teacherName,
      date: e.date, startTime: e.startTime, endTime: e.endTime,
      slotMinutes: e.slotMinutes, reminderHour: e.reminderHour,
      students: e.students,
      bookings: e.bookings,
      token: e.token,
    };
  },
  cancelBooking({ eventId, token, slot }){
    const store = loadStore();
    const e = store[eventId];
    if(!e) throw new Error('האירוע לא נמצא');
    if(e.token !== token) throw new Error('אין הרשאה');
    const i = e.bookings.findIndex(x => x.slot === slot);
    if(i >= 0) e.bookings.splice(i, 1);
    saveStore(store);
    return { ok: true };
  },
  voiceBook(){
    throw new Error('הקלטה קולית לא זמינה במצב דמו. צריך להפעיל את ה-Apps Script.');
  },
  getMyBooking(){
    throw new Error('עריכת הזמנה לא זמינה במצב דמו.');
  },
  cancelMyBooking(){
    throw new Error('עריכת הזמנה לא זמינה במצב דמו.');
  },
};

async function api(action, payload){
  if(isLive()) return apiLive(action, payload);
  return ApiDemo[action](payload || {});
}

const ParentMeetings = {
  createEvent:     (data) => api('createEvent', data),
  getEvent:        (eventId) => api('getEvent', { eventId }),
  bookSlot:        (booking) => api('bookSlot', booking),
  voiceBook:       (data) => api('voiceBook', data),
  getBookings:     (eventId, token) => api('getBookings', { eventId, token }),
  cancelBooking:   (data) => api('cancelBooking', data),
  getMyBooking:    (data) => api('getMyBooking', data),
  cancelMyBooking: (data) => api('cancelMyBooking', data),
  isLive,
};
window.ParentMeetings = ParentMeetings;

// === Helpers ===
function genId(prefix='id'){
  return prefix + '_' + Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(-3);
}
function timeToMin(t){ const [h,m] = t.split(':').map(Number); return h*60 + m; }
function minToTime(m){ const h=Math.floor(m/60), mm=m%60; return String(h).padStart(2,'0')+':'+String(mm).padStart(2,'0'); }
function buildSlots(startTime, endTime, slotMinutes){
  const s=timeToMin(startTime), e=timeToMin(endTime), step=Number(slotMinutes)||10;
  const out=[]; for(let t=s; t+step<=e; t+=step) out.push(minToTime(t));
  return out;
}
function formatDateHe(iso){
  if(!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  const days=['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
  const months=['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
  return `יום ${days[d.getDay()]}, ${d.getDate()} ב${months[d.getMonth()]} ${d.getFullYear()}`;
}
function escapeHtml(s){
  return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

window.PMHelpers = { genId, timeToMin, minToTime, buildSlots, formatDateHe, escapeHtml };
