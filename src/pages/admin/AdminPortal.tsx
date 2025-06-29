import { Routes, Route } from 'react-router-dom';
import { AdminAuthProvider } from '@/hooks/useAdminAuth';
import AdminLogin from './AdminLogin';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from './AdminDashboard';
import AdminProperties from './AdminProperties';
import AdminPropertyEdit from './AdminPropertyEdit';
import AdminTeam from './AdminTeam';
import AdminAnalytics from './AdminAnalytics';
import AdminSettings from './AdminSettings';

const AdminPortal = () => {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route element={<AdminLayout />}>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="property/edit/:id" element={<AdminPropertyEdit />} />
          <Route path="team" element={<AdminTeam />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </AdminAuthProvider>
  );
};

export default AdminPortal;
