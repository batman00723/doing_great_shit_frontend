"use client";

import { motion, useScroll, useTransform, useMotionValue, useSpring } from "motion/react";
import { useEffect } from "react";

export function SolarSystemBackground() {
  const { scrollY } = useScroll();
  const yOffset = useTransform(scrollY, [0, 1000], [0, -250]);
  const scale = useTransform(scrollY, [0, 800], [1, 0.85]);
  const opacity = useTransform(scrollY, [0, 800], [1, 0]);

  // Mouse tracking for fluid 3D parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Spring physics for buttery smooth tilt
  const rotateX = useSpring(useTransform(mouseY, [-1, 1], [25, -25]), { stiffness: 70, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-1, 1], [-25, 25]), { stiffness: 70, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth) * 2 - 1);
      mouseY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div 
      style={{ y: yOffset, scale, opacity }}
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center bg-transparent"
    >
      {/* Ambient background bloom */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(253,250,246,0.1)_0%,rgba(245,240,235,0.4)_100%)]" />

      {/* Interactive 3D Canvas */}
      <motion.div 
        style={{ rotateX, rotateY }}
        className="relative flex items-center justify-center w-full h-full [perspective:1200px] [transform-style:preserve-3d]"
      >
        {/* The Blazing Core */}
        <div className="absolute flex items-center justify-center [transform:translateZ(50px)]">
           <div className="absolute w-[200px] h-[200px] bg-clay/10 rounded-full blur-[50px] animate-[pulse_3s_ease-in-out_infinite]" />
           <div className="absolute w-[80px] h-[80px] bg-gradient-to-tr from-clay-deep via-clay to-manilla rounded-full shadow-[0_0_80px_rgba(200,100,80,0.8)] animate-[pulse_1.5s_ease-in-out_infinite]" />
           <div className="absolute w-[30px] h-[30px] bg-white rounded-full shadow-[0_0_40px_rgba(255,255,255,1)]" />
        </div>

        {/* Axis 1 - Fast Vertical Spin */}
        <motion.div 
          animate={{ rotateY: 360, rotateZ: 30 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute w-[350px] h-[350px] border border-clay/40 rounded-full [transform-style:preserve-3d]"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 w-4 h-4 bg-clay shadow-[0_0_20px_rgba(200,100,80,1)] rounded-full [transform:rotateX(-90deg)]" />
        </motion.div>

        {/* Axis 2 - Fast Horizontal Spin */}
        <motion.div 
          animate={{ rotateX: 360, rotateZ: -20 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute w-[550px] h-[550px] border border-stone/30 rounded-full [transform-style:preserve-3d]"
        >
          <div className="absolute top-1/2 right-0 -translate-y-1/2 -mr-3 w-6 h-6 bg-slate-dark shadow-[0_0_20px_rgba(0,0,0,0.5)] rounded-full [transform:rotateY(-90deg)]" />
        </motion.div>

        {/* Axis 3 - Tilted Diagonal High-Speed Spin */}
        <motion.div 
          animate={{ rotateZ: 360 }}
          style={{ rotateX: 60, rotateY: 45 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="absolute w-[750px] h-[750px] border-[2px] border-manilla/40 border-dashed rounded-full [transform-style:preserve-3d]"
        >
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -mb-4 w-8 h-8 bg-manilla shadow-[0_0_30px_rgba(250,200,100,0.8)] rounded-full flex items-center justify-center [transform:rotateX(-60deg)]">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-2 h-2 bg-white rounded-full absolute -top-4 shadow-[0_0_10px_rgba(255,255,255,1)]" />
          </div>
        </motion.div>

        {/* Axis 4 - Reverse Massive Orbit */}
        <motion.div 
          animate={{ rotateZ: -360 }}
          style={{ rotateX: -50, rotateY: -30 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-[1000px] h-[1000px] border border-clay/20 rounded-full [transform-style:preserve-3d]"
        >
          <div className="absolute top-1/4 left-0 -ml-6 w-12 h-12 bg-white/20 backdrop-blur-xl border border-white/60 shadow-[0_0_40px_rgba(255,255,255,0.6)] rounded-full [transform:rotateY(90deg)]" />
        </motion.div>

        {/* Axis 5 - Bounding Outer Halo */}
        <motion.div 
          animate={{ rotateZ: 360 }}
          style={{ rotateX: 75, rotateY: 10 }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="absolute w-[1300px] h-[1300px] border border-stone/10 rounded-full [transform-style:preserve-3d]"
        >
          <div className="absolute right-1/4 bottom-0 w-3 h-3 bg-stone shadow-[0_0_15px_rgba(0,0,0,0.3)] rounded-full" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
