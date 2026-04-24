/* ============================================================
   חשבון השנה — receipt renderer
   מסך התוצאה: דירוג ממוין, קבלה מצולמת, שיתוף
   ============================================================ */

function renderReceipt(items) {
  // items מגיעים כבר ממוינים severity יורד
  const topPain = items[0];
  const totalSev = items.reduce((s, x) => s + x.severity, 0);
  const totalHours = totalSev * 3; // severity 1-25 → ~3-75 שעות. משדר "מקבל כאב" לא מדעי

  // HERO
  document.getElementById('top-pain-title').textContent = topPain.title;
  document.getElementById('top-pain-hint').textContent = topPain.hint;

  // RECEIPT
  const shop = document.getElementById('receipt-shop');
  const state = window.__receiptState;
  shop.textContent = state.sector === 'education'
    ? 'חנות המנהל/ת · סניף בית ספר'
    : 'חנות המנהל/ת · סניף ארגון חברתי';

  // מטא של קבלה (תאריך + מס')
  const today = new Date();
  const dateStr = today.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const num = (state.submissionId || '').split('-').pop().toUpperCase();
  document.getElementById('receipt-meta').textContent = `קבלה #${num} · ${dateStr} · תשפ"ז בהכנה`;

  // פריטים
  const itemsEl = document.getElementById('receipt-items');
  itemsEl.innerHTML = '';
  items.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'receipt-row';
    if (idx === 0) row.classList.add('top', 'top-1');
    else if (idx === 1) row.classList.add('top', 'top-2');
    else if (idx === 2) row.classList.add('top', 'top-3');
    const hours = item.severity * 3;
    row.innerHTML = `
      <span class="rank">${idx + 1}.</span>
      <span class="desc">${item.title}</span>
      <span class="price">${hours}<span class="unit">שעות</span></span>
    `;
    itemsEl.appendChild(row);
  });

  // סה"כ
  document.getElementById('receipt-total').textContent = totalHours.toLocaleString('he-IL');

  // ברקוד דמה בתחתית — מייצר "חשבון"
  const barcodeStr = makeBarcode(state.sector, state.submissionId);
  document.getElementById('receipt-barcode').textContent = barcodeStr;
}

function makeBarcode(sector, id) {
  const prefix = sector === 'education' ? 'EDU' : 'SOC';
  const mid = (id || '').replace(/[^a-z0-9]/gi, '').slice(-8).toUpperCase().padEnd(8, 'X');
  return `|||  ${prefix}-5787-${mid}  |||`;
}

function initReceipt() {
  document.getElementById('btn-share-wa').addEventListener('click', shareOnWhatsApp);
  document.getElementById('btn-share-copy').addEventListener('click', copyLink);
  document.getElementById('btn-share-png').addEventListener('click', downloadReceiptPng);
  document.getElementById('btn-restart').addEventListener('click', () => window.location.reload());
}

function openWhatsAppContact() {
  const state = window.__receiptState;
  const items = window.__receiptItems || [];
  const top = items[0];
  const sectorLabel = state.sector === 'education' ? 'בית ספר' : 'ארגון חברתי';
  const msg = `שלום! השלמתי את "חשבון השנה" של שתיים.\n\nאני מנהל/ת ${sectorLabel}.\nהכאב הראשי שלי: ${top ? top.title : ''}\n\nאשמח לשיחה על זה.`;
  const url = 'https://api.whatsapp.com/send?phone=972536256653&text=' + encodeURIComponent(msg);
  window.open(url, '_blank');
}

async function submitLead() {
  const state = window.__receiptState;
  const items = window.__receiptItems || [];
  const top = items[0];
  const btn = document.getElementById('btn-send-lead');
  const status = document.getElementById('lead-status');

  const name = document.getElementById('lead-name').value.trim();
  const phone = document.getElementById('lead-phone').value.trim();
  const email = document.getElementById('lead-email').value.trim();
  const note = document.getElementById('lead-note').value.trim();

  if (!name || !phone) {
    status.textContent = 'שם וטלפון חובה כדי שאוכל לחזור';
    status.className = 'lead-status err';
    return;
  }

  btn.disabled = true;
  const originalText = btn.textContent;
  btn.innerHTML = '<span class="spinner"></span> שולח...';
  status.textContent = '';
  status.className = 'lead-status';

  const payload = {
    action: 'saveLead',
    data: {
      submissionId: state.submissionId || '',
      sector: state.sector || '',
      name, phone, email, note,
      role: state.personal.role || '',
      orgType: state.personal.orgType || '',
      topPainTitle: top ? top.title : '',
      totalSeverity: items.reduce((s, x) => s + x.severity, 0),
      userAgent: navigator.userAgent
    }
  };

  const API = window.__API_URL || (window.CHESHBON_API_URL);
  try {
    await fetch(API, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    document.getElementById('cta-contact').classList.add('submitted');
  } catch (err) {
    btn.disabled = false;
    btn.textContent = originalText;
    status.textContent = 'שגיאה ברשת — נסי שוב או לחצי על וואטסאפ';
    status.className = 'lead-status err';
  }
}

function shareOnWhatsApp() {
  const state = window.__receiptState;
  const items = window.__receiptItems || [];
  const top = items[0];
  const totalHours = items.reduce((s, x) => s + x.severity, 0) * 3;
  const sectorLabel = state.sector === 'education' ? 'בית ספר' : 'ארגון חברתי';

  const msg =
    `עשיתי את "חשבון השנה" של שתיים · מנהל/ת ${sectorLabel}\n\n` +
    `הכאב הראשי שלי: ${top ? top.title : ''}\n` +
    `סה"כ השנה עלתה לי: ${totalHours} שעות שחיקה\n\n` +
    `תעשו גם, 3 דקות:\n` +
    window.location.href.split('?')[0];

  const url = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(msg);
  window.open(url, '_blank');
}

async function copyLink() {
  const link = window.location.href.split('?')[0];
  try {
    await navigator.clipboard.writeText(link);
    flashToast('הקישור הועתק');
  } catch {
    flashToast('לא הצליח להעתיק');
  }
}

function downloadReceiptPng() {
  const btn = document.getElementById('btn-share-png');
  const orig = btn.innerHTML;
  btn.innerHTML = '<span class="spinner"></span> יוצר...';
  btn.disabled = true;

  // טען html2canvas דינמית רק כשצריך
  ensureHtml2Canvas().then(() => {
    document.body.classList.add('capture-mode');
    const node = document.getElementById('receipt-capture');
    html2canvas(node, {
      backgroundColor: '#FAF8F5',
      scale: 2,
      useCORS: true,
      logging: false
    }).then(canvas => {
      document.body.classList.remove('capture-mode');
      canvas.toBlob(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'cheshbon-hasana.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        btn.innerHTML = orig;
        btn.disabled = false;
        flashToast('הקבלה הורדה');
      }, 'image/png');
    }).catch(err => {
      document.body.classList.remove('capture-mode');
      console.error(err);
      btn.innerHTML = orig;
      btn.disabled = false;
      flashToast('שגיאה ביצירה');
    });
  }).catch(() => {
    btn.innerHTML = orig;
    btn.disabled = false;
    flashToast('לא הצליח לטעון');
  });
}

function ensureHtml2Canvas() {
  if (window.html2canvas) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function flashToast(text) {
  let t = document.getElementById('__toast');
  if (!t) {
    t = document.createElement('div');
    t.id = '__toast';
    t.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#2D2B3A;color:#fff;padding:12px 22px;border-radius:999px;font-family:Heebo,sans-serif;font-size:14px;font-weight:500;z-index:9999;opacity:0;transition:opacity .25s;pointer-events:none;box-shadow:0 8px 24px rgba(0,0,0,0.2);';
    document.body.appendChild(t);
  }
  t.textContent = text;
  t.style.opacity = '1';
  clearTimeout(t.__timer);
  t.__timer = setTimeout(() => { t.style.opacity = '0'; }, 1800);
}

window.initReceipt = initReceipt;
window.renderReceipt = renderReceipt;
