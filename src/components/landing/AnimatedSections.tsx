"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import {
  fadeIn,
  fadeInUp,
  fadeInScale,
  staggerContainer,
  staggerContainerSlow,
  springCalm,
  easeSoft,
  hoverScale,
  tapScale,
} from "@/lib/animations";

// ─────────────────────────────────────────────────────────────
// Reusable animation wrappers for the landing page.
// These are thin client-component shells that let the parent
// page remain a Server Component while adding scroll-triggered
// entrance animations.
// ─────────────────────────────────────────────────────────────

interface AnimatedSectionProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  /** Delay before this element starts animating (seconds) */
  delay?: number;
}

/** Fade-in-up on scroll into viewport (plays once) */
export function RevealOnScroll({
  children,
  className,
  delay = 0,
  ...props
}: AnimatedSectionProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ ...springCalm, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Fade-in (opacity only) on scroll into viewport */
export function FadeOnScroll({
  children,
  className,
  delay = 0,
  ...props
}: AnimatedSectionProps) {
  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ ...easeSoft, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Scale-fade on scroll into viewport */
export function ScaleOnScroll({
  children,
  className,
  delay = 0,
  ...props
}: AnimatedSectionProps) {
  return (
    <motion.div
      variants={fadeInScale}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ ...springCalm, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Stagger container — children with fadeInUp variants animate in sequence */
export function StaggerOnScroll({
  children,
  className,
  slow = false,
  ...props
}: AnimatedSectionProps & { slow?: boolean }) {
  return (
    <motion.div
      variants={slow ? staggerContainerSlow : staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-80px" }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Individual stagger child — use inside StaggerOnScroll */
export function StaggerChild({
  children,
  className,
  ...props
}: AnimatedSectionProps) {
  return (
    <motion.div
      variants={fadeInUp}
      transition={springCalm}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Animated CTA button wrapper — subtle scale on hover + press */
export function AnimatedButton({
  children,
  className,
  ...props
}: AnimatedSectionProps) {
  return (
    <motion.div
      whileHover={hoverScale}
      whileTap={tapScale}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Navbar — fades down from top on page load */
export function NavReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.nav>
  );
}
