import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RequireAuth from '@/components/RequireAuth';
import Layout from '@/components/Layout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import UsersPage from '@/pages/UsersPage';
import PostsPage from '@/pages/PostsPage';
import ReportsPage from '@/pages/ReportsPage';
import NoticesPage from '@/pages/NoticesPage';
import FaqPage from '@/pages/FaqPage';
import AdsPage from '@/pages/AdsPage';
import MaintenancePage from '@/pages/MaintenancePage';
import HomeSettingPage from '@/pages/HomeSettingPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<RequireAuth />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/users"     element={<UsersPage />} />
            <Route path="/posts"     element={<PostsPage />} />
            <Route path="/reports"   element={<ReportsPage />} />
            <Route path="/notices"   element={<NoticesPage />} />
            <Route path="/faq"       element={<FaqPage />} />
            <Route path="/ads"         element={<AdsPage />} />
            <Route path="/maintenance"  element={<MaintenancePage />} />
            <Route path="/home-setting" element={<HomeSettingPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
