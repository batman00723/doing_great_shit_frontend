"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";

export function VHSTape({
  title,
  date,
  customer,
  index = 0,
}: {
  title: string;
  date: string;
  customer: string;
  index?: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative w-full max-w-4xl mx-auto group cursor-pointer perspective-[1000px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        animate={{
          y: hovered ? -8 : 0,
          scale: hovered ? 1.04 : 1,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="relative w-full aspect-[21/9] transition-transform duration-300"
      >
        {/* We now use the transparent PNG so there is ZERO background or square artifacts */}
        <Image
          src="/images/vhs-tape-custom.png"
          alt="VHS Tape"
          fill
          className="object-cover pointer-events-none"
          priority
        />

        {/* The Text Overlay (positioned directly over the tape) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-12 z-10">
            
            <span className="font-anthropic-mono text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#1a1a1a]/60 mb-2">
              No.{(index + 1).toString().padStart(3, "0")}
            </span>
            
            {/* Switched text color to black */}
            <h3 className="font-anthropic-serif text-2xl md:text-3xl text-[#1a1a1a]/90 text-center leading-snug max-w-[80%] truncate">
              {title}
            </h3>
            
            <div className="flex items-center gap-4 mt-3">
              <span className="font-anthropic-sans text-xs md:text-sm text-[#1a1a1a]/80 font-medium tracking-wide">
                {customer}
              </span>
              <span className="text-[#1a1a1a]/40 text-[10px]">•</span>
              <span className="font-anthropic-mono text-[10px] md:text-xs text-[#1a1a1a]/70 uppercase tracking-widest">
                {date}
              </span>
            </div>
            
        </div>
      </motion.div>
    </div>
  );
}
