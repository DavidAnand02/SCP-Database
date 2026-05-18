import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import { COUNTRY_COORDS } from '../constants';

interface SpyMapProps {
  data: { name: string; value: number }[];
}

export const SpyMap = ({ data }: SpyMapProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<{ name: string; value: number; x: number; y: number; id: string } | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 400;

    svg.selectAll("*").remove();

    // Create a group for the map content to allow for zooming/panning effects
    const g = svg.append("g").attr("class", "map-content");

    const projection = d3.geoMercator()
      .scale(130)
      .translate([width / 2, height / 1.4]);

    const path = d3.geoPath().projection(projection);

    // Fetch world map data for continent outlines
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then((worldData: any) => {
      // Draw continents
      g.append("g")
        .selectAll("path")
        .data(worldData.features)
        .enter()
        .append("path")
        .attr("d", path as any)
        .attr("fill", "#0a0a0a")
        .attr("stroke", "#999")
        .attr("stroke-width", 0.6);

      // Subtle background grid
      const graticule = d3.geoGraticule();
      g.append("path")
        .datum(graticule())
        .attr("d", path as any)
        .attr("fill", "none")
        .attr("stroke", "#ffffff08")
        .attr("stroke-width", 0.5);

      // Draw markers
      const markers = g.append("g").attr("class", "markers");
      
      const sortedData = [...data].sort((a, b) => b.value - a.value);
      const topN = 12; 

      sortedData.forEach((d, i) => {
        const coords = COUNTRY_COORDS[d.name];
        if (coords) {
          const projected = projection(coords);
          if (!projected) return;
          
          const x = projected[0];
          const y = projected[1];
          
          const radius = Math.min(10, 2 + Math.sqrt(d.value) * 1.5);
          const markerId = `marker-${d.name.replace(/\s+/g, '-')}`;
          
          const markerGroup = markers.append("g")
            .attr("class", "marker-group")
            .attr("id", markerId)
            .style("cursor", "pointer")
            .on("mouseenter", (event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              const containerRect = containerRef.current?.getBoundingClientRect();
              if (containerRect) {
                const centerX = rect.left + rect.width / 2 - containerRect.left;
                const centerY = rect.top + rect.height / 2 - containerRect.top;
                setHovered({ name: d.name, value: d.value, x: centerX, y: centerY, id: markerId });
              }
              
              // Zoom effect on hover - Scale around the marker's position to keep it under the cursor
              const scale = 3.0;
              const tx = x * (1 - scale);
              const ty = y * (1 - scale);
              
              g.transition()
                .duration(400)
                .attr("transform", `translate(${tx}, ${ty}) scale(${scale})`);
            })
            .on("mousemove", (event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              const containerRect = containerRef.current?.getBoundingClientRect();
              if (containerRect) {
                const centerX = rect.left + rect.width / 2 - containerRect.left;
                const centerY = rect.top + rect.height / 2 - containerRect.top;
                setHovered(prev => prev ? { ...prev, x: centerX, y: centerY } : null);
              }
            })
            .on("mouseleave", () => {
              setHovered(null);
              // Reset zoom
              g.transition()
                .duration(400)
                .attr("transform", "translate(0,0) scale(1)");
            });

          // Outer glow
          markerGroup.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", radius * 2.5)
            .attr("fill", "#f59e0b")
            .attr("opacity", 0.05);

          // Core
          markerGroup.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", radius)
            .attr("fill", "#f59e0b")
            .attr("opacity", 0.6)
            .attr("stroke", "#f59e0b")
            .attr("stroke-width", 1);

          // Pulsing ring for top locations
          if (i < 5) {
            markerGroup.append("circle")
              .attr("cx", x)
              .attr("cy", y)
              .attr("r", radius)
              .attr("fill", "none")
              .attr("stroke", "#f59e0b")
              .attr("stroke-width", 1)
              .attr("opacity", 0.8)
              .append("animate")
              .attr("attributeName", "r")
              .attr("from", radius)
              .attr("to", radius * 4)
              .attr("dur", "3s")
              .attr("repeatCount", "indefinite");
            
            markerGroup.select("circle:last-child")
              .append("animate")
              .attr("attributeName", "opacity")
              .attr("from", 0.8)
              .attr("to", 0)
              .attr("dur", "3s")
              .attr("repeatCount", "indefinite");
          }

          if (i < topN) {
            const labelText = d.name;
            
            const bestPos = [x, y - radius - 6];
            
            markerGroup.append("text")
              .attr("x", bestPos[0])
              .attr("y", bestPos[1])
              .attr("text-anchor", "middle")
              .attr("fill", "#f59e0b")
              .attr("font-size", 7)
              .attr("font-family", "monospace")
              .attr("font-weight", "bold")
              .style("pointer-events", "none")
              .style("text-shadow", "0 0 3px rgba(0,0,0,1)")
              .text(labelText);
          }
        }
      });
    });
  }, [data]);

  return (
    <div className="relative w-full h-full group" ref={containerRef}>
      <div className="w-full h-full bg-black/60 rounded-sm overflow-hidden border border-white/10 relative">
        <svg 
          ref={svgRef} 
          viewBox="0 0 800 400" 
          className="w-full h-full transition-transform duration-700"
        />
        
        {/* HUD Overlays */}
        <div className="absolute inset-0 pointer-events-none border border-foundation-accent/10 m-2" />
        <div className="absolute top-4 left-4 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-foundation-accent rounded-full animate-pulse" />
            <span className="text-[9px] font-mono text-foundation-accent uppercase tracking-[0.3em] font-bold">Global Anomaly Grid</span>
          </div>
          <span className="text-[7px] font-mono text-foundation-muted uppercase tracking-widest">Scanning for spatial inconsistencies...</span>
        </div>

        <div className="absolute bottom-4 right-4 flex flex-col items-end gap-1">
          <span className="text-[7px] font-mono text-foundation-muted uppercase tracking-widest">Coordinates: 37.0902° N, 95.7129° W</span>
          <span className="text-[7px] font-mono text-foundation-muted uppercase tracking-widest">Status: Site-19 Uplink Established</span>
        </div>
      </div>
      
      {hovered && (
        <div 
          className="absolute z-[100] pointer-events-none bg-black/95 border border-foundation-accent/50 p-3 rounded shadow-2xl font-mono backdrop-blur-xl transition-all duration-75"
          style={{ 
            left: hovered.x, 
            top: hovered.y,
            transform: `translate(${hovered.x < 100 ? '0%' : hovered.x > (containerRef.current?.clientWidth || 800) - 100 ? '-100%' : '-50%'}, ${hovered.y < 100 ? '20%' : '-120%'})`
          }}
        >
          <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-1">
            <div className="w-2 h-2 bg-foundation-accent rounded-full" />
            <p className="text-[10px] text-foundation-accent uppercase font-bold tracking-widest">{hovered.name}</p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-xl text-white font-black">{hovered.value}</p>
            <p className="text-[9px] text-foundation-muted uppercase">Verified Discoveries</p>
          </div>
          <div className="mt-2 pt-2 border-t border-white/5">
            <p className="text-[7px] text-foundation-muted uppercase tracking-tighter">Classification: High Priority Discovery Zone</p>
          </div>
        </div>
      )}
    </div>
  );
};
