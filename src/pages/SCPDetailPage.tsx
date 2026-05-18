import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Skull, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { SCPDetailView } from '../components/SCPDetailView';
import { Layout } from '../components/Layout';
import { useSCPDetail, useSCPAllEntries } from '../hooks/useSCPHooks';

interface SCPDetailPageProps {
  onLogout: () => void;
}

export const SCPDetailPage = ({ onLogout }: SCPDetailPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  
  const { data: scp, isLoading, isError } = useSCPDetail(id);
  const { data: allScps } = useSCPAllEntries();

  const handleBack = () => {
    // If we have a specific 'from' location (like from analytics), use history back for scroll restoration
    if (location.state?.from) {
      navigate(-1);
    } else {
      // Otherwise, always return to the root directory
      navigate('/');
    }
  };

  const isFromAnalytics = location.state?.from?.includes('/analytics');
  const backLabel = isFromAnalytics ? "Return to Analytics" : "Return to Directory";

  if (isLoading) return (
    <Layout onLogout={onLogout}>
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="w-12 h-12 text-foundation-accent animate-spin" />
        <p className="text-xs font-mono text-foundation-muted uppercase tracking-widest">Decrypting Record...</p>
      </div>
    </Layout>
  );
  
  if (isError || !scp) return (
    <Layout onLogout={onLogout}>
      <div className="text-center p-20 space-y-4">
        <Skull className="w-12 h-12 text-red-500 mx-auto opacity-20" />
        <div className="text-foundation-muted font-mono uppercase tracking-widest">
          {isError ? 'Error Accessing Database' : 'Record Not Found or Access Denied'}
        </div>
        <button 
          onClick={handleBack}
          className="inline-block text-xs text-foundation-accent hover:underline uppercase font-mono"
        >
          {backLabel}
        </button>
      </div>
    </Layout>
  );

  return (
    <Layout onLogout={onLogout}>
      <Helmet>
        <title>{scp.scp_designation} - {scp.code_name || 'Classified'} | SCP Foundation Directory</title>
        <meta name="description" content={`Access the secure record for ${scp.scp_designation}. Object Class: ${scp.object_containment_class || 'Unknown'}. Containment protocols and anomalous properties documented within.`} />
        <link rel="canonical" href={window.location.href} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={`${scp.scp_designation} - ${scp.code_name || 'Classified'} | SCP Foundation`} />
        <meta property="og:description" content={`Secure database entry for ${scp.scp_designation}. Explore containment procedures and anomalous analysis.`} />
        {scp.scp_image_url && <meta property="og:image" content={scp.scp_image_url} />}
      </Helmet>
      <SCPDetailView scp={scp} allScps={allScps || []} onBack={handleBack} backLabel={backLabel} />
    </Layout>
  );
};
