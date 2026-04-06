---
name: gsap-animation
description: "GSAP animation expert — timelines, ScrollTrigger, SVG morphing, stagger effects, and performance optimization for web animations and game UI."
---

# GSAP Animation Expert

Professional web animation using GSAP (GreenSock Animation Platform). The industry standard for high-performance JavaScript animations.

## When to Use

- Animating UI elements (modals, menus, tooltips, cards)
- Page transitions and screen changes
- Scroll-triggered animations
- SVG path animations and morphing
- Game UI animations (HUD, score, health bars)
- Micro-interactions and "juice"

## Setup

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
```

## Core API

### Basic Tween
```javascript
// To — animate TO these values
gsap.to(".element", { x: 100, opacity: 1, duration: 0.5 });

// From — animate FROM these values
gsap.from(".element", { y: -50, opacity: 0, duration: 0.3 });

// FromTo — animate FROM...TO
gsap.fromTo(".element", { scale: 0 }, { scale: 1, duration: 0.4 });

// Set — instant, no animation
gsap.set(".element", { visibility: "visible" });
```

### Easing
```javascript
// Natural feeling
gsap.to(el, { x: 100, ease: "power2.out" });    // Decelerate (most common)
gsap.to(el, { x: 100, ease: "power2.in" });     // Accelerate
gsap.to(el, { x: 100, ease: "power2.inOut" });  // Both
gsap.to(el, { x: 100, ease: "back.out(1.7)" }); // Overshoot (playful)
gsap.to(el, { x: 100, ease: "elastic.out" });   // Bounce (celebration)
gsap.to(el, { x: 100, ease: "bounce.out" });    // Ball drop
```

**Rule of thumb:**
- UI transitions: `power2.out` (0.3s)
- Entrances: `back.out` (0.4s)
- Celebrations: `elastic.out` (0.6s)
- Exits: `power2.in` (0.2s — faster than entrances)

### Stagger (Multiple Elements)
```javascript
gsap.from(".card", {
  y: 50, opacity: 0, duration: 0.4,
  stagger: 0.1,  // 100ms between each
  ease: "power2.out"
});
```

## Timeline

```javascript
const tl = gsap.timeline({ defaults: { duration: 0.4, ease: "power2.out" } });

tl.from(".title", { y: -30, opacity: 0 })
  .from(".subtitle", { y: -20, opacity: 0 }, "-=0.2")  // overlap
  .from(".cards", { y: 30, opacity: 0, stagger: 0.1 }, "-=0.1")
  .from(".cta", { scale: 0, ease: "back.out" });
```

### Timeline Controls
```javascript
tl.play();
tl.pause();
tl.reverse();
tl.restart();
tl.progress(0.5);  // Jump to 50%
tl.timeScale(2);   // 2x speed
```

## ScrollTrigger

```javascript
gsap.registerPlugin(ScrollTrigger);

gsap.from(".section", {
  scrollTrigger: {
    trigger: ".section",
    start: "top 80%",      // when top of element hits 80% of viewport
    end: "bottom 20%",
    toggleActions: "play none none reverse",
    // markers: true,       // debug
  },
  y: 50, opacity: 0, duration: 0.6
});
```

### Pin (Sticky Sections)
```javascript
ScrollTrigger.create({
  trigger: ".hero",
  start: "top top",
  end: "+=500",
  pin: true
});
```

## Game UI Patterns

### Screen Shake
```javascript
function screenShake(intensity = 5, duration = 0.3) {
  const tl = gsap.timeline();
  const steps = 6;
  for (let i = 0; i < steps; i++) {
    tl.to(".game-container", {
      x: gsap.utils.random(-intensity, intensity),
      y: gsap.utils.random(-intensity, intensity),
      duration: duration / steps
    });
  }
  tl.to(".game-container", { x: 0, y: 0, duration: 0.1 });
  return tl;
}
```

### Score Pop
```javascript
function scorePop(element, points) {
  const tl = gsap.timeline();
  tl.to(element, { scale: 1.5, duration: 0.15, ease: "power2.out" })
    .to(element, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.3)" });
  return tl;
}
```

### Confetti Burst
```javascript
function confetti(container, count = 30) {
  for (let i = 0; i < count; i++) {
    const dot = document.createElement("div");
    dot.className = "confetti";
    dot.style.cssText = `position:absolute;width:8px;height:8px;border-radius:50%;background:hsl(${Math.random()*360},80%,60%)`;
    container.appendChild(dot);
    gsap.fromTo(dot,
      { x: 0, y: 0, scale: 0 },
      { x: gsap.utils.random(-150, 150), y: gsap.utils.random(-200, -50),
        scale: gsap.utils.random(0.5, 1.5), opacity: 0,
        duration: gsap.utils.random(0.6, 1.2), ease: "power2.out",
        onComplete: () => dot.remove()
      });
  }
}
```

### Progress Bar Fill
```javascript
function fillBar(bar, percent, duration = 0.5) {
  gsap.to(bar, { width: percent + "%", duration, ease: "power2.inOut" });
}
```

## Performance Rules

1. **Animate transforms and opacity ONLY** — `x`, `y`, `scale`, `rotation`, `opacity` are GPU-accelerated
2. **Never animate** `width`, `height`, `top`, `left`, `margin`, `padding` — causes layout reflow
3. **Use `will-change: transform`** on animated elements
4. **Use `gsap.ticker`** instead of `requestAnimationFrame` for synced animations
5. **Kill tweens when done**: `tl.kill()` or `gsap.killTweensOf(element)`
6. **Batch ScrollTriggers**: Use `ScrollTrigger.batch()` for many similar elements
