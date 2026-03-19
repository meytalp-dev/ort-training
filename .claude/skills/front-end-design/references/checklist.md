# Pre-Delivery Checklist

בדוק הכל לפני שמסיירים HTML.

---

## ויזואל

- [ ] לא Inter/Roboto/Arial – פונט מובחן
- [ ] רקע עם עומק (gradient / pattern / mesh) – לא solid color
- [ ] shadows בשכבות (sm → md → lg on hover) – לא shadow שטוח יחיד
- [ ] כרטיסי glass: `bg-white/80` לפחות – לא `bg-white/10`
- [ ] border גלוי בlight mode
- [ ] אין purple gradient על לבן
- [ ] אין uniform rounded corners בכל מקום
- [ ] היררכיה ויזואלית ברורה: תמונה → כותרת → טקסט → CTA

## אינטראקציה

- [ ] `cursor: pointer` על כל אלמנט לחיץ
- [ ] hover state על כל כרטיס/כפתור
- [ ] transitions 150-300ms בלבד
- [ ] אנימציות: `transform/opacity` בלבד – לא `width/height`
- [ ] page-load מתוזמר (staggered) עם animation-delay
- [ ] אין scroll hijacking

## נגישות

- [ ] contrast 4.5:1 לטקסט רגיל, 3:1 לגדול
- [ ] כל כפתור = `<button>` לא `<div onClick>`
- [ ] focus-visible גלוי על כל אלמנט אינטראקטיבי
- [ ] alt text לכל תמונה (ריק `alt=""` לדקורטיבי)
- [ ] `<main>`, `<nav>`, `<header>`, `<footer>` landmarks
- [ ] touch targets ≥ 44px
- [ ] `prefers-reduced-motion` מוגדר

## RTL / עברית

- [ ] `html { direction: rtl; }`
- [ ] פונט תומך עברית (Heebo / Rubik)
- [ ] tab order עוקב ימין לשמאל

## Layout

- [ ] Floating navbar עם spacing מקצוות
- [ ] תוכן לא מוסתר מאחורי header קבוע
- [ ] max-width עקבי לאורך כל הדף
- [ ] responsive: 375px, 768px, 1024px, 1440px
- [ ] אין horizontal scroll במובייל

## אייקונים וטקסט

- [ ] SVG inline – לא אימוג'י כאייקוני ממשק
- [ ] אין "pivotal / seamless / robust / cutting-edge"
- [ ] אין "-ing phrases" ריקות
- [ ] שפה פעילה, קונקרטית, קצרה

## 30-Second Test

לפני סיום, שאל: **האם תוך 30 שניות ברור מי, מה, ומה לעשות?**
