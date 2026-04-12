/* =====================================================
   העיר האבודה — Dialogue Engine
   Chat-style NPC conversations with trust system
   ===================================================== */

const Dialogue = (() => {
    // Cache loaded dialogue JSON
    const cache = {};

    // Current dialogue state
    let currentNpc = null;
    let currentData = null;
    let currentNodeId = null;
    let isTyping = false;
    let typeTimeout = null;
    let silenceTimer = null;
    let silenceInterval = null;
    let skipResolve = null;

    // DOM references (set on init)
    let els = {};

    // Emotion icons SVG
    const EMOTION_ICONS = {
        angry: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#2a0a0f" stroke="#ff4060" stroke-width="1.5" opacity="0.8"/>
            <path d="M12 14 L20 20 L28 14" stroke="#ff4060" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            <path d="M12 26 L20 20 L28 26" stroke="#ff4060" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            <line x1="20" y1="8" x2="20" y2="14" stroke="#ff4060" stroke-width="1.5" opacity="0.5"/>
            <line x1="20" y1="26" x2="20" y2="32" stroke="#ff4060" stroke-width="1.5" opacity="0.5"/>
        </svg>`,
        calm: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#0a1525" stroke="#00bcd4" stroke-width="1.5" opacity="0.8"/>
            <path d="M8 22 Q14 16, 20 22 Q26 28, 32 22" stroke="#00bcd4" stroke-width="2" stroke-linecap="round" fill="none"/>
            <path d="M8 18 Q14 12, 20 18 Q26 24, 32 18" stroke="#00bcd4" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.4"/>
            <circle cx="20" cy="20" r="3" fill="#00bcd4" opacity="0.2"/>
        </svg>`,
        funny: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#1a1500" stroke="#ffc107" stroke-width="1.5" opacity="0.8"/>
            <polygon points="20,6 23,14 31,14 25,19 27,27 20,23 13,27 15,19 9,14 17,14" fill="none" stroke="#ffc107" stroke-width="1.8"/>
            <circle cx="20" cy="17" r="2" fill="#ffc107" opacity="0.6"/>
        </svg>`,
        honest: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#120a20" stroke="#b388ff" stroke-width="1.5" opacity="0.8"/>
            <polygon points="20,6 26,16 34,20 26,24 20,34 14,24 6,20 14,16" fill="none" stroke="#b388ff" stroke-width="1.8"/>
            <circle cx="20" cy="20" r="4" fill="#b388ff" opacity="0.3"/>
            <circle cx="20" cy="20" r="1.5" fill="#b388ff" opacity="0.7"/>
        </svg>`
    };

    const EMOTION_LABELS = {
        angry: 'כועס',
        calm: 'רגוע',
        funny: 'מצחיק',
        honest: 'כנה'
    };

    const EMOTION_COLORS = {
        angry: '#ff4060',
        calm: '#00bcd4',
        funny: '#ffc107',
        honest: '#b388ff'
    };

    // NPC mini-portrait SVGs (small circle versions)
    function getNpcMiniPortrait(npcId) {
        const npc = NPCS.find(n => n.id === npcId);
        if (!npc) return '';
        const colorMap = { purple: '#a07de0', cyan: '#00e5ff', pink: '#e06090' };
        const c = colorMap[npc.color] || '#8a92a8';
        return `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="15" fill="#161b2a" stroke="${c}" stroke-width="1.2"/>
            <circle cx="16" cy="13" r="5" fill="${c}" opacity="0.25"/>
            <path d="M8 26 C8 21, 12 18, 16 18 C20 18, 24 21, 24 26" fill="${c}" opacity="0.15"/>
        </svg>`;
    }

    function getNpcColor(npcId) {
        const npc = NPCS.find(n => n.id === npcId);
        if (!npc) return '#8a92a8';
        const colorMap = { purple: '#a07de0', cyan: '#00e5ff', pink: '#e06090' };
        return colorMap[npc.color] || '#8a92a8';
    }

    function getNpcPortraitSvg(npcId) {
        const npc = NPCS.find(n => n.id === npcId);
        return npc ? npc.portrait : '';
    }

    // --- Init ---
    function init() {
        els = {
            screen: document.getElementById('screen-dialogue'),
            backBtn: document.getElementById('dlg-back'),
            npcName: document.getElementById('dlg-npc-name'),
            portrait: document.getElementById('dlg-portrait'),
            trustBar: document.getElementById('dlg-trust-fill'),
            trustValue: document.getElementById('dlg-trust-value'),
            trustMeter: document.getElementById('dlg-trust-meter'),
            chatArea: document.getElementById('dlg-chat'),
            choicePanel: document.getElementById('dlg-choices'),
            toast: document.getElementById('dlg-toast'),
            silenceBar: document.getElementById('dlg-silence-bar'),
            silenceContainer: document.getElementById('dlg-silence-container')
        };

        els.backBtn.addEventListener('click', () => {
            Audio.play('tap');
            endDialogue(true);
        });

        // Skip typing on tap
        els.chatArea.addEventListener('click', () => {
            if (isTyping && skipResolve) {
                skipResolve();
            }
        });
    }

    // --- Start dialogue ---
    async function startDialogue(npcId) {
        currentNpc = npcId;

        // Load JSON (cached) — try fetch first, fallback to inline data
        if (!cache[npcId]) {
            try {
                const resp = await fetch(`data/${npcId}.json`);
                if (!resp.ok) throw new Error(resp.status);
                cache[npcId] = await resp.json();
            } catch (e) {
                // Fallback to inline data (for file:// or offline)
                if (typeof DIALOGUE_DATA !== 'undefined' && DIALOGUE_DATA[npcId]) {
                    cache[npcId] = DIALOGUE_DATA[npcId];
                } else {
                    console.error('Failed to load dialogue for', npcId, e);
                    return;
                }
            }
        }

        currentData = cache[npcId];

        // Init trust if not set
        if (STATE.trust[npcId] === undefined) {
            STATE.trust[npcId] = currentData.trustStart || 50;
        }

        // Set initial trust from data if first visit
        if (!STATE.flags[`talked_${npcId}`]) {
            STATE.trust[npcId] = currentData.trustStart || STATE.trust[npcId];
            STATE.flags[`talked_${npcId}`] = true;
            saveState();
        }

        // Setup UI
        const npc = NPCS.find(n => n.id === npcId);
        els.npcName.textContent = currentData.name || (npc ? npc.name : '');
        els.portrait.innerHTML = getNpcPortraitSvg(npcId);
        els.chatArea.innerHTML = '';
        els.choicePanel.innerHTML = '';
        hideSilenceBar();
        updateTrustMeter(false);

        // Set NPC accent color
        const accentColor = getNpcColor(npcId);
        els.trustMeter.style.setProperty('--npc-accent', accentColor);
        els.screen.style.setProperty('--npc-accent', accentColor);

        // Switch screen
        goToScreen('dialogue');

        // Begin dialogue
        await delay(400);
        processNode('start');
    }

    // --- Process a node ---
    async function processNode(nodeId) {
        if (!nodeId || !currentData || !currentData.nodes[nodeId]) {
            endDialogue();
            return;
        }

        currentNodeId = nodeId;
        const node = currentData.nodes[nodeId];

        // Check gated conditions
        if (node.conditions) {
            if (node.conditions.minTrust !== undefined && node.conditions.minTrust !== -999) {
                if (STATE.trust[currentNpc] < node.conditions.minTrust) {
                    // Show a graceful "not enough trust" narrator line before fallback
                    const trustGapMsg = document.createElement('div');
                    trustGapMsg.className = 'dlg-bubble dlg-narrator';
                    const trustGapText = currentNpc === 'ido'
                        ? 'הוא עוד לא מוכן. אולי בפעם הבאה.'
                        : 'היא עוד לא מוכנה. אולי בפעם הבאה.';
                    trustGapMsg.innerHTML = `<span class="dlg-bubble-text">${trustGapText}</span>`;
                    els.chatArea.appendChild(trustGapMsg);
                    trustGapMsg.classList.add('dlg-shown');
                    scrollToBottom();
                    await delay(800);

                    // Skip to a fallback — try end_partial or end_neutral
                    const fallback = currentData.nodes[`${currentNpc}_end_partial`]
                        ? `${currentNpc}_end_partial`
                        : `${currentNpc}_end_neutral`;
                    if (currentData.nodes[fallback]) {
                        processNode(fallback);
                    } else {
                        endDialogue();
                    }
                    return;
                }
            }
            if (node.conditions.maxTrust !== undefined) {
                if (STATE.trust[currentNpc] > node.conditions.maxTrust) {
                    // Trust is above maxTrust — skip this node gracefully
                    // (e.g., zero-trust rejection node when trust is actually fine)
                    const fallback = currentData.nodes[`${currentNpc}_end_partial`]
                        ? `${currentNpc}_end_partial`
                        : (node.next ? node.next : null);
                    if (fallback && currentData.nodes[fallback]) {
                        processNode(fallback);
                    } else {
                        endDialogue();
                    }
                    return;
                }
            }
        }

        // Apply trust change from node
        if (node.trustChange) {
            changeTrust(node.trustChange);
        }

        // Check for zero trust redirect — only on nodes that apply negative trust
        // (not on every single node, to avoid premature cutoff)
        if (STATE.trust[currentNpc] <= 0 && node.trustChange < 0
            && nodeId !== `${currentNpc}_trust_check_zero`
            && nodeId !== `${currentNpc}_end_rejection`
            && nodeId !== `${currentNpc}_end_partial`
            && nodeId !== `${currentNpc}_end_neutral`) {
            const zeroNode = `${currentNpc}_trust_check_zero`;
            if (currentData.nodes[zeroNode]) {
                processNode(zeroNode);
                return;
            }
        }

        // Remember this
        if (node.rememberThis) {
            showRememberToast();
            STATE.flags[`remember_${currentNpc}_${nodeId}`] = true;
            saveState();
        }

        // Handle by type
        switch (node.type) {
            case 'narrator':
                await showNarratorBubble(node.text);
                if (node.next) {
                    await delay(350);
                    processNode(node.next);
                } else {
                    endDialogue();
                }
                break;

            case 'npc':
                await showNpcBubble(node.text);
                if (node.next) {
                    await delay(350);
                    processNode(node.next);
                } else {
                    endDialogue();
                }
                break;

            case 'player':
                showPlayerChoices(node);
                break;

            case 'emotion_pick':
                await showNarratorBubble(node.text);
                await delay(200);
                showEmotionPicker(node);
                break;

            default:
                if (node.next) {
                    processNode(node.next);
                } else {
                    endDialogue();
                }
        }
    }

    // --- Chat bubbles ---
    async function showNarratorBubble(text) {
        const bubble = document.createElement('div');
        bubble.className = 'dlg-bubble dlg-narrator';
        bubble.innerHTML = `<span class="dlg-bubble-text"></span>`;
        els.chatArea.appendChild(bubble);
        scrollToBottom();

        await typeTextInElement(bubble.querySelector('.dlg-bubble-text'), text);
        bubble.classList.add('dlg-shown');
    }

    async function showNpcBubble(text) {
        const bubble = document.createElement('div');
        bubble.className = 'dlg-bubble dlg-npc';
        bubble.innerHTML = `
            <div class="dlg-avatar">${getNpcMiniPortrait(currentNpc)}</div>
            <div class="dlg-bubble-body">
                <span class="dlg-bubble-text"></span>
            </div>
        `;
        els.chatArea.appendChild(bubble);
        scrollToBottom();

        await typeTextInElement(bubble.querySelector('.dlg-bubble-text'), text);
        bubble.classList.add('dlg-shown');
    }

    function showPlayerBubble(text) {
        const bubble = document.createElement('div');
        bubble.className = 'dlg-bubble dlg-player';
        bubble.innerHTML = `<div class="dlg-bubble-body"><span class="dlg-bubble-text">${text}</span></div>`;
        els.chatArea.appendChild(bubble);
        bubble.classList.add('dlg-shown');
        scrollToBottom();
    }

    function showSilenceBubble() {
        const bubble = document.createElement('div');
        bubble.className = 'dlg-bubble dlg-player dlg-silence';
        bubble.innerHTML = `<div class="dlg-bubble-body"><span class="dlg-bubble-text">...</span></div>`;
        els.chatArea.appendChild(bubble);
        bubble.classList.add('dlg-shown');
        scrollToBottom();
    }

    // --- Typing effect ---
    function typeTextInElement(el, text) {
        return new Promise((resolve) => {
            isTyping = true;
            let i = 0;
            el.textContent = '';

            function skip() {
                clearTimeout(typeTimeout);
                isTyping = false;
                skipResolve = null;
                el.textContent = text;
                resolve();
            }

            skipResolve = skip;

            function tick() {
                if (i < text.length) {
                    el.textContent = text.substring(0, i + 1);
                    i++;
                    scrollToBottom();
                    if (i % 3 === 0) Audio.play('type');
                    typeTimeout = setTimeout(tick, 20 + Math.random() * 12);
                } else {
                    isTyping = false;
                    skipResolve = null;
                    resolve();
                }
            }
            tick();
        });
    }

    // --- Player choices ---
    function showPlayerChoices(node) {
        els.choicePanel.innerHTML = '';
        const choices = filterChoices(node.choices || []);

        choices.forEach((choice, i) => {
            const btn = document.createElement('button');
            btn.className = 'dlg-choice-btn';
            btn.textContent = choice.text;
            btn.style.animationDelay = `${i * 100}ms`;

            btn.addEventListener('click', () => {
                Audio.play('tap');
                clearSilenceTimer();
                showPlayerBubble(choice.text);
                els.choicePanel.innerHTML = '';
                hideSilenceBar();

                if (choice.trustChange) {
                    changeTrust(choice.trustChange);
                }

                saveState();

                setTimeout(() => {
                    processNode(choice.next);
                }, 400);
            });

            els.choicePanel.appendChild(btn);
        });

        // Silence option
        if (node.silenceOption) {
            startSilenceTimer(node.silenceOption);
        }

        scrollToBottom();
    }

    // --- Emotion picker ---
    function showEmotionPicker(node) {
        els.choicePanel.innerHTML = '';

        const picker = document.createElement('div');
        picker.className = 'dlg-emotion-picker';

        const emotions = ['angry', 'calm', 'funny', 'honest'];
        const choices = node.choices || [];

        emotions.forEach((emotion, i) => {
            const choice = choices.find(c => c.emotion === emotion);
            if (!choice) return;

            // Check conditions
            if (choice.condition) {
                if (choice.condition.talkedTo && choice.condition.talkedTo.length > 0) {
                    const hasTalked = choice.condition.talkedTo.every(npcId => STATE.flags[`talked_${npcId}`]);
                    if (!hasTalked) return;
                }
                if (choice.condition.minTrust !== undefined && choice.condition.minTrust !== 0) {
                    if (STATE.trust[currentNpc] < choice.condition.minTrust) return;
                }
            }

            const btn = document.createElement('button');
            btn.className = 'dlg-emotion-btn';
            btn.style.animationDelay = `${i * 100}ms`;
            btn.style.setProperty('--emotion-color', EMOTION_COLORS[emotion]);
            btn.innerHTML = `
                <div class="dlg-emotion-icon">${EMOTION_ICONS[emotion]}</div>
                <span class="dlg-emotion-label">${EMOTION_LABELS[emotion]}</span>
            `;

            btn.addEventListener('click', () => {
                Audio.play('tap');
                clearSilenceTimer();
                hideSilenceBar();

                // Show emotion as player bubble
                showPlayerBubble(`[${EMOTION_LABELS[emotion]}]`);
                els.choicePanel.innerHTML = '';

                if (choice.trustChange) {
                    changeTrust(choice.trustChange);
                }

                saveState();

                setTimeout(() => {
                    processNode(choice.next);
                }, 400);
            });

            picker.appendChild(btn);
        });

        els.choicePanel.appendChild(picker);

        // Silence option
        if (node.silenceOption) {
            startSilenceTimer(node.silenceOption);
        }

        scrollToBottom();
    }

    // --- Filter choices by conditions ---
    function filterChoices(choices) {
        return choices.filter(choice => {
            if (!choice.condition) return true;
            if (choice.condition.talkedTo && choice.condition.talkedTo.length > 0) {
                const hasTalked = choice.condition.talkedTo.every(npcId => STATE.flags[`talked_${npcId}`]);
                if (!hasTalked) return false;
            }
            if (choice.condition.minTrust !== undefined && choice.condition.minTrust !== 0) {
                if (STATE.trust[currentNpc] < choice.condition.minTrust) return false;
            }
            return true;
        });
    }

    // --- Silence timer ---
    function startSilenceTimer(silenceOption) {
        clearSilenceTimer();
        els.silenceContainer.style.display = 'block';

        // Add silence label if not present
        if (!els.silenceContainer.querySelector('.dlg-silence-label')) {
            const label = document.createElement('div');
            label.className = 'dlg-silence-label';
            label.textContent = '...או פשוט שתוק';
            els.silenceContainer.insertBefore(label, els.silenceContainer.firstChild);
        }

        const bar = els.silenceBar;
        const duration = silenceOption.timeout * 1000;
        const startTime = Date.now();

        bar.style.width = '100%';
        bar.style.background = '#4caf50';

        silenceInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = 1 - (elapsed / duration);

            if (progress <= 0) {
                clearSilenceTimer();
                hideSilenceBar();
                // Silence chosen
                showSilenceBubble();
                els.choicePanel.innerHTML = '';

                if (silenceOption.trustChange) {
                    changeTrust(silenceOption.trustChange);
                }
                saveState();

                setTimeout(() => {
                    processNode(silenceOption.next);
                }, 350);
                return;
            }

            bar.style.width = `${progress * 100}%`;

            // Color transition: green -> amber -> red
            if (progress > 0.6) {
                bar.style.background = '#4caf50';
            } else if (progress > 0.3) {
                bar.style.background = '#ff9800';
            } else {
                bar.style.background = '#f44336';
            }
        }, 50);
    }

    function clearSilenceTimer() {
        if (silenceInterval) {
            clearInterval(silenceInterval);
            silenceInterval = null;
        }
        if (silenceTimer) {
            clearTimeout(silenceTimer);
            silenceTimer = null;
        }
    }

    function hideSilenceBar() {
        if (els.silenceContainer) {
            els.silenceContainer.style.display = 'none';
        }
    }

    // --- Trust system ---
    function changeTrust(amount) {
        if (!currentNpc) return;
        STATE.trust[currentNpc] = Math.max(0, Math.min(100, (STATE.trust[currentNpc] || 0) + amount));
        updateTrustMeter(true);
        saveState();

        // Floating trust change indicator
        if (amount !== 0 && els.trustMeter) {
            const floater = document.createElement('span');
            floater.className = 'dlg-trust-float ' + (amount > 0 ? 'positive' : 'negative');
            floater.textContent = (amount > 0 ? '+' : '') + amount;
            els.trustMeter.style.position = 'relative';
            els.trustMeter.appendChild(floater);
            setTimeout(() => floater.remove(), 850);
        }
    }

    function updateTrustMeter(animate) {
        if (!currentNpc || !els.trustBar) return;
        const trust = STATE.trust[currentNpc] || 0;

        els.trustValue.textContent = trust;

        // Color based on trust level
        let color;
        if (trust <= 30) {
            color = '#f44336';
        } else if (trust <= 60) {
            color = '#ff9800';
        } else {
            color = '#4caf50';
        }

        if (animate) {
            els.trustBar.style.transition = 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1), background 0.6s ease';
        } else {
            els.trustBar.style.transition = 'none';
        }

        els.trustBar.style.width = `${trust}%`;
        els.trustBar.style.background = `linear-gradient(90deg, ${color}, ${color}dd)`;
    }

    // --- Remember toast ---
    function showRememberToast() {
        Audio.play('transition');
        els.toast.classList.add('dlg-toast-visible');

        setTimeout(() => {
            els.toast.classList.remove('dlg-toast-visible');
        }, 2500);
    }

    // --- End dialogue ---
    function endDialogue(isManualBack) {
        clearSilenceTimer();
        clearTimeout(typeTimeout);
        isTyping = false;
        skipResolve = null;

        if (currentNpc && !isManualBack) {
            // Add journal entry
            const npc = NPCS.find(n => n.id === currentNpc);
            const trust = STATE.trust[currentNpc] || 0;
            let journalText;
            if (trust >= 60) {
                journalText = `שיחה טובה עם ${npc ? npc.name : currentNpc}. אמון: ${trust}`;
            } else if (trust >= 30) {
                journalText = `דיברת עם ${npc ? npc.name : currentNpc}. יש עוד דרך.`;
            } else {
                journalText = `${npc ? npc.name : currentNpc} לא סומכת עליך. אמון: ${trust}`;
            }

            STATE.journal.push({ text: journalText, time: Date.now() });

            // Mark as completed
            if (!STATE.completedNpcs.includes(currentNpc)) {
                STATE.completedNpcs.push(currentNpc);
            }

            saveState();
        }

        // Show end summary overlay
        if (!isManualBack) {
            const npcId = currentNpc;
            const npc = NPCS.find(n => n.id === npcId);
            const trust = STATE.trust[npcId] || 0;
            const npcName = currentData ? currentData.name : (npc ? npc.name : '');

            // Collect remember moments
            const rememberKeys = Object.keys(STATE.flags).filter(k => k.startsWith(`remember_${npcId}`));
            let rememberHtml = '';
            if (rememberKeys.length > 0) {
                rememberHtml = `<div class="dlg-summary-memories">
                    <div class="dlg-summary-memories-title">רגעים שכדאי לזכור</div>
                    ${rememberKeys.map((_, i) => `<div class="dlg-summary-memory-item">&#x2726; רגע ${i + 1}</div>`).join('')}
                </div>`;
            }

            // Trust bar color
            let trustColor;
            if (trust <= 30) trustColor = '#f44336';
            else if (trust <= 60) trustColor = '#ff9800';
            else trustColor = '#4caf50';

            const endOverlay = document.createElement('div');
            endOverlay.className = 'dlg-summary-overlay';
            endOverlay.innerHTML = `
                <div class="dlg-summary-card">
                    <div class="dlg-summary-portrait">${getNpcPortraitSvg(npcId)}</div>
                    <div class="dlg-summary-name">${npcName}</div>
                    <div class="dlg-summary-trust-label">רמת אמון</div>
                    <div class="dlg-summary-trust-track">
                        <div class="dlg-summary-trust-fill" style="width:${trust}%;background:linear-gradient(90deg,${trustColor},${trustColor}dd)"></div>
                    </div>
                    <div class="dlg-summary-trust-value">${trust}/100</div>
                    ${rememberHtml}
                    <button class="dlg-summary-btn">חזרה למפה</button>
                </div>
            `;
            els.screen.appendChild(endOverlay);

            requestAnimationFrame(() => {
                endOverlay.classList.add('dlg-summary-visible');
            });

            endOverlay.querySelector('.dlg-summary-btn').addEventListener('click', () => {
                Audio.play('tap');
                endOverlay.remove();
                currentNpc = null;
                currentData = null;
                goToScreen('exploration');
            });
        } else {
            currentNpc = null;
            currentData = null;
            goToScreen('exploration');
        }
    }

    // --- Helpers ---
    function scrollToBottom() {
        if (els.chatArea) {
            requestAnimationFrame(() => {
                els.chatArea.scrollTop = els.chatArea.scrollHeight;
            });
        }
    }

    function delay(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    return { init, startDialogue };
})();

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    Dialogue.init();
});
