// ImpactOS ↔ SmartSchool — Background service worker
// משמש כ-message broker בין popup לבין content scripts.

chrome.runtime.onInstalled.addListener(() => {
  console.log('ImpactOS ↔ SmartSchool installed.');
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'IMPACTOS_GRADES_AVAILABLE') {
    // ⚠️ TODO: Phase 2 — לקבל ציונים ישירות מ-ImpactOS דרך postMessage או fetch
    sendResponse({ ok: true, received: msg.count });
  }
  return true;
});
