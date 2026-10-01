"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "motion/react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-[75px] h-9" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="font-anthropic-sans font-medium text-[13px] text-slate-dark/70 dark:text-white/70 hover:text-slate-dark dark:hover:text-white transition-colors relative flex items-center justify-center w-[75px] h-9 overflow-hidden"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={isDark ? "dark" : "light"}
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -15, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute"
        >
          {isDark ? "Light" : "Dark"}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
