"use client";

import { ShaderGradientCanvas, ShaderGradient } from 'shadergradient';
import { useScroll, useMotionValueEvent } from 'motion/react';
import { useState } from 'react';

export function ShaderBackground() {
  const { scrollYProgress } = useScroll();
  const [isVisible, setIsVisible] = useState(true);

  // Hide the shader once we scroll past the PremiumFeatures section
  // PremiumFeatures is roughly 400vh tall, Hero is 100vh. 
  // We can just track if we are past a certain scroll percentage.
  // A cleaner way is just absolute positioning. Let's use absolute with sticky.
  
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden opacity-100">
      <div className="sticky top-0 w-full h-screen">
        <ShaderGradientCanvas
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          {/* @ts-ignore */}
          <ShaderGradient {...{
            animate: "on", axesHelper: "off", bgColor1: "transparent", bgColor2: "transparent", brightness: 0.8, cAzimuthAngle: 270, cDistance: 14, cPolarAngle: 180, cameraZoom: 5, color1: "#73bfc4", color2: "#ff810a", color3: "#8da0ce", destination: "onCanvas", embedMode: "off", envPreset: "city", format: "gif", fov: 45, frameRate: 10, gizmoHelper: "hide", grain: "off", lightType: "env", pixelDensity: 1, positionX: -0.1, positionY: 0, positionZ: 0, range: "disabled", rangeEnd: 40, rangeStart: 0, reflection: 0.4, rotationX: 0, rotationY: 130, rotationZ: 70, shader: "defaults", type: "sphere", uAmplitude: 3.2, uDensity: 0.8, uFrequency: 5.5, uSpeed: 0.2, uStrength: 8.5, uTime: 0, wireframe: false, zoomOut: true
          }} />
        </ShaderGradientCanvas>
      </div>
    </div>
  );
}
