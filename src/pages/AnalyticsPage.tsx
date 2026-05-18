import React from 'react';
import { Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Layout } from '../components/Layout';
import { AnalyticsView } from '../components/AnalyticsView';
import { useSCPAllEntries } from '../hooks/useSCPHooks';

interface AnalyticsPageProps {
  onLogout: () => void;
}

export const AnalyticsPage = ({ onLogout }: AnalyticsPageProps) => {
  const { data: scpData = [], isLoading, isError, error, refetch } = useSCPAllEntries();

  return (
    <Layout onLogout={onLogout}>
      <Helmet>
        <title>Anomaly Analytics | SCP Foundation Directory</title>
        <meta name="description" content="Explore advanced statistical analysis and network mapping of the SCP Foundation database. Visualize containment trends and anomalous relationships." />
      </Helmet>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <Loader2 className="w-12 h-12 text-foundation-accent animate-spin" />
          <p className="text-xs font-mono text-foundation-muted uppercase tracking-widest">Compiling Analytics Data...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-20 gap-6 border border-red-500/20 bg-red-500/5 rounded">
          <p className="text-red-500 font-mono uppercase text-sm font-bold">Terminal Synchronization Failure</p>
          <p className="text-[10px] font-mono text-foundation-muted uppercase text-center max-w-md">
            {error instanceof Error ? error.message : 'The analytical engine failed to retrieve the full dataset from the central database.'}
          </p>
          <button 
            onClick={() => refetch()}
            className="px-6 py-2 bg-foundation-accent text-white text-[10px] font-mono uppercase rounded hover:bg-foundation-accent/80 transition-all font-bold"
          >
            Reconnect Terminal
          </button>
        </div>
      ) : (
        <AnalyticsView data={scpData} />
      )}
    </Layout>
  );
};
