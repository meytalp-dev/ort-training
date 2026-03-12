import { motion, type Variants } from "framer-motion";
import { ReactNode } from "react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1 },
};

const slideRight: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 },
};

const slideLeft: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
};

type AnimationType = "fadeUp" | "fadeIn" | "scaleIn" | "slideRight" | "slideLeft";

const variants: Record<AnimationType, Variants> = {
  fadeUp,
  fadeIn,
  scaleIn,
  slideRight,
  slideLeft,
};

interface AnimatedProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  type?: AnimationType;
  className?: string;
}

export function Animated({
  children,
  delay = 0,
  duration = 0.5,
  type = "fadeUp",
  className = "",
}: AnimatedProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants[type]}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerProps {
  children: ReactNode;
  stagger?: number;
  delay?: number;
  className?: string;
}

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export function Stagger({ children, stagger = 0.1, delay = 0, className = "" }: StaggerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  type = "fadeUp",
  className = "",
}: {
  children: ReactNode;
  type?: AnimationType;
  className?: string;
}) {
  return (
    <motion.div variants={variants[type]} transition={{ duration: 0.45, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}
