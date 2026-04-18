/**
 * שתיים — מחולל תוכן חכם
 * משתמש בנתוני העמותה מ-Sheet ליצירת תוכן מותאם
 * נטען אחרי engine.js
 */

const APPS_SCRIPT = 'https://script.google.com/macros/s/AKfycbzl7LLZIXFtFBXN8b3K0VBXZMoPzAYwokbPgdVU-WLVHr20i_Pbng9Sb94X8FOkY89m/exec';

// Wait for ORG data to load, then enhance
function waitForOrg(cb) {
    if (window.ORG) return cb(window.ORG);
    setTimeout(() => waitForOrg(cb), 200);
}

waitForOrg(function(D) {
    enhanceAiAnalysis(D);
    enhanceContentGenerator(D);
});

// ══════════════════════════════════════════
//  ניתוח קול קורא — בורר מה-Sheet
// ══════════════════════════════════════════

function enhanceAiAnalysis(D) {
    const tabsEl = document.getElementById('aiInputTabs');
    if (!tabsEl) return;

    const openCalls = D.calls.filter(c => c.status === 'open' || c.status === 'pending');
    if (!openCalls.length) return;

    // Selector dropdown
    const options = openCalls.map((c, i) =>
        `<option value="${i}">${c.match}% | ${c.name} (${c.source})${c.deadline && !['פתוח','לא ברור','משתנה'].includes(c.deadline) ? ' — ' + c.deadline : ''}</option>`
    ).join('');

    tabsEl.insertAdjacentHTML('beforebegin', `
        <div style="margin-bottom:16px;padding:16px;background:var(--plum-light);border-radius:12px;">
            <label style="font-size:12px;font-weight:600;color:var(--plum);display:block;margin-bottom:8px;">
                בחרו קול קורא לניתוח (מה-Sheet — ${openCalls.length} פתוחים)
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

        const textarea = document.getElementById('aiTextArea');
        if (textarea) {
            textarea.value = [
                `קול קורא: ${call.name}`,
                `מקור: ${call.source}`,
                `דדליין: ${call.deadline || 'לא ידוע'}`,
                `סכום: ${call.amount || 'לא פורסם'}`,
                `תנאי סף: ${call.eligibility || 'לא פורטו'}`,
                call.link ? `לינק: ${call.link}` : '',
                '',
                `פרופיל העמותה: ${org.name}`,
                `תחומים: ${org.fields}`,
                `אזור: ${org.area}`,
                `תיאור: ${org.description}`
            ].filter(Boolean).join('\n');
        }

        // Switch to text tab
        const textTab = document.querySelector('#aiInputTabs .ai-tab');
        if (textTab) textTab.click();
    });
}

// ══════════════════════════════════════════
//  מחולל תוכן — מילוי מהיר + שמירה ל-Sheet
// ══════════════════════════════════════════

function enhanceContentGenerator(D) {
    const promptTextarea = document.getElementById('contentPrompt');
    if (!promptTextarea) return;

    const org = D.org;
    const beneficiaries = D.projects
        ? D.projects.reduce((s, p) => s + (p.beneficiaries || 0), 0)
        : 750;
    const projectNames = D.projects
        ? D.projects.filter(p => p.status === 'open').map(p => p.name).join(', ')
        : '';

    // Quick-fill buttons
    promptTextarea.insertAdjacentHTML('beforebegin', `
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">
            <span style="font-size:11px;color:var(--gray);align-self:center;margin-left:8px;">מילוי מהיר מפרופיל העמותה:</span>
            <button type="button" class="btn btn-sm btn-ghost" data-qf="proposal">הצעה לקרן</button>
            <button type="button" class="btn btn-sm btn-ghost" data-qf="impact">דוח אימפקט</button>
            <button type="button" class="btn btn-sm btn-ghost" data-qf="letter">מכתב פנייה</button>
            <button type="button" class="btn btn-sm btn-ghost" data-qf="thankyou">מכתב תודה</button>
        </div>`);

    const templates = {
        proposal: `${org.name} פועלת מ-${org.since || 2015} ב${org.area}.\nאנחנו מפעילים תוכניות ב${org.fields} עם ${beneficiaries} מוטבים.\nפרויקטים פעילים: ${projectNames}.\nמבקשים תמיכה להרחבת הפעילות.`,
        impact: `דוח אימפקט שנתי — ${org.name}.\n${beneficiaries} מוטבים ישירים ב${org.area}.\nפרויקטים: ${projectNames}.\nשביעות רצון: 92%.`,
        letter: `פונים אליכם מ${org.name}.\nאנחנו פועלים ב${org.area} בתחום ${org.fields}.\n${beneficiaries} מוטבים. נשמח לשתף פעולה.`,
        thankyou: `תודה על התמיכה ב${org.name}.\nבזכותכם הגענו ל-${beneficiaries} מוטבים ב${org.area}.\nההשפעה מורגשת בשטח.`
    };

    const typeMap = { proposal: 'proposal', impact: 'impact', letter: 'letter', thankyou: 'thankyou' };

    document.querySelectorAll('[data-qf]').forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.dataset.qf;
            promptTextarea.value = templates[type] || '';
            const typeSelect = document.getElementById('contentType');
            if (typeSelect && typeMap[type]) typeSelect.value = typeMap[type];
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

    // Find the buttons row and append
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

    // Try to extract fund name from prompt
    const fundMatch = prompt.match(/קרן\s+([\u0590-\u05FF\s]+)/);
    const fundName = fundMatch ? fundMatch[1].trim().substring(0, 30) : (typeNames[type] || 'טיוטה');

    const submission = {
        name: title,
        fund: fundName,
        amount: '',
        date: new Date().toLocaleDateString('he-IL'),
        status: 'draft',
        notes: 'נוצר במחולל תוכן'
    };

    fetch(APPS_SCRIPT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'saveSubmission', submission: submission }),
        redirect: 'follow'
    }).then(() => {
        const btn = result.querySelector('.save-sheet-btn');
        if (btn) {
            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> נשמר ב-Sheet!';
            btn.style.background = 'var(--mint)';
            btn.style.borderColor = 'var(--mint)';
            btn.disabled = true;
        }
    }).catch(err => {
        console.error('Save failed:', err);
    });
}
