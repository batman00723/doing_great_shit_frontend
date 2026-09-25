// ─────────────────────────────────────────────────────────────
// Smriti Motion Design System
// Centralized animation variants for consistent, production-level
// motion across the entire application.
// ─────────────────────────────────────────────────────────────

import type { Variants, Transition } from "motion/react";

// ── Fade & Slide Variants ──────────────────────────────────

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

export const fadeInScale: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
};

export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

// ── Spring Transitions ─────────────────────────────────────

/** Claude-like calm spring: smooth deceleration, no bounce */
export const springCalm: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

/** Slightly bouncier for interactive elements (buttons, pills) */
export const springBouncy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 25,
};

/** Gentle ease for fades and opacity changes */
export const easeSoft: Transition = {
  duration: 0.4,
  ease: [0.25, 0.1, 0.25, 1],
};

/** Fast ease for micro-interactions */
export const easeFast: Transition = {
  duration: 0.2,
  ease: [0.25, 0.1, 0.25, 1],
};

// ── Stagger Containers ─────────────────────────────────────

/** Fast stagger — 60ms between children, 100ms initial delay */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

/** Slow stagger — 120ms between children, 150ms initial delay */
export const staggerContainerSlow: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

// ── Modal / Overlay ────────────────────────────────────────

export const overlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 10 },
};

// ── Toast ──────────────────────────────────────────────────

export const toastVariants: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 20, scale: 0.95 },
};

// ── Hover / Tap Presets ────────────────────────────────────

/** Subtle lift on hover — use with whileHover */
export const hoverLift = {
  y: -2,
  transition: { type: "spring" as const, stiffness: 400, damping: 25 },
};

/** Card lift on hover — slightly more pronounced */
export const hoverLiftCard = {
  y: -4,
  transition: { type: "spring" as const, stiffness: 300, damping: 25 },
};

/** Subtle scale for buttons */
export const hoverScale = {
  scale: 1.02,
  transition: { type: "spring" as const, stiffness: 400, damping: 25 },
};

/** Press/tap feedback */
export const tapScale = {
  scale: 0.98,
};
