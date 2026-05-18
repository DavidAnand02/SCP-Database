import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Layout } from '../components/Layout';
import { AdminDashboard } from '../components/AdminDashboard';
import { SCPEntry } from '../types';

interface AdminPageProps {
  onLogout: () => void;
  onPreview: (scp: SCPEntry) => void;
}

export const AdminPage = ({ onLogout, onPreview }: AdminPageProps) => {
  return (
    <Layout onLogout={onLogout}>
      <Helmet>
        <title>Admin Terminal | SCP Foundation Directory</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <AdminDashboard 
        onPreview={onPreview}
        onDataChange={() => {}}
      />
    </Layout>
  );
};
