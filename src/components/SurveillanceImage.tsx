import React, { useState, useRef, useEffect } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';

interface SurveillanceImageProps {
  src: string;
  alt: string;
  className?: string;
  overlayClassName?: string;
  showViewfinder?: boolean;
  interactive?: boolean;
}

export const SurveillanceImage: React.FC<SurveillanceImageProps> = ({
  src,
  alt,
  className = "",
  overlayClassName = "",
  showViewfinder = true,
  interactive = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Motion values for parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for the parallax effect
  const springConfig = { damping: 25, stiffness: 150 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);
  const scale = useSpring(isHovered ? 1.1 : 1.05, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate distance from center (-1 to 1)
    const moveX = (e.clientX - centerX) / (rect.width / 2);
    const moveY = (e.clientY - centerY) / (rect.height / 2);

    // Set motion values (multiplied by intensity)
    mouseX.set(moveX * 15); // 15px max horizontal shift
    mouseY.set(moveY * 15); // 15px max vertical shift
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden bg-black group/surveillance ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Base Image with Parallax */}
      {!error ? (
        <motion.img
          src={src}
          alt=""
          style={{ x, y, scale }}
          onError={() => setError(true)}
          className="w-full h-full object-cover opacity-80 group-hover/surveillance:opacity-100 transition-opacity duration-700"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black p-4 text-center">
          <span className="text-[10px] font-mono text-foundation-muted uppercase tracking-[0.2em] font-bold">
            No Visual Data
          </span>
        </div>
      )}

      {/* CRT Scanlines Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.15] mix-blend-overlay bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      
      {/* Noise/Grain Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.05] mix-blend-screen animate-noise bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Technical Viewfinder UI */}
      {showViewfinder && (
        <div className={`absolute inset-0 pointer-events-none z-20 p-4 flex flex-col justify-between transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-40'} ${overlayClassName}`}>
          {/* Corners */}
          <div className="flex justify-between">
            <div className="w-4 h-4 border-t-2 border-l-2 border-foundation-accent/60" />
            <div className="w-4 h-4 border-t-2 border-r-2 border-foundation-accent/60" />
          </div>
          
          {/* Center Crosshair */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center">
            <div className="w-full h-[1px] bg-foundation-accent/30" />
            <div className="absolute w-[1px] h-full bg-foundation-accent/30" />
            <div className="absolute w-1 h-1 rounded-full bg-foundation-accent/50" />
          </div>

          <div className="flex justify-between items-end">
            <div className="w-4 h-4 border-b-2 border-l-2 border-foundation-accent/60" />
            
            {/* REC Indicator */}
            <div className="flex items-center gap-2 mb-1 mr-1">
              <div className="w-1.5 h-1.5 rounded-full bg-foundation-accent animate-pulse" />
              <span className="text-[8px] font-mono text-foundation-accent font-bold tracking-tighter">REC</span>
            </div>

            <div className="w-4 h-4 border-b-2 border-r-2 border-foundation-accent/60" />
          </div>
        </div>
      )}

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.6)_100%)]" />
    </div>
  );
};
