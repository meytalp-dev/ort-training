import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { slides } from "./slides";

const spring = { type: "spring" as const, stiffness: 300, damping: 30, mass: 0.5 };

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

const Presentation = () => {
  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = useCallback(
    (newDirection: number) => {
      const newPage = page + newDirection;
      if (newPage >= 0 && newPage < slides.length) {
        setPage([newPage, newDirection]);
      }
    },
    [page]
  );

  const goToSlide = useCallback(
    (index: number) => {
      setPage([index, index > page ? 1 : -1]);
    },
    [page]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") paginate(-1);
      else if (e.key === "ArrowLeft") paginate(1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paginate]);

  const CurrentSlide = slides[page].component;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={page}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={spring}
          className="absolute inset-0"
        >
          <CurrentSlide />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="fixed bottom-6 right-6 flex items-center gap-3 z-50">
        <button
          onClick={() => paginate(1)}
          disabled={page === slides.length - 1}
          className="nav-button"
          aria-label="השקופית הבאה"
        >
          <ArrowLeft size={20} />
        </button>
        <button
          onClick={() => paginate(-1)}
          disabled={page === 0}
          className="nav-button"
          aria-label="השקופית הקודמת"
        >
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-50">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={page === i ? "dot-active" : "dot-inactive"}
            aria-label={`שקופית ${i + 1}`}
          />
        ))}
      </div>

      {/* Slide Number */}
      <div className="fixed bottom-6 left-6 text-muted-foreground text-sm z-50 font-medium">
        {page + 1} / {slides.length}
      </div>
    </div>
  );
};

export default Presentation;
