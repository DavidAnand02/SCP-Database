import React, { useState, useRef, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { motion } from 'motion/react';
import { getChartColor } from '../../utils/chartColors';

export const SafeResponsiveContainer = ({ children, ...props }: any) => {
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasSize, setHasSize] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setHasSize(true);
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full min-w-0 min-h-0">
      {isMounted && hasSize ? (
        <ResponsiveContainer {...props} minWidth={0} minHeight={0}>
          {children}
        </ResponsiveContainer>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-foundation-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-[10px] font-mono font-bold" style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const CustomPieTooltip = ({ active, payload, total }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percent = total ? ((data.value / total) * 100).toFixed(1) : null;
    return (
      <div className="bg-black/90 border border-white/10 p-3 rounded shadow-2xl font-mono backdrop-blur-md">
        <p className="text-xs text-foundation-accent uppercase mb-1 tracking-widest">{data.name}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-lg text-white font-bold">{data.value}</p>
          {percent && <p className="text-xs text-foundation-muted font-medium">{percent}%</p>}
        </div>
      </div>
    );
  }
  return null;
};

export const CustomBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-white/10 p-3 rounded shadow-2xl font-mono backdrop-blur-md">
        <p className="text-xs text-foundation-accent uppercase mb-1 tracking-widest">{payload[0].payload.name}</p>
        <p className="text-lg text-white font-bold">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export const ChartCard = ({ title, icon: Icon, children, className = "", minHeight = "320px" }: { title: string, icon: any, children: React.ReactNode, className?: string, minHeight?: string }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`glass-panel p-6 flex flex-col h-full min-w-0 ${className}`}>
    <h3 className="text-xs font-mono text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3 border-b border-white/5 pb-4">
      <Icon className="w-4 h-4 text-foundation-accent" /> {title}
    </h3>
    <div className="flex-1 w-full relative" style={{ minHeight }}>
      {children}
    </div>
  </motion.div>
);

export const SectionHeader = ({ title, icon: Icon }: { title: string, icon: any }) => (
  <div className="col-span-full border-b border-foundation-border pb-4 mb-4 mt-12 first:mt-0">
    <h2 className="text-xl font-black terminal-text uppercase tracking-tighter flex items-center gap-3 text-white">
      <Icon className="w-6 h-6 text-foundation-accent" /> {title}
    </h2>
  </div>
);

export const ScrollableBarChart = ({ data, onFilterSelect, filterCategory, fill, colorCategory, maxValue, yAxisWidth = 140 }: any) => {
  // Calculate height based on number of items to ensure bars don't get squished
  const minHeight = 300;
  const calculatedHeight = Math.max(minHeight, data.length * 40);

  return (
    <div className="w-full h-full min-h-[300px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-foundation-accent/20 scrollbar-track-transparent pr-2">
      <div style={{ height: calculatedHeight, width: '100%' }}>
        <SafeResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
            <XAxis type="number" hide domain={[0, maxValue || 'auto']} />
            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#d1d5db', fontSize: 12 }} width={yAxisWidth} />
            <Tooltip content={<CustomBarTooltip />} cursor={false} />
            <Bar onClick={(d) => onFilterSelect && onFilterSelect(filterCategory, d.name)} cursor="pointer" activeBar={false} dataKey="value" fill={fill} radius={[0, 4, 4, 0]} barSize={20}>
              {colorCategory && data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={getChartColor(colorCategory, entry.name, index)} />
              ))}
            </Bar>
          </BarChart>
        </SafeResponsiveContainer>
      </div>
    </div>
  );
};
