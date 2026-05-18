import React from 'react';
import { Database, TrendingUp, AlertCircle, Shield } from 'lucide-react';
import { motion } from 'motion/react';

interface AnalyticsStatsProps {
  totalCount: number;
  activeThreshold: number;
  topClass: string;
  avgRating: number;
}

export const AnalyticsStats: React.FC<AnalyticsStatsProps> = ({
  totalCount,
  activeThreshold,
  topClass,
  avgRating
}) => {
  const stats = [
    { label: 'Total Anomalies', value: totalCount, icon: Database, color: 'text-blue-500' },
    { label: 'Primary Class', value: topClass, icon: Shield, color: 'text-foundation-accent' },
    { label: 'Avg Rating', value: avgRating.toFixed(1), icon: TrendingUp, color: 'text-green-500' },
    { label: 'Significance Threshold', value: activeThreshold, icon: AlertCircle, color: 'text-amber-500' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center gap-4 group hover:border-foundation-accent/30 transition-all"
        >
          <div className={`p-3 rounded-lg bg-white/5 group-hover:scale-110 transition-transform ${stat.color}`}>
            <stat.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-mono text-foundation-muted uppercase tracking-wider">{stat.label}</p>
            <p className="text-xl font-black terminal-text tracking-tighter">{stat.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
