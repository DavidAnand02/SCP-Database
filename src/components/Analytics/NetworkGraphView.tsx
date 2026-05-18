import React from 'react';
import { LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NetworkGraph } from '../NetworkGraph';
import { SCPEntry } from '../../types';

interface NetworkGraphViewProps {
  filteredData: SCPEntry[];
}

export const NetworkGraphView: React.FC<NetworkGraphViewProps> = ({ filteredData }) => {
  const navigate = useNavigate();

  return (
    <div className="glass-panel p-4 sm:p-8 flex flex-col gap-4 sm:gap-6 h-[70vh] min-h-[600px] lg:min-h-[800px]">
      <div className="z-10">
        <h3 className="text-[11px] font-mono text-white uppercase tracking-[0.2em] mb-2 flex items-center gap-3">
          <LinkIcon className="w-4 h-4 text-foundation-accent" /> Relational Network Graph
        </h3>
        <p className="text-[9px] font-mono text-foundation-muted uppercase">Visualizing connections between anomalous entities and personnel</p>
      </div>
      <div className="flex-1 min-h-0">
        <NetworkGraph data={filteredData} onNodeClick={(id) => navigate(`/scp/${id}`)} />
      </div>
    </div>
  );
};
