/**
 * הגדרות שיווק משותפות — כל דפי הנחיתה טוענים את הקובץ הזה
 *
 * שימוש: הוסיפי לכל דף נחיתה לפני ה-script הראשי:
 * <script src="/ort-presentation-builder/marketing/config.js"></script>
 *
 * ואז בקוד:
 * fetch(MARKETING_CONFIG.CRM_URL, { method: 'POST', body: JSON.stringify({...}) })
 */

var MARKETING_CONFIG = {
  // Apps Script Web App — מקבל לידים ושולח מיילים אוטומטית
  CRM_URL: 'https://script.google.com/macros/s/AKfycbxT00qDSj1NCQgRnAKbktihfoIERvWsuT4cxkTvAeOWPZFWqOCIuZ6uchlCjQEfiZjO/exec',

  // פרטי המותג
  BRAND_NAME: 'מיטל פלג — הדרכות AI למורים',
  SITE_URL: 'https://meytalp-dev.github.io/ort-presentation-builder',
  WHATSAPP: 'https://wa.me/972526857000'
};

/**
 * שליחת ליד ל-CRM
 * @param {Object} lead - { name, email, phone, source, interest, role }
 * @returns {Promise}
 */
function sendLeadToCRM(lead) {
  lead.action = 'newLead';
  lead.source = lead.source || 'website';

  return fetch(MARKETING_CONFIG.CRM_URL, {
    method: 'POST',
    body: JSON.stringify(lead)
  })
  .then(function(r) { return r.json(); })
  .catch(function() {
    // fallback ל-GET אם POST נחסם
    var params = new URLSearchParams(lead);
    return fetch(MARKETING_CONFIG.CRM_URL + '?' + params.toString(), {
      method: 'GET',
      mode: 'no-cors'
    });
  });
}
