/**
 * Generates the HTML for a floating toolbar injected into product HTML templates.
 * Includes: Download as PNG, Copy HTML, Print, and Close/Back buttons.
 * Uses html2canvas from CDN for screenshot capture.
 */
export function getToolbarHTML(targetSelector: string, fileName: string, accentColor: string): string {
  return `
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"><\/script>
<style>
.toolbar { position: fixed; top: 0; left: 0; right: 0; background: rgba(30,30,30,0.92); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; gap: 12px; padding: 10px 20px; z-index: 9999; direction: rtl; box-shadow: 0 2px 20px rgba(0,0,0,.3); }
.toolbar button { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; border: none; border-radius: 8px; font-family: 'Heebo', sans-serif; font-size: 14px; cursor: pointer; transition: all 0.2s; font-weight: 600; }
.toolbar button:hover { transform: translateY(-1px); }
.toolbar .btn-primary { background: ${accentColor}; color: white; }
.toolbar .btn-primary:hover { filter: brightness(1.1); }
.toolbar .btn-secondary { background: rgba(255,255,255,0.15); color: white; }
.toolbar .btn-secondary:hover { background: rgba(255,255,255,0.25); }
.toolbar .btn-close { background: rgba(255,255,255,0.1); color: #ccc; padding: 8px 14px; }
.toolbar .btn-close:hover { background: rgba(255,0,0,0.2); color: white; }
.toolbar .divider { width: 1px; height: 24px; background: rgba(255,255,255,0.15); }
.toolbar .status { color: #aaa; font-size: 12px; font-family: 'Heebo', sans-serif; }
.toolbar .tip { color: rgba(255,255,255,0.5); font-size: 11px; font-family: 'Heebo', sans-serif; }
@media print { .toolbar { display: none !important; } }
body { padding-top: 52px; }
</style>
<div class="toolbar">
  <button class="btn-primary" onclick="downloadPNG()">📥 הורד כתמונה</button>
  <button class="btn-secondary" onclick="copyHTML()">📋 העתק HTML</button>
  <button class="btn-secondary" onclick="window.print()">🖨️ הדפס / PDF</button>
  <div class="divider"></div>
  <span class="tip">לחצו על כל טקסט כדי לערוך</span>
  <div class="divider"></div>
  <button class="btn-close" onclick="window.close()">✕ סגור</button>
  <span class="status" id="dlStatus"></span>
</div>
<script>
async function downloadPNG() {
  var status = document.getElementById('dlStatus');
  status.textContent = 'מכין תמונה...';
  try {
    var el = document.querySelector('${targetSelector}');
    var canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: null });
    var link = document.createElement('a');
    link.download = '${fileName}.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    status.textContent = '✓ הורד בהצלחה!';
    setTimeout(function() { status.textContent = ''; }, 3000);
  } catch(e) {
    status.textContent = '✗ שגיאה: ' + e.message;
    setTimeout(function() { status.textContent = ''; }, 5000);
  }
}
function copyHTML() {
  var status = document.getElementById('dlStatus');
  var el = document.querySelector('${targetSelector}');
  var html = el.outerHTML;
  navigator.clipboard.writeText(html).then(function() {
    status.textContent = '✓ HTML הועתק!';
    setTimeout(function() { status.textContent = ''; }, 3000);
  }).catch(function() {
    status.textContent = '✗ לא הצלחתי להעתיק';
    setTimeout(function() { status.textContent = ''; }, 3000);
  });
}
<\/script>`;
}
