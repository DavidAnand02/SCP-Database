import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from 'react-simple-maps';
import { motion, AnimatePresence } from 'motion/react';
import { COUNTRY_COORDINATES } from '../../utils/countryCoordinates';

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

interface MapProps {
  data: { name: string; value: number }[];
  onFilterSelect?: (key: string, value: string) => void;
}

export const GlobalDiscoveryMap: React.FC<MapProps> = ({ data, onFilterSelect }) => {
  const [position, setPosition] = useState({ coordinates: [0, 20] as [number, number], zoom: 1 });
  const [hoveredMarker, setHoveredMarker] = useState<any | null>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const leaveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Smooth wheel zoom normalization
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      setPosition(prev => {
        // Normalization factor similar to NetworkGraph
        const factor = Math.pow(0.9992, e.deltaY);
        const newZoom = Math.max(1, Math.min(8, prev.zoom * factor));
        
        return {
          ...prev,
          zoom: newZoom
        };
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const markers = useMemo(() => {
    return data
      .filter(d => COUNTRY_COORDINATES[d.name])
      .map(d => ({
        name: d.name,
        coordinates: COUNTRY_COORDINATES[d.name],
        value: d.value
      }));
  }, [data]);

  const maxVal = Math.max(...markers.map(m => m.value), 1);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      // Update mousePos to prepare the next zoom origin
      setMousePos({ x, y });
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const handleMouseEnter = (e: React.MouseEvent, marker: any) => {
    if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
    
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const markerRect = e.currentTarget.getBoundingClientRect();
      
      // Calculate marker center relative to container for "Target Lock" feel
      const markerCenterX = markerRect.left + markerRect.width / 2;
      const markerCenterY = markerRect.top + markerRect.height / 2;
      
      const x = ((markerCenterX - containerRect.left) / containerRect.width) * 100;
      const y = ((markerCenterY - containerRect.top) / containerRect.height) * 100;
      
      setZoomOrigin({ x, y });
    }
    
    setHoveredMarker(marker);
  };

  const handleMouseLeave = () => {
    // Add a small grace period to prevent flickering during zoom transitions
    leaveTimeout.current = setTimeout(() => {
      setHoveredMarker(null);
    }, 150);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full min-h-[400px] bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden font-mono"
      onMouseMove={handleMouseMove}
    >
      {/* Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, #333 1px, transparent 1px),
            linear-gradient(to bottom, #333 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Header */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-foundation-accent animate-pulse" />
          <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-white">Global Anomaly Grid</h3>
        </div>
        <p className="text-[9px] text-foundation-muted uppercase tracking-widest">Scanning for spatial inconsistencies...</p>
      </div>

      {/* Map Container with Motion Zoom */}
      <motion.div 
        className="w-full h-full"
        animate={{
          scale: hoveredMarker ? 1.8 : 1,
          transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`
        }}
        transition={{
          type: "spring",
          stiffness: 60,
          damping: 25,
          mass: 1.2
        }}
      >
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 130
          }}
          className="w-full h-full"
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={(position) => setPosition(position as any)}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="transparent"
                    stroke="#666"
                    strokeWidth={0.6}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none", stroke: "#999" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {markers.map((marker) => {
              // Square root scale for area-proportional sizing
              const minSize = 2;
              const maxSize = 12;
              const size = minSize + (Math.sqrt(marker.value) / Math.sqrt(maxVal)) * (maxSize - minSize);
              const isHovered = hoveredMarker?.name === marker.name;

              return (
                <Marker
                  key={marker.name}
                  coordinates={marker.coordinates}
                  onMouseEnter={(e) => handleMouseEnter(e as any, marker)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => onFilterSelect && onFilterSelect('country_of_discovery', marker.name)}
                >
                  <g className="cursor-pointer">
                    {/* Invisible larger hit area to prevent flicker during zoom */}
                    <circle
                      r={size * 4}
                      fill="transparent"
                      className="pointer-events-auto"
                    />

                    {/* Outer glow/ring */}
                    <circle
                      r={isHovered ? size * 2 : size * 1.5}
                      fill="transparent"
                      stroke="#f59e0b"
                      strokeWidth={0.5}
                      strokeOpacity={isHovered ? 0.8 : 0.3}
                      className="transition-all duration-300"
                    />
                    
                    {/* Inner dot */}
                    <circle
                      r={size}
                      fill="#f59e0b"
                      fillOpacity={isHovered ? 1 : 0.6}
                      className="transition-all duration-300"
                    />

                    {/* Label */}
                    {(!isHovered && size > 6) && (
                      <text
                        textAnchor="middle"
                        y={-size - 8}
                        className="transition-opacity duration-300 pointer-events-none"
                        style={{ opacity: 0.7 }}
                      >
                        <tspan x="0" dy="0" className="text-[8px] font-bold fill-[#f59e0b] drop-shadow-md">
                          {marker.name}
                        </tspan>
                      </text>
                    )}
                  </g>
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      </motion.div>

      {/* Footer Info */}
      <div className="absolute bottom-4 right-4 z-10 text-right pointer-events-none">
        <p className="text-[9px] text-foundation-muted uppercase tracking-widest mb-1">
          Coordinates: {position.coordinates[1].toFixed(4)}° N, {Math.abs(position.coordinates[0]).toFixed(4)}° {position.coordinates[0] < 0 ? 'W' : 'E'}
        </p>
        <p className="text-[9px] text-foundation-muted uppercase tracking-widest">
          Status: Site-19 Uplink Established
        </p>
      </div>

      {/* Tooltip Card */}
      {hoveredMarker && (
        <div 
          className="absolute z-50 pointer-events-none bg-[#111]/95 border border-[#f59e0b]/40 rounded-lg p-3 shadow-2xl backdrop-blur-md transition-opacity duration-200"
          style={{ 
            left: tooltipPos.x, 
            top: tooltipPos.y - 20,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="text-[#f59e0b] font-bold text-sm mb-1 whitespace-nowrap">{hoveredMarker.name}</div>
          <div className="text-[#f87171] font-mono text-xs font-bold tracking-wider whitespace-nowrap">
            {hoveredMarker.value} {hoveredMarker.value === 1 ? 'ANOMALY' : 'ANOMALIES'}
          </div>
        </div>
      )}
    </div>
  );
};
