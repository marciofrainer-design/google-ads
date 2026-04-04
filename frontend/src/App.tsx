import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import Campaigns from '@/pages/Campaigns';
import AdGroups from '@/pages/AdGroups';
import Ads from '@/pages/Ads';
import Reports from '@/pages/Reports';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="campaigns/:campaignId/ad-groups" element={<AdGroups />} />
        <Route path="campaigns/:campaignId/ad-groups/:adGroupId/ads" element={<Ads />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}
