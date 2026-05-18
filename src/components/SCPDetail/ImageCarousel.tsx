import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Maximize2, ExternalLink, ShieldAlert, Zap } from 'lucide-react';

interface ImageCarouselProps {
  images: { url: string; source?: string }[];
  designation: string;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, designation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    setMousePos({ x, y });
  };

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  if (images.length === 0) return null;

  return (
    <div 
      className="relative group glass-panel overflow-hidden border-t-2 border-t-foundation-accent bg-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Technical Viewfinder Overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity">
        {/* Corners */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-foundation-accent/50" />
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-foundation-accent/50" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-foundation-accent/50" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-foundation-accent/50" />
        
        {/* Center Crosshair */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-px bg-foundation-accent/30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-px bg-foundation-accent/30" />
        
        {/* Scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none" />
      </div>

      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.1, filter: 'brightness(0) contrast(2)' }}
            animate={{ 
              opacity: 1, 
              scale: isHovered ? 1.05 : 1,
              filter: 'brightness(1) contrast(1)',
              x: isHovered ? mousePos.x * 20 : 0,
              y: isHovered ? mousePos.y * 20 : 0
            }}
            exit={{ opacity: 0, scale: 0.95, filter: 'brightness(2) contrast(0.5)' }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full h-full"
          >
            <img
              src={images[currentIndex].url}
              alt={`${designation} visual data`}
              className="w-full h-full object-cover grayscale-[0.2] sepia-[0.1] contrast-[1.1]"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </AnimatePresence>

        {/* Glitch Overlay (Randomly appears) */}
        <motion.div 
          animate={{ opacity: [0, 0.1, 0, 0.05, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
          className="absolute inset-0 bg-foundation-accent/5 mix-blend-overlay pointer-events-none"
        />

        {/* Metadata Floating Labels */}
        <div className="absolute top-6 left-6 z-30 space-y-1 pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-foundation-accent animate-pulse rounded-full" />
            <span className="text-[10px] font-mono font-bold text-foundation-accent uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded">
              Live Feed: {designation}
            </span>
          </div>
          <div className="text-[9px] font-mono text-white/40 uppercase tracking-tighter bg-black/40 px-2 py-0.5 rounded inline-block">
            Res: 2048x2048 | Depth: 32bit
          </div>
        </div>

        <div className="absolute bottom-6 right-6 z-30 pointer-events-none">
          <div className="text-[10px] font-mono text-foundation-accent/60 uppercase tracking-widest border border-foundation-accent/30 px-2 py-1 bg-black/60 backdrop-blur-sm">
            Record #{currentIndex + 1}
          </div>
        </div>

        {/* Controls */}
        {images.length > 1 && (
          <>
            <div className="absolute inset-y-0 left-0 w-16 z-30 flex items-center justify-center">
              <button 
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="p-2 bg-black/40 hover:bg-foundation-accent/20 text-white/50 hover:text-foundation-accent transition-all rounded-full opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>
            <div className="absolute inset-y-0 right-0 w-16 z-30 flex items-center justify-center">
              <button 
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="p-2 bg-black/40 hover:bg-foundation-accent/20 text-white/50 hover:text-foundation-accent transition-all rounded-full opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Pagination Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-1 transition-all duration-300 rounded-full ${
                    i === currentIndex ? 'w-8 bg-foundation-accent' : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-black/80 border-t border-white/5 relative z-30">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-3 h-3 text-foundation-muted" />
              <p className="text-[11px] font-mono text-foundation-muted uppercase tracking-widest">
                Visual Documentation Archive
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a 
                href={images[currentIndex].url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[10px] font-mono text-foundation-accent hover:text-white flex items-center gap-1.5 uppercase transition-colors"
              >
                <ExternalLink className="w-3 h-3" /> Raw Data Source
              </a>
              <div className="w-px h-2 bg-white/10" />
              <span className="text-[10px] font-mono text-white/30 uppercase">
                Auth: {images[currentIndex].source || 'Foundation Archive'}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 text-[10px] font-black text-foundation-accent uppercase tracking-tighter">
              <ShieldAlert className="w-3 h-3" /> Classified
            </div>
            <div className="flex items-center gap-1 text-[9px] font-mono text-foundation-terminal uppercase animate-pulse">
              <Zap className="w-2.5 h-2.5" /> Signal Stable
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar (Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5 z-40">
        <motion.div 
          className="h-full bg-foundation-accent shadow-[0_0_10px_rgba(185,28,28,0.5)]"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / images.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
};

const ImageIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
    <circle cx="9" cy="9" r="2"/>
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
  </svg>
);
