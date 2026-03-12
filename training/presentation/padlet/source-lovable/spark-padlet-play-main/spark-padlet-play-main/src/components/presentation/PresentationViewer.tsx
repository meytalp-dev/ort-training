import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Maximize, Minimize, Grid } from "lucide-react";
import Slide01 from "../slides/Slide01";
import Slide02 from "../slides/Slide02";
import Slide03 from "../slides/Slide03";
import Slide04 from "../slides/Slide04";
import Slide05 from "../slides/Slide05";
import Slide06 from "../slides/Slide06";
import Slide07 from "../slides/Slide07";
import Slide08 from "../slides/Slide08";
import Slide09 from "../slides/Slide09";
import Slide10 from "../slides/Slide10";
import Slide11 from "../slides/Slide11";
import Slide12 from "../slides/Slide12";
import Slide13 from "../slides/Slide13";
import Slide14 from "../slides/Slide14";
import Slide15 from "../slides/Slide15";

const slides = [
  Slide01, Slide02, Slide03, Slide04, Slide05,
  Slide06, Slide07, Slide08, Slide09, Slide10,
  Slide11, Slide12, Slide13, Slide14, Slide15,
];

const slideTitles = [
  "פתיחה", "סקר פתיחה", "כניסה למערכת", "כניסה למערכת (מפורט)", "יצירת לוח חדש",
  "הגדרת הלוח", "הוספת פוסטים", "שיתוף עם תלמידים", "הגדרת הרשאות", "שימוש ראשון",
  "סיכום שיעור", "העלאת עבודות", "בינה מלאכותית", "טעויות נפוצות", "התנסות",
];

export default function PresentationViewer() {
  const [current, setCurrent] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [direction, setDirection] = useState(0);

  const next = useCallback(() => {
    if (current < slides.length - 1) {
      setDirection(-1);
      setCurrent(c => c + 1);
    }
  }, [current]);

  const prev = useCallback(() => {
    if (current > 0) {
      setDirection(1);
      setCurrent(c => c - 1);
    }
  }, [current]);

  const goTo = useCallback((idx: number) => {
    setDirection(idx > current ? -1 : 1);
    setCurrent(idx);
    setShowGrid(false);
  }, [current]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === " ") { e.preventDefault(); next(); }
      if (e.key === "ArrowRight") { e.preventDefault(); prev(); }
      if (e.key === "Escape" && showGrid) { setShowGrid(false); }
      if (e.key === "g" || e.key === "G") { setShowGrid(g => !g); }
      if (e.key === "f" || e.key === "F5") { e.preventDefault(); toggleFullscreen(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, toggleFullscreen, showGrid]);

  // Auto-hide controls in fullscreen
  useEffect(() => {
    if (!isFullscreen) { setShowControls(true); return; }
    let timer: ReturnType<typeof setTimeout>;
    const onMove = () => {
      setShowControls(true);
      clearTimeout(timer);
      timer = setTimeout(() => setShowControls(false), 2500);
    };
    window.addEventListener("mousemove", onMove);
    timer = setTimeout(() => setShowControls(false), 2500);
    return () => { window.removeEventListener("mousemove", onMove); clearTimeout(timer); };
  }, [isFullscreen]);

  const CurrentSlide = slides[current];

  if (showGrid) {
    return (
      <div className="min-h-screen bg-muted p-8" dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-rubik font-bold text-foreground">כל השקפים</h2>
          <button onClick={() => setShowGrid(false)} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-heebo font-medium">
            חזרה למצגת
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {slides.map((Slide, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all hover:scale-105 hover:shadow-lg ${
                idx === current ? "border-primary shadow-lg ring-2 ring-primary/30" : "border-border"
              }`}
            >
              <div className="relative w-full h-full overflow-hidden">
                <Slide />
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-foreground/80 text-primary-foreground text-xs py-1 px-2 font-heebo">
                {idx + 1}. {slideTitles[idx]}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-screen overflow-hidden ${isFullscreen ? "bg-foreground" : "bg-muted"}`}>
      {/* Slide area */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              initial={{ opacity: 0, x: direction * -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * 100 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <CurrentSlide />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <motion.div
        initial={false}
        animate={{ opacity: showControls ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="pointer-events-none absolute inset-0 z-50"
      >
        {/* Top bar */}
        <div className="pointer-events-auto absolute top-0 inset-x-0 flex items-center justify-between px-4 py-3" dir="rtl">
          <div className="flex items-center gap-2">
            <span className="bg-foreground/70 text-primary-foreground text-sm px-3 py-1 rounded-full font-heebo">
              {current + 1} / {slides.length}
            </span>
            <span className="bg-foreground/70 text-primary-foreground text-sm px-3 py-1 rounded-full font-heebo hidden sm:block">
              {slideTitles[current]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowGrid(true)} className="p-2 rounded-lg bg-foreground/70 text-primary-foreground hover:bg-foreground/90 transition-colors">
              <Grid size={18} />
            </button>
            <button onClick={toggleFullscreen} className="p-2 rounded-lg bg-foreground/70 text-primary-foreground hover:bg-foreground/90 transition-colors">
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>
        </div>

        {/* Nav arrows - RTL: right arrow goes back, left arrow goes forward */}
        <button
          onClick={prev}
          disabled={current === 0}
          className="pointer-events-auto absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-foreground/50 text-primary-foreground hover:bg-foreground/80 disabled:opacity-20 transition-all"
        >
          <ChevronRight size={28} />
        </button>
        <button
          onClick={next}
          disabled={current === slides.length - 1}
          className="pointer-events-auto absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-foreground/50 text-primary-foreground hover:bg-foreground/80 disabled:opacity-20 transition-all"
        >
          <ChevronLeft size={28} />
        </button>

        {/* Bottom progress */}
        <div className="pointer-events-auto absolute bottom-4 inset-x-0 flex justify-center">
          <div className="flex gap-1.5 bg-foreground/50 rounded-full px-3 py-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={`rounded-full transition-all ${
                  idx === current
                    ? "w-6 h-2.5 bg-primary"
                    : "w-2.5 h-2.5 bg-primary-foreground/50 hover:bg-primary-foreground/80"
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
