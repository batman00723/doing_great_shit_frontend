"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";

export function VHSTape({
  title,
  date,
  customer,
  index = 0,
  compact = false,
}: {
  title: string;
  date: string;
  customer: string;
  index?: number;
  compact?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`@container relative w-full ${compact ? 'max-w-full' : 'max-w-4xl'} mx-auto group cursor-pointer perspective-[1000px] transition-all duration-300 ${hovered ? 'z-50' : 'z-10'}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        animate={{
          y: hovered ? -20 : 0,
          scale: hovered ? 1.15 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative w-full aspect-[1.8] transition-transform duration-300"
      >
        {/* We use object-contain so the VHS tape is NEVER cropped, making percentage offsets perfectly reliable */}
        <Image
          src="/images/vhs-tape-custom.webp"
          alt="VHS Tape"
          fill
          className="object-contain pointer-events-none"
          priority
        />

        {/* The Text Overlay (constrained tightly to fit inside the white paper label strip) */}
        <div className="absolute inset-0 pointer-events-none z-10 w-full h-full">
          {/* A constrained inner container that exactly matches the physical dimensions and position of the label on the image */}
          <div 
            className="absolute flex flex-col items-start justify-center text-left overflow-hidden px-[1cqw]" 
            style={{ 
              left: '33%', 
              width: '36%', 
              top: '32%', 
              height: '34%' 
            }}
          >
            <span className="font-anthropic-mono text-[1.5cqw] uppercase tracking-[0.2em] text-[#1a1a1a]/50 mb-[0.5cqw]">
              No.{(index + 1).toString().padStart(3, "0")}
            </span>
            
            {/* Using inline style for handwriting font to bypass Tailwind v4 compilation issues */}
            <h3 
              className="text-[3cqw] leading-[1.1] text-[#1a1a1a] line-clamp-2 w-full" 
              style={{ fontFamily: 'var(--font-caveat), cursive' }}
              title={title}
            >
              {title}
            </h3>
            
            <div className="flex items-center justify-start gap-[1cqw] mt-[0.5cqw] w-full">
              <span 
                className="text-[2cqw] text-[#1a1a1a]/80 truncate max-w-[60%]"
                style={{ fontFamily: 'var(--font-caveat), cursive' }}
              >
                {customer}
              </span>
              <span className="text-[#1a1a1a]/40 text-[1.5cqw] shrink-0">•</span>
              <span 
                className="text-[2cqw] text-[#1a1a1a]/80 shrink-0"
                style={{ fontFamily: 'var(--font-caveat), cursive' }}
              >
                {date}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
