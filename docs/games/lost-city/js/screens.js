/* =====================================================
   העיר האבודה — Screen Renderers
   Splash, Name, Intro, Exploration, Garden
   ===================================================== */

// --- NPC Data ---
const NPCS = [
    {
        id: 'noa',
        name: 'נועה',
        color: 'purple',
        desc: 'ציירת שציירה את כל העיר. עכשיו היא לא מציירת.',
        quest: 'רמז: חפשו את הציורים על הקירות',
        portrait: `<svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Hooded figure, looking down, paint dots -->
            <ellipse cx="32" cy="72" rx="18" ry="4" fill="#a07de0" opacity="0.08"/>
            <!-- Cloak body -->
            <path d="M16 35 C16 28, 22 18, 32 16 C42 18, 48 28, 48 35 L50 72 L14 72 Z" fill="#1a1530" stroke="#a07de0" stroke-width="0.8" opacity="0.9"/>
            <!-- Hood -->
            <path d="M20 28 C20 18, 26 10, 32 9 C38 10, 44 18, 44 28 L42 34 L22 34 Z" fill="#231d40" stroke="#a07de0" stroke-width="0.6"/>
            <!-- Face shadow -->
            <ellipse cx="32" cy="28" rx="7" ry="8" fill="#0d0a18" opacity="0.7"/>
            <!-- Hood rim -->
            <path d="M21 33 C25 36, 39 36, 43 33" stroke="#a07de0" stroke-width="0.8" fill="none" opacity="0.5"/>
            <!-- Paint dots floating -->
            <circle cx="10" cy="45" r="2" fill="#a07de0" opacity="0.5">
                <animate attributeName="cy" values="45;40;45" dur="3s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.5;0.8;0.5" dur="3s" repeatCount="indefinite"/>
            </circle>
            <circle cx="54" cy="38" r="1.5" fill="#c49df0" opacity="0.4">
                <animate attributeName="cy" values="38;33;38" dur="4s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.4;0.7;0.4" dur="4s" repeatCount="indefinite"/>
            </circle>
            <circle cx="8" cy="55" r="1.2" fill="#d4b0f8" opacity="0.3">
                <animate attributeName="cy" values="55;50;55" dur="3.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="56" cy="52" r="1.8" fill="#a07de0" opacity="0.35">
                <animate attributeName="cy" values="52;47;52" dur="2.8s" repeatCount="indefinite"/>
            </circle>
            <circle cx="14" cy="62" r="1" fill="#c49df0" opacity="0.3">
                <animate attributeName="cy" values="62;58;62" dur="3.2s" repeatCount="indefinite"/>
            </circle>
        </svg>`
    },
    {
        id: 'ido',
        name: 'עידו',
        color: 'cyan',
        desc: 'שומר הרובע. חזק, שתקן, וזהיר עם אנשים חדשים.',
        quest: 'רמז: הוא שומר על משהו שאף אחד לא יודע',
        portrait: `<svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Broad shoulders, standing with tension, fists -->
            <ellipse cx="32" cy="73" rx="16" ry="3" fill="#00e5ff" opacity="0.06"/>
            <!-- Body — broad -->
            <path d="M18 38 L14 72 L50 72 L46 38 C46 32, 42 28, 32 26 C22 28, 18 32, 18 38Z" fill="#0d1a28" stroke="#00e5ff" stroke-width="0.7" opacity="0.9"/>
            <!-- Shoulders emphasis -->
            <path d="M14 40 L18 36 L46 36 L50 40" stroke="#00e5ff" stroke-width="0.5" fill="none" opacity="0.3"/>
            <!-- Neck -->
            <rect x="28" y="22" width="8" height="6" rx="2" fill="#111e2e" opacity="0.8"/>
            <!-- Head -->
            <ellipse cx="32" cy="18" rx="9" ry="10" fill="#0f1c2a" stroke="#00e5ff" stroke-width="0.6" opacity="0.85"/>
            <!-- Face features — minimal, stern -->
            <line x1="28" y1="16" x2="31" y2="16" stroke="#00e5ff" stroke-width="0.6" opacity="0.4"/>
            <line x1="33" y1="16" x2="36" y2="16" stroke="#00e5ff" stroke-width="0.6" opacity="0.4"/>
            <line x1="30" y1="21" x2="34" y2="21" stroke="#00e5ff" stroke-width="0.5" opacity="0.3"/>
            <!-- Fists -->
            <ellipse cx="14" cy="58" rx="4" ry="5" fill="#0d1a28" stroke="#00e5ff" stroke-width="0.5" opacity="0.7"/>
            <ellipse cx="50" cy="58" rx="4" ry="5" fill="#0d1a28" stroke="#00e5ff" stroke-width="0.5" opacity="0.7"/>
            <!-- Tension lines -->
            <line x1="16" y1="42" x2="14" y2="56" stroke="#00e5ff" stroke-width="0.4" opacity="0.2"/>
            <line x1="48" y1="42" x2="50" y2="56" stroke="#00e5ff" stroke-width="0.4" opacity="0.2"/>
            <!-- Subtle glow at shoulders -->
            <ellipse cx="18" cy="36" rx="6" ry="3" fill="#00e5ff" opacity="0.04"/>
            <ellipse cx="46" cy="36" rx="6" ry="3" fill="#00e5ff" opacity="0.04"/>
        </svg>`
    },
    {
        id: 'dana',
        name: 'דנה',
        color: 'pink',
        desc: 'ילדה קטנה עם תיק גדול. אומרת שהיא מחפשת מישהו.',
        quest: 'רמז: היא יודעת יותר ממה שנראה',
        portrait: `<svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Small frame, slightly hunched, carrying bag -->
            <ellipse cx="32" cy="74" rx="12" ry="3" fill="#e06090" opacity="0.06"/>
            <!-- Body — small, slightly hunched -->
            <path d="M24 38 L22 72 L42 72 L40 38 C40 33, 37 30, 32 29 C27 30, 24 33, 24 38Z" fill="#1a1020" stroke="#e06090" stroke-width="0.6" opacity="0.9"/>
            <!-- Head — slightly tilted -->
            <ellipse cx="32" cy="24" rx="8" ry="9" fill="#180d1e" stroke="#e06090" stroke-width="0.6" opacity="0.85" transform="rotate(-5 32 24)"/>
            <!-- Hair strands -->
            <path d="M26 18 C24 14, 28 10, 32 12" stroke="#e06090" stroke-width="0.5" fill="none" opacity="0.4"/>
            <path d="M38 18 C40 14, 36 10, 32 12" stroke="#e06090" stroke-width="0.5" fill="none" opacity="0.4"/>
            <!-- Eyes — big, curious -->
            <circle cx="29" cy="23" r="1.5" fill="#e06090" opacity="0.35"/>
            <circle cx="35" cy="23" r="1.5" fill="#e06090" opacity="0.35"/>
            <!-- Bag — large relative to body -->
            <path d="M40 42 L48 44 L50 66 L42 68 Z" fill="#2a1525" stroke="#e06090" stroke-width="0.6" opacity="0.8"/>
            <line x1="42" y1="44" x2="48" y2="46" stroke="#e06090" stroke-width="0.4" opacity="0.3"/>
            <path d="M44 42 C46 38, 50 40, 48 44" stroke="#e06090" stroke-width="0.5" fill="none" opacity="0.5"/>
            <!-- Strap across body -->
            <line x1="40" y1="36" x2="44" y2="44" stroke="#e06090" stroke-width="0.6" opacity="0.4"/>
            <!-- Small glow from bag -->
            <ellipse cx="46" cy="56" rx="4" ry="6" fill="#e06090" opacity="0.06">
                <animate attributeName="opacity" values="0.06;0.12;0.06" dur="3s" repeatCount="indefinite"/>
            </ellipse>
        </svg>`
    }
];

// --- Intro scene data ---
const INTRO_SCENES = [
    {
        text: 'פעם היתה פה עיר. אנשים חיו, צחקו, רבו, אהבו. יום אחד — שתקו.',
        svg: `<svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- City silhouette fading -->
            <rect x="40" y="100" width="30" height="150" rx="2" fill="#1a2240" opacity="0.6"/>
            <rect x="80" y="70" width="40" height="180" rx="2" fill="#1a2240" opacity="0.5"/>
            <rect x="130" y="90" width="35" height="160" rx="2" fill="#1a2240" opacity="0.55"/>
            <rect x="175" y="50" width="50" height="200" rx="2" fill="#1a2240" opacity="0.45"/>
            <rect x="235" y="80" width="40" height="170" rx="2" fill="#1a2240" opacity="0.5"/>
            <rect x="285" y="60" width="45" height="190" rx="2" fill="#1a2240" opacity="0.55"/>
            <rect x="340" y="100" width="30" height="150" rx="2" fill="#1a2240" opacity="0.4"/>
            <!-- Fade overlay -->
            <rect x="0" y="200" width="400" height="100" fill="url(#fade1)"/>
            <defs><linearGradient id="fade1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#06080e" stop-opacity="0"/><stop offset="1" stop-color="#06080e"/></linearGradient></defs>
        </svg>`
    },
    {
        text: 'אנשים חדשים מגיעים. אחד-אחד. אף אחד לא יודע למה.',
        svg: `<svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Three small figures walking -->
            <ellipse cx="120" cy="220" rx="5" ry="14" fill="#1a2240" opacity="0.5"/>
            <circle cx="120" cy="200" r="5" fill="#1a2240" opacity="0.5"/>
            <ellipse cx="200" cy="225" rx="5" ry="14" fill="#1a2240" opacity="0.4"/>
            <circle cx="200" cy="205" r="5" fill="#1a2240" opacity="0.4"/>
            <ellipse cx="280" cy="222" rx="5" ry="14" fill="#1a2240" opacity="0.35"/>
            <circle cx="280" cy="202" r="5" fill="#1a2240" opacity="0.35"/>
            <!-- Path/road -->
            <path d="M0 260 Q100 240, 200 250 Q300 260, 400 245" stroke="#1a2240" stroke-width="1" fill="none" opacity="0.3"/>
            <!-- Dots of light -->
            <circle cx="120" cy="190" r="2" fill="#a07de0" opacity="0.3"><animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite"/></circle>
            <circle cx="200" cy="195" r="2" fill="#00e5ff" opacity="0.25"><animate attributeName="opacity" values="0.25;0.5;0.25" dur="4s" repeatCount="indefinite"/></circle>
            <circle cx="280" cy="192" r="2" fill="#e06090" opacity="0.2"><animate attributeName="opacity" values="0.2;0.45;0.2" dur="3.5s" repeatCount="indefinite"/></circle>
        </svg>`
    },
    {
        text: 'גם אתה הגעת. בלי שליחות, בלי סיבה. פשוט — פה.',
        svg: `<svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Single figure standing at gate -->
            <ellipse cx="200" cy="230" rx="6" ry="16" fill="#1a2240" opacity="0.6"/>
            <circle cx="200" cy="208" r="6" fill="#1a2240" opacity="0.6"/>
            <!-- Gate arch -->
            <path d="M140 250 L140 120 Q170 80, 200 75 Q230 80, 260 120 L260 250" stroke="#1a2240" stroke-width="2" fill="none" opacity="0.4"/>
            <!-- Light from gate -->
            <path d="M160 250 L180 130 Q200 105, 220 130 L240 250 Z" fill="#00e5ff" opacity="0.03">
                <animate attributeName="opacity" values="0.03;0.06;0.03" dur="4s" repeatCount="indefinite"/>
            </path>
        </svg>`
    },
    {
        text: 'ויש בך משהו מוזר. אנשים נפתחים אליך. שים לב.',
        svg: `<svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Central figure with glow -->
            <ellipse cx="200" cy="210" rx="6" ry="16" fill="#1a2240" opacity="0.6"/>
            <circle cx="200" cy="188" r="6" fill="#1a2240" opacity="0.6"/>
            <!-- Glow around figure -->
            <circle cx="200" cy="200" r="40" fill="#a07de0" opacity="0.04">
                <animate attributeName="r" values="40;55;40" dur="4s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.04;0.08;0.04" dur="4s" repeatCount="indefinite"/>
            </circle>
            <circle cx="200" cy="200" r="70" fill="#00e5ff" opacity="0.02">
                <animate attributeName="r" values="70;90;70" dur="5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.02;0.05;0.02" dur="5s" repeatCount="indefinite"/>
            </circle>
            <!-- Surrounding figures turning toward center -->
            <g opacity="0.4">
                <ellipse cx="120" cy="215" rx="5" ry="12" fill="#1a2240" transform="rotate(8 120 215)"/>
                <circle cx="121" cy="198" r="5" fill="#1a2240"/>
            </g>
            <g opacity="0.35">
                <ellipse cx="280" cy="218" rx="5" ry="12" fill="#1a2240" transform="rotate(-8 280 218)"/>
                <circle cx="279" cy="201" r="5" fill="#1a2240"/>
            </g>
            <g opacity="0.3">
                <ellipse cx="160" cy="230" rx="4.5" ry="11" fill="#1a2240" transform="rotate(5 160 230)"/>
                <circle cx="161" cy="214" r="4.5" fill="#1a2240"/>
            </g>
            <g opacity="0.3">
                <ellipse cx="245" cy="228" rx="4.5" ry="11" fill="#1a2240" transform="rotate(-6 245 228)"/>
                <circle cx="244" cy="212" r="4.5" fill="#1a2240"/>
            </g>
        </svg>`
    }
];

// =====================================================
// SPLASH SCREEN
// =====================================================
function initSplash() {
    createParticles('splash-particles', 25, ['#00e5ff', '#a07de0', '#e06090']);

    const btnStart = document.getElementById('btn-start');
    const btnContinue = document.getElementById('btn-continue');

    // Check for saved game
    if (hasSavedGame()) {
        btnContinue.style.display = 'block';
    }

    btnStart.addEventListener('click', () => {
        Audio.unlock();
        Audio.play('tap');
        Audio.startAmbient();
        resetState();
        goToScreen('name');
    });

    btnContinue.addEventListener('click', () => {
        Audio.unlock();
        Audio.play('tap');
        Audio.startAmbient();
        const saved = loadState();
        if (saved) {
            Object.assign(STATE, saved);
            // Go to the screen they were on, or exploration if past intro
            const targetScreen = STATE.screen === 'splash' ? 'name' : STATE.screen;
            goToScreen(targetScreen);
        }
    });

    // Set splash as initial current screen
    currentScreen = 'splash';
}

// =====================================================
// NAME INPUT SCREEN
// =====================================================
function initName() {
    createParticles('name-particles', 12, ['#a07de0', '#00e5ff']);

    const input = document.getElementById('input-name');
    const select = document.getElementById('select-class');
    const btn = document.getElementById('btn-enter');

    function checkValid() {
        const nameOk = input.value.trim().length >= 2;
        const classOk = select.value !== '';
        btn.disabled = !(nameOk && classOk);
    }

    input.addEventListener('input', checkValid);
    select.addEventListener('change', checkValid);

    btn.addEventListener('click', () => {
        if (btn.disabled) return;
        Audio.play('tap');
        STATE.playerName = input.value.trim();
        STATE.playerClass = select.value;
        STATE.introStep = 0;
        saveState();
        goToScreen('intro');
    });

    // Enter key
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !btn.disabled) {
            btn.click();
        }
    });
}

// =====================================================
// INTRO CINEMATIC SCREEN
// =====================================================
let introTyping = false;
let introTypeTimeout = null;

function initIntro() {
    const textEl = document.getElementById('intro-text');
    const dotsEl = document.getElementById('intro-dots');
    const bgEl = document.getElementById('intro-bg');
    const btnNext = document.getElementById('btn-intro-next');
    const btnSkip = document.getElementById('btn-intro-skip');

    // Create dots
    dotsEl.innerHTML = '';
    INTRO_SCENES.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'intro-dot';
        dotsEl.appendChild(dot);
    });

    function showScene(index) {
        if (index >= INTRO_SCENES.length) {
            STATE.introStep = INTRO_SCENES.length;
            saveState();
            goToScreen('exploration');
            return;
        }

        STATE.introStep = index;
        saveState();

        const scene = INTRO_SCENES[index];

        // Update dots
        dotsEl.querySelectorAll('.intro-dot').forEach((dot, i) => {
            dot.className = 'intro-dot';
            if (i < index) dot.classList.add('done');
            if (i === index) dot.classList.add('active');
        });

        // Update bg SVG
        bgEl.innerHTML = `<div class="intro-scene-svg">${scene.svg}</div>`;
        requestAnimationFrame(() => {
            const svgContainer = bgEl.querySelector('.intro-scene-svg');
            if (svgContainer) svgContainer.classList.add('visible');
        });

        // Type text
        typeText(textEl, scene.text);

        btnNext.textContent = index < INTRO_SCENES.length - 1 ? 'המשך' : 'נכנס לעיר';
    }

    function typeText(el, text) {
        introTyping = true;
        el.innerHTML = '';
        let i = 0;
        const cursor = document.createElement('span');
        cursor.className = 'cursor';

        function tick() {
            if (i < text.length) {
                // Remove cursor, add char, re-add cursor
                if (el.contains(cursor)) el.removeChild(cursor);
                el.appendChild(document.createTextNode(text[i]));
                el.appendChild(cursor);
                i++;
                Audio.play('type');
                introTypeTimeout = setTimeout(tick, 35 + Math.random() * 25);
            } else {
                introTyping = false;
            }
        }
        tick();
    }

    function skipTyping() {
        if (introTyping) {
            clearTimeout(introTypeTimeout);
            introTyping = false;
            const scene = INTRO_SCENES[STATE.introStep];
            textEl.innerHTML = scene.text + '<span class="cursor"></span>';
        }
    }

    btnNext.addEventListener('click', () => {
        Audio.play('tap');
        if (introTyping) {
            skipTyping();
            return;
        }
        showScene(STATE.introStep + 1);
    });

    btnSkip.addEventListener('click', () => {
        Audio.play('tap');
        clearTimeout(introTypeTimeout);
        introTyping = false;
        STATE.introStep = INTRO_SCENES.length;
        saveState();
        goToScreen('exploration');
    });

    // Start first scene when entering
    EventBus.on('screen:enter', (screen) => {
        if (screen === 'intro') {
            showScene(STATE.introStep < INTRO_SCENES.length ? STATE.introStep : 0);
        }
    });
}

// =====================================================
// EXPLORATION SCREEN
// =====================================================
function initExploration() {
    const npcGrid = document.getElementById('npc-grid');
    const hudAvatar = document.getElementById('hud-avatar');
    const hudName = document.getElementById('hud-name');
    const shardCount = document.getElementById('hud-shard-count');
    const btnGarden = document.getElementById('btn-garden-hud');

    function showReplayConfirm(npc, cardEl) {
        // Remove any existing confirm overlay
        const existing = document.querySelector('.replay-confirm');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'replay-confirm';
        overlay.innerHTML = `
            <div class="replay-confirm-box">
                <p>לשחק שוב? ${npc.name} תזכור שכבר דיברתם.</p>
                <div class="replay-confirm-buttons">
                    <button class="replay-btn replay-yes">כן, מהתחלה</button>
                    <button class="replay-btn replay-no">לא</button>
                </div>
            </div>
        `;

        document.getElementById('screen-exploration').appendChild(overlay);

        overlay.querySelector('.replay-yes').addEventListener('click', () => {
            Audio.play('tap');
            overlay.remove();
            // Reset this NPC's dialogue state — but preserve memory
            STATE.completedNpcs = STATE.completedNpcs.filter(id => id !== npc.id);
            // DO NOT delete talked_ flag — NPC remembers you talked before
            // DO NOT delete remember_ flags — memories persist across replays
            // Reset trust to trustStart
            STATE.trust[npc.id] = (typeof DIALOGUE_DATA !== 'undefined' && DIALOGUE_DATA[npc.id])
                ? (DIALOGUE_DATA[npc.id].trustStart || 50) : 50;
            // Mark as replayed
            STATE.flags[`replayed_${npc.id}`] = true;
            saveState();
            Dialogue.startDialogue(npc.id);
        });

        overlay.querySelector('.replay-no').addEventListener('click', () => {
            Audio.play('tap');
            overlay.remove();
        });

        // Close on overlay background click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    function renderExploration() {
        // HUD
        hudAvatar.textContent = STATE.playerName ? STATE.playerName.charAt(0) : '?';
        hudName.textContent = STATE.playerName || 'אורח';
        shardCount.textContent = STATE.shards.length;

        // NPC cards
        npcGrid.innerHTML = '';
        NPCS.forEach(npc => {
            const isCompleted = STATE.completedNpcs.includes(npc.id);
            const card = document.createElement('div');
            card.className = 'npc-card' + (isCompleted ? ' npc-completed' : '');
            card.setAttribute('data-color', npc.color);
            card.innerHTML = `
                <div class="npc-portrait">${npc.portrait}</div>
                <div class="npc-info">
                    <div class="npc-name">
                        <span>${npc.name}</span>
                        <span class="quest-marker"></span>
                        <svg class="npc-completed-check" width="16" height="16" viewBox="0 0 24 24" fill="#4caf50"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                    </div>
                    <div class="npc-desc">${npc.desc}</div>
                    <div class="npc-quest">${npc.quest}</div>
                </div>
            `;

            card.addEventListener('click', () => {
                Audio.play('tap');
                // Stage 2: open dialogue engine
                if (typeof Dialogue !== 'undefined' && Dialogue.startDialogue) {
                    if (isCompleted) {
                        // Show replay confirmation
                        showReplayConfirm(npc, card);
                    } else {
                        Dialogue.startDialogue(npc.id);
                    }
                } else {
                    // Fallback: Stage 1 behavior
                    if (!STATE.completedNpcs.includes(npc.id)) {
                        STATE.completedNpcs.push(npc.id);
                        STATE.trust[npc.id] = Math.min(100, STATE.trust[npc.id] + 10);
                        STATE.journal.push({
                            text: `פגשת את ${npc.name} ברובע השקט`,
                            time: Date.now()
                        });
                        saveState();
                        renderExploration();
                    }
                }
            });

            npcGrid.appendChild(card);
        });
    }

    btnGarden.addEventListener('click', () => {
        Audio.play('tap');
        STATE._returnScreen = 'exploration';
        goToScreen('garden');
    });

    // Bottom nav — map is active, others disabled for now
    document.getElementById('nav-map').addEventListener('click', () => { Audio.play('tap'); });

    EventBus.on('screen:enter', (screen) => {
        if (screen === 'exploration') {
            renderExploration();
        }
    });
}

// =====================================================
// QUIET GARDEN SCREEN
// =====================================================
function initGarden() {
    createParticles('garden-particles', 15, ['rgba(160,125,224,0.25)', 'rgba(200,170,240,0.2)', 'rgba(0,229,255,0.1)']);

    const btnBack = document.getElementById('btn-garden-back');
    const guide = document.getElementById('breathing-guide');
    let breathInterval = null;

    function startBreathingGuide() {
        const phrases = ['שאף פנימה...', 'נשוף החוצה...'];
        let i = 0;
        if (guide) guide.textContent = phrases[0];
        breathInterval = setInterval(() => {
            i = (i + 1) % phrases.length;
            if (guide) guide.textContent = phrases[i];
        }, 3000);
    }

    function stopBreathingGuide() {
        if (breathInterval) { clearInterval(breathInterval); breathInterval = null; }
    }

    btnBack.addEventListener('click', () => {
        Audio.play('tap');
        stopBreathingGuide();
        const returnTo = STATE._returnScreen || 'exploration';
        goToScreen(returnTo);
    });

    EventBus.on('screen:enter', (screen) => {
        if (screen === 'garden') {
            STATE.gardenVisits++;
            saveState();
            Audio.stopAmbient();
            startBreathingGuide();
        }
    });

    EventBus.on('screen:leave', (screen) => {
        if (screen === 'garden') {
            stopBreathingGuide();
            if (!STATE.audioMuted) Audio.startAmbient();
        }
    });
}

// =====================================================
// INIT ALL
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    initSplash();
    initName();
    initIntro();
    initExploration();
    initGarden();
});
