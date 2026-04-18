/**
 * שתיים — מחולל תוכן חכם v2
 * שלב 3: מחקר קרן אוטומטי
 * שלב 5: כתיבת הגשה מפורטת עם כל נתוני העמותה
 * שלב 6: צ'קליסט מסמכים חכם
 */

const APPS_SCRIPT = 'https://script.google.com/macros/s/AKfycbzl7LLZIXFtFBXN8b3K0VBXZMoPzAYwokbPgdVU-WLVHr20i_Pbng9Sb94X8FOkY89m/exec';

// Safe Sheet save — uses image beacon to avoid CORS (fire-and-forget)
function saveToSheetSafe(action, data) {
    const payload = encodeURIComponent(JSON.stringify({ action, ...data }));
    const img = new Image();
    img.src = APPS_SCRIPT + '?callback=img&payload=' + payload;
    // Also save to localStorage as backup
    const key = 'sheet-pending-' + Date.now();
    localStorage.setItem(key, JSON.stringify({ action, ...data }));
}

let _waitAttempts = 0;
function waitForOrg(cb) {
    if (window.ORG) return cb(window.ORG);
    if (++_waitAttempts > 50) { console.error('Timeout: ORG data not loaded'); return; }
    setTimeout(() => waitForOrg(cb), 200);
}

waitForOrg(function(D) {
    enhanceAiAnalysis(D);
    enhanceContentGenerator(D);
    enhanceFundsResearch(D);
    enhanceDocumentsChecklist(D);
});

// ══════════════════════════════════════════
//  שלב 3 — מחקר קרן אוטומטי
// ══════════════════════════════════════════

function enhanceFundsResearch(D) {
    const fundsTable = document.getElementById('fundsTable');
    if (!fundsTable) return;

    // Add "חקור" column header
    const headerRow = fundsTable.querySelector('thead tr');
    if (headerRow) {
        const th = document.createElement('th');
        th.textContent = 'פעולות';
        headerRow.appendChild(th);
    }

    // Add research button to each fund row
    const rows = fundsTable.querySelectorAll('tbody tr');
    rows.forEach((row, i) => {
        const fund = D.funds[i];
        if (!fund) return;
        const td = document.createElement('td');
        td.innerHTML = `<button class="btn btn-sm btn-outline" onclick="window._researchFund(${i})">חקור</button>`;
        row.appendChild(td);
    });

    // Fund research panel (hidden by default)
    const fundsPage = document.getElementById('page-funds');
    if (fundsPage) {
        const researchPanel = document.createElement('div');
        researchPanel.id = 'fundResearchPanel';
        researchPanel.className = 'panel';
        researchPanel.style.display = 'none';
        fundsPage.appendChild(researchPanel);
    }

    window._researchFund = function(idx) {
        const fund = D.funds[idx];
        if (!fund) return;

        const panel = document.getElementById('fundResearchPanel');
        if (!panel) return;
        panel.style.display = '';

        // Build research card with known info + search links
        const searchQuery = encodeURIComponent(`${fund.name} קול קורא מענקים ${new Date().getFullYear()}`);
        const searchQueryEn = encodeURIComponent(`"${fund.name}" grants Israel`);
        const guidestarQuery = encodeURIComponent(fund.name);

        panel.innerHTML = `
            <div class="panel-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--plum)" stroke-width="1.5"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
                <div class="panel-title">מחקר: ${fund.name}</div>
                <button class="btn btn-sm btn-ghost" onclick="document.getElementById('fundResearchPanel').style.display='none'">סגור</button>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
                <div style="padding:14px;background:var(--sand);border-radius:10px;">
                    <div style="font-size:11px;color:var(--gray);margin-bottom:4px;">תחום</div>
                    <div style="font-size:14px;font-weight:600;">${fund.field || 'לא ידוע'}</div>
                </div>
                <div style="padding:14px;background:var(--sand);border-radius:10px;">
                    <div style="font-size:11px;color:var(--gray);margin-bottom:4px;">סכום מקסימלי</div>
                    <div style="font-size:14px;font-weight:600;">${fund.maxAmount || 'לא ידוע'}</div>
                </div>
                <div style="padding:14px;background:var(--sand);border-radius:10px;">
                    <div style="font-size:11px;color:var(--gray);margin-bottom:4px;">תדירות</div>
                    <div style="font-size:14px;font-weight:600;">${fund.frequency || 'לא ידוע'}</div>
                </div>
                <div style="padding:14px;background:var(--sand);border-radius:10px;">
                    <div style="font-size:11px;color:var(--gray);margin-bottom:4px;">סוג</div>
                    <div style="font-size:14px;font-weight:600;">${fund.type || 'לא ידוע'}</div>
                </div>
            </div>

            <div style="padding:14px;background:var(--mint-light);border-radius:10px;margin-bottom:16px;">
                <div style="font-size:12px;font-weight:600;color:var(--mint);margin-bottom:4px;">התאמה לפרופיל העמותה</div>
                <div style="font-size:24px;font-weight:800;color:var(--mint);">${fund.match}%</div>
            </div>

            ${fund.notes ? `<div style="padding:14px;background:var(--gold-light);border-radius:10px;margin-bottom:16px;">
                <div style="font-size:12px;font-weight:600;color:var(--gold);margin-bottom:4px;">הערות</div>
                <div style="font-size:13px;">${fund.notes}</div>
            </div>` : ''}

            <div style="font-size:13px;font-weight:600;margin-bottom:10px;">חקרו את הקרן:</div>
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">
                <a href="https://www.google.com/search?q=${searchQuery}" target="_blank" class="btn btn-sm btn-outline">חיפוש Google</a>
                <a href="https://www.google.com/search?q=${searchQueryEn}" target="_blank" class="btn btn-sm btn-outline">Search English</a>
                <a href="https://www.guidestar.org.il/search?q=${guidestarQuery}" target="_blank" class="btn btn-sm btn-outline">GuideStar</a>
                ${fund.website ? `<a href="https://${fund.website}" target="_blank" class="btn btn-sm btn-primary">אתר הקרן</a>` : ''}
            </div>

            <div style="font-size:13px;font-weight:600;margin-bottom:8px;">שאלות מפתח למחקר:</div>
            <ul style="font-size:12px;color:var(--gray);list-style:disc;padding-right:20px;line-height:2;">
                <li>למי הקרן תרמה בעבר? באילו סכומים?</li>
                <li>מה התחומים שמעניינים אותה (חינוך, רווחה, טכנולוגיה)?</li>
                <li>האם יש העדפה לאזור גאוגרפי (פריפריה/מרכז)?</li>
                <li>מה השפה והערכים שהקרן מקדמת?</li>
                <li>האם יש קשר קיים עם העמותה או גופים דומים?</li>
            </ul>

            <div class="form-group" style="margin-top:16px;">
                <label class="form-label">ממצאי המחקר (שמרו כאן):</label>
                <textarea class="ai-text" id="fundResearchNotes" style="min-height:100px;" placeholder="רשמו כאן את מה שמצאתם על הקרן...">${fund.notes || ''}</textarea>
                <button class="btn btn-sm btn-primary" style="margin-top:8px;" onclick="window._saveFundNotes(${idx})">שמור הערות</button>
            </div>`;

        panel.scrollIntoView({ behavior: 'smooth' });
    };

    window._saveFundNotes = function(idx) {
        const notes = document.getElementById('fundResearchNotes').value;
        const fund = D.funds[idx];
        if (!fund) return;

        // Save to Sheet
        saveToSheetSafe('saveFundNotes', { fundName: fund.name, notes: notes });

        // Visual feedback
        const btn = document.querySelector('#fundResearchPanel .btn-primary:last-child');
        if (btn) {
            const orig = btn.innerHTML;
            btn.innerHTML = 'נשמר!';
            btn.style.background = 'var(--mint)';
            setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; }, 2000);
        }
    };
}

// ══════════════════════════════════════════
//  שלב 4+5 — ניתוח קול קורא + כתיבת הגשה
// ══════════════════════════════════════════

function enhanceAiAnalysis(D) {
    const tabsEl = document.getElementById('aiInputTabs');
    if (!tabsEl) return;

    const openCalls = D.calls.filter(c => c.status === 'open' || c.status === 'pending');
    if (!openCalls.length) return;

    const options = openCalls.map((c, i) =>
        `<option value="${i}">${c.match}% | ${c.name} (${c.source})${c.deadline && !['פתוח','לא ברור','משתנה'].includes(c.deadline) ? ' \u2014 ' + c.deadline : ''}</option>`
    ).join('');

    tabsEl.insertAdjacentHTML('beforebegin', `
        <div style="margin-bottom:16px;padding:16px;background:var(--plum-light);border-radius:12px;">
            <label style="font-size:12px;font-weight:600;color:var(--plum);display:block;margin-bottom:8px;">
                בחרו קול קורא לניתוח (${openCalls.length} פתוחים)
            </label>
            <select id="callSelector" class="form-input" style="font-size:14px;">
                <option value="">— בחרו קול קורא או הדביקו טקסט ידנית —</option>
                ${options}
            </select>
        </div>`);

    document.getElementById('callSelector').addEventListener('change', function() {
        if (this.value === '') return;
        const call = openCalls[parseInt(this.value)];
        const org = D.org;

        // Find matching fund info
        const fund = D.funds.find(f => call.source.includes(f.name) || f.name.includes(call.source));

        const textarea = document.getElementById('aiTextArea');
        if (textarea) {
            textarea.value = [
                `=== קול קורא ===`,
                `שם: ${call.name}`,
                `מקור: ${call.source}`,
                `דדליין: ${call.deadline || 'לא ידוע'}`,
                `סכום: ${call.amount || 'לא פורסם'}`,
                `תנאי סף: ${call.eligibility || 'לא פורטו'}`,
                call.link ? `לינק: ${call.link}` : '',
                call.notes ? `הערות: ${call.notes}` : '',
                '',
                `=== פרופיל העמותה ===`,
                `שם: ${org.name}`,
                `תחומים: ${org.fields}`,
                `אזור: ${org.area}`,
                `פועלת מ-: ${org.since || 2015}`,
                `תיאור: ${org.description}`,
                '',
                fund ? `=== מידע על הקרן ===` : '',
                fund ? `סכום מקסימלי: ${fund.maxAmount}` : '',
                fund ? `תדירות: ${fund.frequency}` : '',
                fund ? `סוג: ${fund.type}` : '',
                fund && fund.notes ? `הערות: ${fund.notes}` : '',
            ].filter(Boolean).join('\n');
        }

        const textTab = document.querySelector('#aiInputTabs .ai-tab');
        if (textTab) textTab.click();
    });
}

function enhanceContentGenerator(D) {
    const promptTextarea = document.getElementById('contentPrompt');
    if (!promptTextarea) return;

    const org = D.org;
    const beneficiaries = D.projects
        ? D.projects.reduce((s, p) => s + (p.beneficiaries || 0), 0)
        : 750;
    const projectList = D.projects
        ? D.projects.filter(p => p.status === 'open' || p.status === 'approved')
        : [];
    const projectNames = projectList.map(p => p.name).join(', ');
    const totalBudgetReq = D.budget ? D.budget.requested : '0';
    const cities = (org.area || '').split(',').map(c => c.trim());

    // Quick-fill with call selector
    const openCalls = D.calls.filter(c => c.status === 'open');
    const callOptions = openCalls.map((c, i) =>
        `<option value="${i}">${c.name} (${c.source})</option>`
    ).join('');

    promptTextarea.insertAdjacentHTML('beforebegin', `
        <div style="margin-bottom:12px;padding:14px;background:var(--plum-light);border-radius:10px;">
            <label style="font-size:11px;font-weight:600;color:var(--plum);display:block;margin-bottom:6px;">כתיבת הגשה לקול קורא ספציפי:</label>
            <select id="contentCallSelector" class="form-input" style="font-size:13px;margin-bottom:8px;">
                <option value="">— בחרו קול קורא (אופציונלי) —</option>
                ${callOptions}
            </select>
            <div style="display:flex;flex-wrap:wrap;gap:6px;">
                <span style="font-size:11px;color:var(--gray);align-self:center;">מילוי מהיר:</span>
                <button type="button" class="btn btn-sm btn-ghost" data-qf="proposal">הצעת פרויקט</button>
                <button type="button" class="btn btn-sm btn-ghost" data-qf="impact">דוח אימפקט</button>
                <button type="button" class="btn btn-sm btn-ghost" data-qf="letter">מכתב פנייה</button>
                <button type="button" class="btn btn-sm btn-ghost" data-qf="budget">נימוק תקציב</button>
                <button type="button" class="btn btn-sm btn-ghost" data-qf="thankyou">מכתב תודה</button>
            </div>
        </div>`);

    // Build detailed templates using ALL org data
    function getCallContext() {
        const sel = document.getElementById('contentCallSelector');
        if (sel && sel.value !== '') {
            return openCalls[parseInt(sel.value)];
        }
        return null;
    }

    const detailedTemplates = {
        proposal: () => {
            const call = getCallContext();
            const fund = call ? D.funds.find(f => call.source.includes(f.name) || f.name.includes(call.source)) : null;
            return [
                `הצעת פרויקט${call ? ' ל' + call.source : ''}`,
                ``,
                `=== הצגת העמותה ===`,
                `${org.name} פועלת מ-${org.since || 2015} ב${cities.join(', ')}.`,
                `אנחנו מפעילים תוכניות ב${org.fields}.`,
                `${beneficiaries} מוטבים ישירים, שביעות רצון 92%.`,
                ``,
                `=== הצורך ===`,
                `${cities.join(' ו')} — אזורי הפעילות של העמותה.`,
                `נוער בסיכון חסר גישה לחינוך טכנולוגי ומיומנויות חיים.`,
                ``,
                `=== הפתרון המוצע ===`,
                projectList.length ? `פרויקטים פעילים: ${projectList.map(p => `${p.name} (${p.beneficiaries} מוטבים)`).join(', ')}` : '',
                ``,
                `=== תקציב ===`,
                `תקציב מבוקש: ${totalBudgetReq}`,
                D.budget && D.budget.items ? D.budget.items.map(b => `  ${b.project}: ${b.requested}`).join('\n') : '',
                ``,
                call ? `=== פרטי הקול קורא ===` : '',
                call ? `שם: ${call.name}` : '',
                call ? `דדליין: ${call.deadline || 'לא ידוע'}` : '',
                call ? `סכום: ${call.amount || 'לא פורסם'}` : '',
                call ? `תנאי סף: ${call.eligibility || 'לא פורטו'}` : '',
            ].filter(Boolean).join('\n');
        },
        impact: () => [
            `דוח אימפקט שנתי — ${org.name}`,
            ``,
            `=== סיכום מנהלים ===`,
            `${org.name} פעלה השנה ב${cities.join(', ')} עם ${beneficiaries} מוטבים ישירים.`,
            `שביעות רצון: 92%.`,
            ``,
            `=== פרויקטים ותוצאות ===`,
            ...projectList.map(p => `${p.name}: ${p.beneficiaries} מוטבים, ${p.progress}% מהיעד התקציבי`),
            ``,
            `=== מדדים עיקריים ===`,
            `מוטבים ישירים: ${beneficiaries}`,
            `ערים: ${cities.length}`,
            `פרויקטים פעילים: ${projectList.length}`,
            `שביעות רצון: 92%`,
            ``,
            `=== תקציב ===`,
            `מבוקש: ${totalBudgetReq}`,
            `מאושר: ${D.budget ? D.budget.approved : '0'}`,
        ].filter(Boolean).join('\n'),
        letter: () => {
            const call = getCallContext();
            return [
                `מכתב פנייה${call ? ' ל' + call.source : ''}`,
                ``,
                `שם: ${org.name}`,
                `תחומים: ${org.fields}`,
                `אזור: ${cities.join(', ')}`,
                ``,
                `אנחנו פועלים מ-${org.since || 2015} עם ${beneficiaries} מוטבים.`,
                `${org.description}`,
                ``,
                call ? `פונים אליכם בעקבות ${call.name}.` : 'נשמח לשתף פעולה.',
                call ? `דדליין: ${call.deadline || 'לא ידוע'}` : '',
            ].filter(Boolean).join('\n');
        },
        budget: () => [
            `נימוק תקציבי — ${org.name}`,
            ``,
            `=== סקירה ===`,
            `תקציב מבוקש: ${totalBudgetReq}`,
            `תקציב מאושר: ${D.budget ? D.budget.approved : '0'}`,
            ``,
            `=== פירוט לפי פרויקט ===`,
            ...(D.budget && D.budget.items ? D.budget.items.map(b =>
                `${b.project}: מבוקש ${b.requested}, מאושר ${b.approved} (${b.progress}%)`
            ) : []),
            ``,
            `=== הצדקה ===`,
            `עלות למוטב: ~${beneficiaries > 0 ? Math.round(parseInt(String(totalBudgetReq).replace(/[^\d]/g,''))/beneficiaries) : '?'} ש"ח`,
            `${beneficiaries} מוטבים ב${cities.length} ערים`,
        ].join('\n'),
        thankyou: () => {
            const call = getCallContext();
            return [
                `תודה${call ? ' ל' + call.source : ''}`,
                ``,
                `בזכות תמיכתכם, ${org.name} הגיעה ל-${beneficiaries} מוטבים ב${cities.join(', ')}.`,
                `ההשפעה מורגשת בשטח — 92% שביעות רצון.`,
                projectList.length ? `\nפרויקטים פעילים: ${projectNames}` : '',
            ].filter(Boolean).join('\n');
        }
    };

    document.querySelectorAll('[data-qf]').forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.dataset.qf;
            const template = detailedTemplates[type];
            if (template) {
                promptTextarea.value = typeof template === 'function' ? template() : template;
            }
            const typeSelect = document.getElementById('contentType');
            if (typeSelect) typeSelect.value = type === 'budget' ? 'budget' : type;
        });
    });

    // Wrap original generateContent to add save-to-sheet
    const origGenerate = window.generateContent;
    if (origGenerate) {
        window.generateContent = function() {
            origGenerate.call(window);
            setTimeout(addSaveToSheetButton, 2500);
        };
    }
}

// ══════════════════════════════════════════
//  שלב 6 — צ'קליסט מסמכים חכם
// ══════════════════════════════════════════

function enhanceDocumentsChecklist(D) {
    const docsPage = document.getElementById('page-documents');
    if (!docsPage) return;

    const requiredDocs = [
        { id: 'nihul-takin', name: 'אישור ניהול תקין', desc: 'מרשם העמותות — תקף לשנה הנוכחית', critical: true },
        { id: 'doch-kaspi', name: 'דוח כספי מבוקר', desc: 'שנה-שנתיים אחרונות', critical: true },
        { id: 'teudat-rishum', name: 'תעודת רישום עמותה', desc: 'מסמך ההתאגדות המקורי', critical: true },
        { id: 'takanon', name: 'תקנון העמותה', desc: 'הגרסה העדכנית', critical: false },
        { id: 'protokol', name: 'פרוטוקול ועד מנהל', desc: 'אישור הגשת הבקשה', critical: true },
        { id: 'hamlatza', name: 'מכתבי המלצה', desc: 'מרשות מקומית / שותפים', critical: false },
        { id: 'doch-haracha', name: 'דוח הערכה / אימפקט', desc: 'מפרויקטים קודמים', critical: false },
        { id: 'taktziv', name: 'תקציב מפורט', desc: 'בפורמט הנדרש ע"י הקרן', critical: true },
        { id: 'cv-tzevet', name: 'קורות חיים — צוות מוביל', desc: 'מנכ"ל/ית, רכז/ת פרויקט', critical: false },
        { id: 'bituach', name: 'אישור ביטוח', desc: 'ביטוח צד שלישי / מתנדבים', critical: false },
    ];

    // Load saved state - try Sheet first, fallback to localStorage
    let savedState = JSON.parse(localStorage.getItem('hoppa-docs-checklist') || '{}');
    // Async load from Sheet (will update checkboxes when ready)
    /* Sheet checklist disabled due to CORS - using localStorage only */
    void(0 && fetch(APPS_SCRIPT + '?action=getChecklist').then(r => r.json()).then(data => {
        if (data.ok && data.checklist && Object.keys(data.checklist).length > 0) {
            const sheetState = data.checklist;
            document.querySelectorAll('input[data-doc-id]').forEach(cb => {
                if (sheetState[cb.dataset.docId] !== undefined) {
                    cb.checked = sheetState[cb.dataset.docId];
                }
            });
            updateDocsProgress();
        }
    }).catch(() => {}));

    const checklistHtml = `
        <div class="panel" style="margin-top:20px;">
            <div class="panel-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--plum)" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                <div class="panel-title">צ'קליסט מסמכים נדרשים</div>
                <div class="panel-subtitle" id="docsProgress">0/${requiredDocs.length}</div>
            </div>
            <p style="font-size:12px;color:var(--gray);margin-bottom:16px;">
                סמנו מסמכים שכבר מוכנים. <span style="color:var(--red);">*</span> = חובה ברוב ההגשות
            </p>
            ${requiredDocs.map(doc => `
                <label style="display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid rgba(0,0,0,0.04);cursor:pointer;">
                    <input type="checkbox" id="doc-${doc.id}" data-doc-id="${doc.id}"
                        ${savedState[doc.id] ? 'checked' : ''}
                        style="width:20px;height:20px;margin-top:2px;accent-color:var(--mint);flex-shrink:0;">
                    <div style="flex:1;">
                        <div style="font-size:13px;font-weight:600;">
                            ${doc.name}
                            ${doc.critical ? '<span style="color:var(--red);"> *</span>' : ''}
                        </div>
                        <div style="font-size:11px;color:var(--gray-light);">${doc.desc}</div>
                    </div>
                    <div class="doc-status" style="font-size:11px;font-weight:600;${savedState[doc.id] ? 'color:var(--mint);' : 'color:var(--gray-light);'}">
                        ${savedState[doc.id] ? 'מוכן' : 'חסר'}
                    </div>
                </label>
            `).join('')}
            <div style="margin-top:16px;display:flex;gap:10px;">
                <div id="docsCriticalStatus" style="font-size:12px;padding:8px 14px;border-radius:8px;"></div>
            </div>
        </div>`;

    docsPage.insertAdjacentHTML('beforeend', checklistHtml);

    // Update progress and save on change
    function updateDocsProgress() {
        const checkboxes = docsPage.querySelectorAll('input[data-doc-id]');
        const state = {};
        let checked = 0;
        let criticalMissing = 0;

        checkboxes.forEach(cb => {
            state[cb.dataset.docId] = cb.checked;
            if (cb.checked) checked++;

            // Update status label
            const statusEl = cb.closest('label').querySelector('.doc-status');
            if (statusEl) {
                statusEl.textContent = cb.checked ? 'מוכן' : 'חסר';
                statusEl.style.color = cb.checked ? 'var(--mint)' : 'var(--gray-light)';
            }

            // Check critical
            const doc = requiredDocs.find(d => d.id === cb.dataset.docId);
            if (doc && doc.critical && !cb.checked) criticalMissing++;
        });

        // Save
        localStorage.setItem('hoppa-docs-checklist', JSON.stringify(state));
        // Debounced save to Sheet
        clearTimeout(window._checklistTimer);
        window._checklistTimer = setTimeout(() => {
            saveToSheetSafe('saveChecklist', { checklist: state });
        }, 1500);

        // Update counter
        const progressEl = document.getElementById('docsProgress');
        if (progressEl) progressEl.textContent = `${checked}/${requiredDocs.length}`;

        // Critical status
        const criticalEl = document.getElementById('docsCriticalStatus');
        if (criticalEl) {
            if (criticalMissing === 0) {
                criticalEl.textContent = 'כל המסמכים הקריטיים מוכנים!';
                criticalEl.style.background = 'var(--mint-light)';
                criticalEl.style.color = 'var(--mint)';
            } else {
                criticalEl.textContent = `${criticalMissing} מסמכים קריטיים חסרים`;
                criticalEl.style.background = 'var(--red-light)';
                criticalEl.style.color = 'var(--red)';
            }
        }
    }

    docsPage.querySelectorAll('input[data-doc-id]').forEach(cb => {
        cb.addEventListener('change', updateDocsProgress);
    });

    // Initial update
    updateDocsProgress();
}

// ══════════════════════════════════════════
//  שמירה ל-Sheet
// ══════════════════════════════════════════

function addSaveToSheetButton() {
    const result = document.getElementById('contentGeneratorResult');
    if (!result || result.querySelector('.save-sheet-btn')) return;

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn-primary save-sheet-btn';
    saveBtn.style.marginTop = '10px';
    saveBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
        </svg>
        שמור הגשה ל-Sheet`;
    saveBtn.addEventListener('click', saveToSheet);

    const btnsRow = result.querySelector('div[style*="flex"]');
    if (btnsRow) btnsRow.appendChild(saveBtn);
    else result.appendChild(saveBtn);
}

function saveToSheet() {
    const result = document.getElementById('contentGeneratorResult');
    if (!result) return;

    const sections = result.querySelectorAll('.ai-section p');
    const title = sections[0] ? sections[0].textContent.substring(0, 60) : 'טיוטה';
    const prompt = document.getElementById('contentPrompt').value;
    const type = document.getElementById('contentType').value;
    const typeNames = {
        proposal: 'הצעה', impact: 'אימפקט', letter: 'מכתב',
        summary: 'סיכום', budget: 'תקציב', thankyou: 'תודה', custom: 'חופשי'
    };

    const fundMatch = prompt.match(/קרן\s+([\u0590-\u05FF\s]+)/);
    const callSel = document.getElementById('contentCallSelector');
    const selectedCall = callSel && callSel.value !== '' && window.ORG
        ? window.ORG.calls.filter(c => c.status === 'open')[parseInt(callSel.value)]
        : null;
    const fundName = selectedCall ? selectedCall.source
        : fundMatch ? fundMatch[1].trim().substring(0, 30)
        : (typeNames[type] || 'טיוטה');

    const submission = {
        name: selectedCall ? selectedCall.name : title,
        fund: fundName,
        amount: selectedCall ? (selectedCall.amount || '') : '',
        date: new Date().toLocaleDateString('he-IL'),
        status: 'draft',
        notes: 'נוצר במחולל תוכן'
    };

    saveToSheetSafe('saveSubmission', { submission: submission });
    Promise.resolve().then(() => {
        const btn = result.querySelector('.save-sheet-btn');
        if (btn) {
            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> נשמר ב-Sheet!';
            btn.style.background = 'var(--mint)';
            btn.style.borderColor = 'var(--mint)';
            btn.disabled = true;
        }
    }).catch(err => console.error('Save failed:', err));
}


// ══════════════════════════════════════════
//  הוספת קול קורא ידנית
// ══════════════════════════════════════════

window._saveNewCall = function() {
    const modal = document.getElementById('modal-addCall');
    if (!modal) return;
    const inputs = modal.querySelectorAll('.form-input');
    const textarea = modal.querySelector('textarea');
    
    const call = {
        name: inputs[0] ? inputs[0].value : '',
        source: inputs[1] ? inputs[1].value : '',
        deadline: inputs[2] ? inputs[2].value : '',
        link: inputs[3] ? inputs[3].value : '',
        match: 50,
        status: 'open',
        eligibility: '',
        amount: '',
        category: '',
        notes: textarea ? textarea.value : ''
    };
    
    if (!call.name) { alert('חסר שם קול קורא'); return; }
    
    saveToSheetSafe('saveCall', { call: call });
    closeModal('addCall');
    location.reload();
};
