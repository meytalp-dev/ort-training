/* =====================================================
   העיר האבודה — Game Engine
   State machine, event bus, audio, save/load
   ===================================================== */

// --- State ---
const DEFAULT_STATE = {
    screen: 'splash',
    playerName: '',
    playerClass: '',
    introStep: 0,
    trust: { noa: 50, ido: 50, dana: 50 },
    flags: {},
    shards: [],
    journal: [],
    completedNpcs: [],
    gardenVisits: 0,
    audioMuted: false
};

let STATE = JSON.parse(JSON.stringify(DEFAULT_STATE));

const STORAGE_KEY = 'lost-city-save';

function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE));
    } catch (e) { /* quota exceeded — silent */ }
}

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const saved = JSON.parse(raw);
            return saved;
        }
    } catch (e) { /* corrupt data — silent */ }
    return null;
}

function hasSavedGame() {
    const saved = loadState();
    return saved && saved.playerName && saved.playerName.length > 0;
}

function resetState() {
    STATE = JSON.parse(JSON.stringify(DEFAULT_STATE));
    saveState();
}

// --- Event Bus ---
const EventBus = {
    _listeners: {},
    on(event, fn) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(fn);
    },
    off(event, fn) {
        if (!this._listeners[event]) return;
        this._listeners[event] = this._listeners[event].filter(f => f !== fn);
    },
    emit(event, data) {
        if (!this._listeners[event]) return;
        this._listeners[event].forEach(fn => fn(data));
    }
};

// --- Screen Router ---
let currentScreen = null;
let transitioning = false;

function goToScreen(screenId) {
    if (transitioning) return;
    if (currentScreen === screenId) return;

    transitioning = true;
    const oldEl = currentScreen ? document.getElementById('screen-' + currentScreen) : null;
    const newEl = document.getElementById('screen-' + screenId);

    if (!newEl) {
        transitioning = false;
        return;
    }

    // Update state
    STATE.screen = screenId;
    saveState();

    // Exit old
    if (oldEl) {
        oldEl.classList.add('exiting');
        oldEl.classList.remove('active');
    }

    // Enter new
    setTimeout(() => {
        newEl.classList.add('active');
        if (oldEl) {
            setTimeout(() => {
                oldEl.classList.remove('exiting');
            }, 550);
        }
        currentScreen = screenId;
        transitioning = false;
        EventBus.emit('screen:enter', screenId);
    }, oldEl ? 300 : 10);

    EventBus.emit('screen:leave', currentScreen);

    // Play transition sound
    Audio.play('transition');
}

// --- Audio System (Web Audio API, procedural) ---
const Audio = (() => {
    let ctx = null;
    let masterGain = null;
    let ambientNodes = [];
    let unlocked = false;

    function getContext() {
        if (!ctx) {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
            masterGain = ctx.createGain();
            masterGain.connect(ctx.destination);
            masterGain.gain.value = STATE.audioMuted ? 0 : 1;
        }
        return ctx;
    }

    function unlock() {
        if (unlocked) return;
        const c = getContext();
        if (c.state === 'suspended') {
            c.resume();
        }
        // iOS unlock: play silent buffer
        const buf = c.createBuffer(1, 1, 22050);
        const src = c.createBufferSource();
        src.buffer = buf;
        src.connect(c.destination);
        src.start(0);
        unlocked = true;
    }

    function play(type) {
        if (STATE.audioMuted) return;
        try {
            const c = getContext();
            if (c.state === 'suspended') c.resume();

            switch (type) {
                case 'tap': playTap(c); break;
                case 'transition': playTransition(c); break;
                case 'type': playType(c); break;
            }
        } catch (e) { /* silent */ }
    }

    function playTap(c) {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, c.currentTime + 0.08);
        gain.gain.setValueAtTime(0.08, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(c.currentTime);
        osc.stop(c.currentTime + 0.1);
    }

    function playTransition(c) {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(500, c.currentTime + 0.3);
        gain.gain.setValueAtTime(0.06, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(c.currentTime);
        osc.stop(c.currentTime + 0.4);
    }

    function playType(c) {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        const freq = 500 + Math.random() * 200;
        osc.frequency.setValueAtTime(freq, c.currentTime);
        gain.gain.setValueAtTime(0.03, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(c.currentTime);
        osc.stop(c.currentTime + 0.05);
    }

    function startAmbient() {
        if (STATE.audioMuted) return;
        try {
            const c = getContext();
            if (c.state === 'suspended') c.resume();

            // Low drone
            const drone = c.createOscillator();
            const droneGain = c.createGain();
            drone.type = 'sine';
            drone.frequency.setValueAtTime(55, c.currentTime);
            droneGain.gain.setValueAtTime(0.04, c.currentTime);
            drone.connect(droneGain);
            droneGain.connect(masterGain);
            drone.start(c.currentTime);
            ambientNodes.push({ osc: drone, gain: droneGain });

            // Subtle higher harmonic
            const harm = c.createOscillator();
            const harmGain = c.createGain();
            harm.type = 'sine';
            harm.frequency.setValueAtTime(110, c.currentTime);
            harmGain.gain.setValueAtTime(0.015, c.currentTime);
            harm.connect(harmGain);
            harmGain.connect(masterGain);
            harm.start(c.currentTime);
            ambientNodes.push({ osc: harm, gain: harmGain });

            // Wind noise via filtered noise
            const bufferSize = c.sampleRate * 2;
            const noiseBuffer = c.createBuffer(1, bufferSize, c.sampleRate);
            const data = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = c.createBufferSource();
            noise.buffer = noiseBuffer;
            noise.loop = true;
            const noiseFilter = c.createBiquadFilter();
            noiseFilter.type = 'lowpass';
            noiseFilter.frequency.setValueAtTime(200, c.currentTime);
            const noiseGain = c.createGain();
            noiseGain.gain.setValueAtTime(0.012, c.currentTime);
            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(masterGain);
            noise.start(c.currentTime);
            ambientNodes.push({ osc: noise, gain: noiseGain });

        } catch (e) { /* silent */ }
    }

    function stopAmbient() {
        ambientNodes.forEach(n => {
            try {
                n.gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
                setTimeout(() => { try { n.osc.stop(); } catch(e){} }, 600);
            } catch (e) { /* already stopped */ }
        });
        ambientNodes = [];
    }

    function setMuted(muted) {
        STATE.audioMuted = muted;
        saveState();
        if (masterGain) {
            masterGain.gain.setValueAtTime(muted ? 0 : 1, ctx.currentTime);
        }
        if (muted) {
            stopAmbient();
        } else {
            startAmbient();
        }
        updateMuteUI();
    }

    function updateMuteUI() {
        const btn = document.getElementById('audio-toggle');
        if (!btn) return;
        const iconOn = btn.querySelector('.icon-sound-on');
        const iconOff = btn.querySelector('.icon-sound-off');
        if (STATE.audioMuted) {
            iconOn.style.display = 'none';
            iconOff.style.display = 'block';
        } else {
            iconOn.style.display = 'block';
            iconOff.style.display = 'none';
        }
    }

    return { getContext, unlock, play, startAmbient, stopAmbient, setMuted, updateMuteUI };
})();

// --- Particle Generator ---
function createParticles(containerId, count, colors) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = 2 + Math.random() * 4;
        const left = Math.random() * 100;
        const delay = Math.random() * 15;
        const duration = 10 + Math.random() * 15;
        const driftX = -40 + Math.random() * 80;
        p.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            left: ${left}%;
            bottom: -10px;
            animation-delay: ${delay}s;
            animation-duration: ${duration}s;
            --drift-x: ${driftX}px;
            box-shadow: 0 0 ${size * 2}px ${color};
        `;
        container.appendChild(p);
    }
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    // Audio toggle
    const audioBtn = document.getElementById('audio-toggle');
    audioBtn.addEventListener('click', () => {
        Audio.unlock();
        Audio.setMuted(!STATE.audioMuted);
        Audio.play('tap');
    });

    // First interaction unlock
    document.addEventListener('click', () => {
        Audio.unlock();
    }, { once: true });
    document.addEventListener('touchstart', () => {
        Audio.unlock();
    }, { once: true });

    Audio.updateMuteUI();
});
