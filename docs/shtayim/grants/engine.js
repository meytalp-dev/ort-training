/**
 * שתיים — מנוע נתונים דינמי
 * טוען נתוני ארגון מ-JSON לפי פרמטר ?org= בכתובת
 * ברירת מחדל: demo
 */

(function() {
    const params = new URLSearchParams(window.location.search);
    const orgId = params.get('org') || 'demo';
    const jsonFile = orgId + '.json';

    // Load data and render
    fetch(jsonFile)
        .then(r => {
            if (!r.ok) throw new Error('קובץ נתונים לא נמצא: ' + jsonFile);
            return r.json();
        })
        .then(data => {
            window.ORG = data;
            renderAll(data);
        })
        .catch(err => {
            console.error(err);
            document.body.innerHTML = `<div style="padding:60px;text-align:center;font-family:Heebo,sans-serif;color:#6B6980;">
                <h2 style="color:#E85B5B;margin-bottom:16px;">שגיאה בטעינת נתונים</h2>
                <p>${err.message}</p>
                <p style="margin-top:12px;"><a href="?org=demo" style="color:#7B5EA7;">עבור למצב הדגמה</a></p>
            </div>`;
        });

    function renderAll(D) {
        // Title
        document.title = `שתיים — ${D.org.name}`;

        // Sidebar org
        const sidebarOrg = document.querySelector('.sidebar-org');
        if (sidebarOrg) {
            sidebarOrg.querySelector('.avatar').textContent = D.org.avatar;
            sidebarOrg.querySelector('.org-name').textContent = D.org.name;
            sidebarOrg.querySelector('.org-plan').textContent = D.org.plan;
        }

        // Sidebar badges
        const callsBadge = document.querySelector('[data-page="calls"] .badge');
        if (callsBadge) callsBadge.textContent = D.kpis.openCalls;
        const projBadge = document.querySelector('[data-page="projects"] .badge');
        if (projBadge) projBadge.textContent = D.kpis.activeProjects;

        // Header user avatar
        const userAvatar = document.querySelector('.header-user .avatar-sm');
        if (userAvatar) userAvatar.textContent = D.org.avatar.substring(0, 2);

        // ===== DASHBOARD =====
        renderDashboard(D);

        // ===== CALLS =====
        renderCalls(D);

        // ===== SUBMISSIONS =====
        renderSubmissions(D);

        // ===== PROJECTS =====
        renderProjects(D);

        // ===== FUNDS =====
        renderFunds(D);

        // ===== BUDGET =====
        renderBudget(D);

        // ===== DOCUMENTS =====
        renderDocuments(D);

        // ===== IMPACT =====
        renderImpact(D);

        // ===== PARTNERS =====
        renderPartners(D);

        // ===== SETTINGS =====
        renderSettings(D);
    }

    // ── Helpers ──
    function matchColor(m) {
        if (m >= 75) return 'var(--mint)';
        if (m >= 50) return 'var(--gold)';
        return 'var(--gray-light)';
    }

    function matchBar(m) {
        return `${m}% <div class="match-bar"><div class="fill" style="width:${m}%;background:${matchColor(m)};"></div></div>`;
    }

    function statusBadge(status, label) {
        const labels = { open: 'פתוח', pending: 'ממתין לבדיקה', submitted: 'הוגש', draft: 'טיוטה', approved: 'מאושר' };
        const cls = 'status-' + status;
        return `<span class="status-badge ${cls}">${label || labels[status] || status}</span>`;
    }

    function deadlineStyle(color) {
        if (!color) return '';
        return `style="color:var(--${color});font-weight:600;"`;
    }

    // ── Dashboard ──
    function renderDashboard(D) {
        // Demo banner
        const banner = document.getElementById('demoBanner');
        if (banner) {
            if (D.demoBanner) {
                banner.textContent = D.demoBanner;
                banner.style.display = '';
            } else {
                banner.style.display = 'none';
            }
        }

        // KPIs
        const kpiNums = document.querySelectorAll('#dashKpis .kpi-num');
        if (kpiNums.length >= 5) {
            kpiNums[0].textContent = D.kpis.openCalls;
            kpiNums[1].textContent = D.kpis.activeSubmissions;
            kpiNums[2].textContent = D.kpis.deadlines30;
            kpiNums[3].textContent = D.kpis.activeProjects;
            kpiNums[4].textContent = D.kpis.aiAnalyses;
        }

        // Deadlines panel
        const dlPanel = document.getElementById('deadlinesPanel');
        if (dlPanel) {
            dlPanel.innerHTML = D.deadlines.map(d => `
                <div class="deadline-item">
                    <div class="deadline-dot ${d.urgency}"></div>
                    <div class="deadline-info">
                        <div class="deadline-name">${d.name}</div>
                        <div class="deadline-org">${d.sub}</div>
                    </div>
                    <div class="deadline-date" ${deadlineStyle(d.urgency === 'urgent' ? 'red' : d.urgency === 'soon' ? 'gold' : '')}>${d.date}</div>
                </div>`).join('');
        }

        // High match panel
        const hmPanel = document.getElementById('highMatchPanel');
        if (hmPanel) {
            hmPanel.innerHTML = D.highMatch.map(h => `
                <div class="deadline-item">
                    <div class="deadline-dot ok"></div>
                    <div class="deadline-info">
                        <div class="deadline-name">${h.name}</div>
                    </div>
                    <div class="deadline-date" style="color:var(--mint);font-weight:700;">${h.match}%</div>
                </div>`).join('');
        }

        // Scan summary (Hoppa only)
        const scanPanel = document.getElementById('scanSummaryPanel');
        if (scanPanel && D.scanSummary) {
            scanPanel.style.display = '';
            scanPanel.innerHTML = `
                <div class="panel-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--plum)" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2"/></svg>
                    <div class="panel-title">סיכום סריקה אחרונה</div>
                    <div class="panel-subtitle">${D.scanSummary.lastScan}</div>
                </div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:14px;">
                    <div style="text-align:center;padding:12px;background:var(--plum-light);border-radius:10px;">
                        <div style="font-family:'Rubik',sans-serif;font-size:24px;font-weight:800;color:var(--plum);">${D.scanSummary.sourcesChecked}</div>
                        <div style="font-size:11px;color:var(--gray);">מקורות נסרקו</div>
                    </div>
                    <div style="text-align:center;padding:12px;background:var(--mint-light);border-radius:10px;">
                        <div style="font-family:'Rubik',sans-serif;font-size:24px;font-weight:800;color:var(--mint);">${D.scanSummary.openFound}</div>
                        <div style="font-size:11px;color:var(--gray);">קולות קוראים פתוחים</div>
                    </div>
                    <div style="text-align:center;padding:12px;background:var(--gold-light);border-radius:10px;">
                        <div style="font-family:'Rubik',sans-serif;font-size:24px;font-weight:800;color:var(--gold);">${D.scanSummary.invitationOnly}</div>
                        <div style="font-size:11px;color:var(--gray);">בהזמנה בלבד</div>
                    </div>
                </div>
                ${D.scanSummary.dynamicSitesUnchecked ? `<p style="font-size:12px;color:var(--gold);background:var(--gold-light);padding:8px 12px;border-radius:8px;margin-bottom:10px;">
                    <strong>לבדוק ידנית:</strong> ${D.scanSummary.dynamicSitesUnchecked.join(', ')}
                </p>` : ''}
                <p style="font-size:12px;color:var(--gray);">${D.scanSummary.recommendation || ''}</p>`;
        } else if (scanPanel) {
            scanPanel.style.display = 'none';
        }
    }

    // ── Calls ──
    function renderCalls(D) {
        const tbody = document.querySelector('#callsTable tbody');
        if (!tbody) return;

        const counts = { all: D.calls.length, open: 0, pending: 0, submitted: 0 };
        D.calls.forEach(c => { if (counts[c.status] !== undefined) counts[c.status]++; });

        // Update tabs
        const tabs = document.querySelectorAll('#callsTabs .tab');
        if (tabs.length >= 4) {
            tabs[0].textContent = `הכל (${counts.all})`;
            tabs[1].textContent = `פתוחים (${counts.open})`;
            tabs[2].textContent = `ממתינים (${counts.pending})`;
            tabs[3].textContent = `הוגשו (${counts.submitted})`;
        }

        tbody.innerHTML = D.calls.map(c => {
            const actionBtn = c.status === 'submitted'
                ? '<button class="btn btn-sm btn-ghost">צפה</button>'
                : c.status === 'open'
                    ? `<button class="btn btn-sm btn-outline" onclick="showPage('ai-analysis')">נתח AI</button>`
                    : '<button class="btn btn-sm btn-ghost">בדוק</button>';

            const linkCol = c.link
                ? `<a href="${c.link}" target="_blank" class="link-ext" title="${c.link}">קישור</a>`
                : '';

            return `<tr data-status="${c.status}">
                <td><strong>${c.name}</strong>${c.eligibility ? `<br><span style="font-size:11px;color:var(--gray-light);">${c.eligibility}</span>` : ''}</td>
                <td>${c.source}</td>
                <td ${deadlineStyle(c.deadlineColor)}>${c.deadline}</td>
                <td>${matchBar(c.match)}</td>
                <td>${statusBadge(c.status)}</td>
                <td style="display:flex;gap:6px;align-items:center;">${actionBtn}${linkCol ? ' ' + linkCol : ''}</td>
            </tr>`;
        }).join('');

        // Recently closed (Hoppa extra)
        const closedPanel = document.getElementById('recentlyClosedPanel');
        if (closedPanel && D.recentlyClosed && D.recentlyClosed.length) {
            closedPanel.style.display = '';
            closedPanel.innerHTML = `
                <div class="panel-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <div class="panel-title">נסגרו לאחרונה — לעקוב למחזור הבא</div>
                </div>
                ${D.recentlyClosed.map(c => `
                    <div class="deadline-item">
                        <div class="deadline-dot soon"></div>
                        <div class="deadline-info">
                            <div class="deadline-name">${c.name}</div>
                            <div class="deadline-org">${c.source} — נסגר ${c.closedDate}</div>
                        </div>
                        <div class="deadline-date" style="color:var(--gold);">מחזור ${c.nextCycle}</div>
                    </div>`).join('')}`;
        } else if (closedPanel) {
            closedPanel.style.display = 'none';
        }

        // Invitation only panel
        const invPanel = document.getElementById('invitationOnlyPanel');
        if (invPanel && D.invitationOnly && D.invitationOnly.length) {
            invPanel.style.display = '';
            invPanel.innerHTML = `
                <div class="panel-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--plum-muted)" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    <div class="panel-title">קרנות בהזמנה בלבד — פנייה ישירה</div>
                </div>
                ${D.invitationOnly.map(c => `
                    <div class="deadline-item">
                        <div class="deadline-dot" style="background:var(--plum-muted);"></div>
                        <div class="deadline-info">
                            <div class="deadline-name">${c.name}</div>
                            <div class="deadline-org">${c.note}</div>
                        </div>
                    </div>`).join('')}`;
        } else if (invPanel) {
            invPanel.style.display = 'none';
        }
    }

    // ── Submissions ──
    function renderSubmissions(D) {
        const tbody = document.querySelector('#submissionsTable tbody');
        if (!tbody) return;
        const statusLabels = { draft: 'טיוטה', pending: 'בכתיבה', submitted: 'הוגש' };
        tbody.innerHTML = D.submissions.map(s => `
            <tr>
                <td><strong>${s.name}</strong></td>
                <td>${s.fund}</td>
                <td>${s.amount}</td>
                <td>${s.date}</td>
                <td>${statusBadge(s.status, statusLabels[s.status])}</td>
            </tr>`).join('');
    }

    // ── Projects ──
    function renderProjects(D) {
        const grid = document.getElementById('projectsGrid');
        if (!grid) return;

        const progressColor = p => p >= 100 ? 'var(--mint)' : p >= 60 ? 'var(--plum)' : p >= 30 ? 'var(--gold)' : 'var(--gray-light)';
        const statusStyle = s => s === 'approved' ? 'background:rgba(91,191,158,0.1);color:#2D8A6A;' : '';

        grid.innerHTML = D.projects.map(p => `
            <div class="panel" style="margin:0;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
                    <div>
                        <h3 style="font-family:'Rubik',sans-serif;font-size:15px;font-weight:700;">${p.name}</h3>
                        <p style="font-size:11px;color:var(--gray-light);">${p.sub}</p>
                    </div>
                    <span class="status-badge status-${p.status}" style="${statusStyle(p.status)}">${p.statusLabel}</span>
                </div>
                <div style="display:flex;gap:20px;font-size:12px;color:var(--gray);margin-bottom:12px;">
                    <div><strong style="color:var(--charcoal);">${p.beneficiaries}</strong> מוטבים</div>
                    <div><strong style="color:var(--charcoal);">${p.submissions}</strong> הגשות</div>
                </div>
                <div style="height:4px;background:var(--gray-lighter);border-radius:2px;">
                    <div style="height:100%;width:${p.progress}%;background:${progressColor(p.progress)};border-radius:2px;"></div>
                </div>
                <p style="font-size:10px;color:${p.progress >= 100 ? 'var(--mint)' : 'var(--gray-light)'};margin-top:4px;${p.progress >= 100 ? 'font-weight:600;' : ''}">${p.progress >= 100 ? '100% — מימון מלא!' : p.progress + '% מהיעד התקציבי'}</p>
            </div>`).join('');
    }

    // ── Funds ──
    function renderFunds(D) {
        const tbody = document.querySelector('#fundsTable tbody');
        if (!tbody) return;
        tbody.innerHTML = D.funds.map(f => `
            <tr>
                <td><strong>${f.name}</strong></td>
                <td>${f.field}</td>
                <td>${f.maxAmount}</td>
                <td>${f.frequency}</td>
                <td>${matchBar(f.match)}</td>
            </tr>`).join('');
    }

    // ── Budget ──
    function renderBudget(D) {
        const b = D.budget;
        const nums = document.querySelectorAll('#budgetKpis .budget-num');
        if (nums.length >= 3) {
            nums[0].textContent = b.requested;
            nums[1].textContent = b.approved;
            nums[2].textContent = b.pending;
        }
        const tbody = document.querySelector('#budgetTable tbody');
        if (!tbody) return;
        tbody.innerHTML = b.items.map(i => `
            <tr>
                <td><strong>${i.project}</strong></td>
                <td>${i.requested}</td>
                <td>${i.approved}</td>
                <td>
                    <div class="match-bar" style="width:100px;">
                        <div class="fill" style="width:${i.progress}%;background:${i.progress >= 100 ? 'var(--mint)' : 'var(--gray-light)'};"></div>
                    </div>
                    ${i.progress >= 100 ? ' <span style="font-size:11px;color:var(--mint);font-weight:600;">מלא</span>' : ''}
                </td>
            </tr>`).join('');
    }

    // ── Documents ──
    function renderDocuments(D) {
        const container = document.getElementById('documentsContainer');
        if (!container) return;
        const colorMap = { red: 'var(--red-light)', mint: 'var(--mint-light)', plum: 'var(--plum-light)', gold: 'var(--gold-light)' };
        const textMap = { red: 'var(--red)', mint: 'var(--mint)', plum: 'var(--plum)', gold: 'var(--gold)' };
        container.innerHTML = D.documents.map(d => `
            <div class="doc-item">
                <div class="doc-icon" style="background:${colorMap[d.color]};color:${textMap[d.color]};">${d.type}</div>
                <div class="doc-info">
                    <div class="doc-name">${d.name}</div>
                    <div class="doc-meta">הועלה ${d.date} | ${d.size}</div>
                </div>
                <button class="btn btn-sm btn-ghost">הורד</button>
            </div>`).join('');
    }

    // ── Impact ──
    function renderImpact(D) {
        const imp = D.impact;
        const nums = document.querySelectorAll('#impactKpis .impact-num');
        if (nums.length >= 4) {
            nums[0].textContent = imp.directBeneficiaries;
            nums[1].textContent = imp.projects;
            nums[2].textContent = imp.cities;
            nums[3].textContent = imp.satisfaction;
        }
        const container = document.getElementById('impactMilestones');
        if (!container) return;
        container.innerHTML = imp.milestones.map(m => `
            <div class="deadline-item">
                <div class="deadline-dot ${m.urgency}"></div>
                <div class="deadline-info">
                    <div class="deadline-name">${m.text}</div>
                    <div class="deadline-org">${m.sub}</div>
                </div>
            </div>`).join('');
    }

    // ── Partners ──
    function renderPartners(D) {
        const tbody = document.querySelector('#partnersTable tbody');
        if (!tbody) return;
        tbody.innerHTML = D.partners.map(p => `
            <tr>
                <td><strong>${p.name}</strong></td>
                <td>${p.type}</td>
                <td>${p.field}</td>
                <td>${statusBadge(p.status, p.statusLabel)}</td>
            </tr>`).join('');
    }

    // ── Settings ──
    function renderSettings(D) {
        const o = D.org;
        const inputs = document.querySelectorAll('#settingsFields .form-input');
        if (inputs.length >= 6) {
            inputs[0].value = o.name;
            inputs[1].value = o.number;
            inputs[2].value = o.fields;
            inputs[3].value = o.area;
            inputs[4].value = o.email;
            inputs[5].value = o.phone;
        }
        const desc = document.getElementById('orgDescription');
        if (desc) desc.value = o.description;
    }
})();
