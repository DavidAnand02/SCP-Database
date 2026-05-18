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
  const { data: scpData = [], isLoading } = useSCPAllEntries();

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
      ) : (
        <AnalyticsView data={scpData} />
      )}
    </Layout>
  );
};
