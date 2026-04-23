import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { OverviewPage } from './pages/Overview';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { BulkImportPage } from './pages/BulkImport';
import { CatalogPage } from './pages/Catalog';
import { ReleaseDetailPage } from './pages/ReleaseDetail';
import { AnalyticsStreamsPage } from './pages/AnalyticsStreams';
import { PromotionPage } from './pages/Promotion';
import { RightsManagerPage } from './pages/RightsManager';
import { AnalyticsTrendsPage } from './pages/AnalyticsTrends';
import { AnalyticsPlaylistsPage } from './pages/AnalyticsPlaylists';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { NotificationsPage } from './pages/Notifications';
import { PrivateRoute } from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import './index.css';

// Placeholder pages for routes
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8 bg-white rounded-xl border border-gray-100 shadow-sm">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <p className="text-gray-500 italic">This page is under construction (Phase 4-9)</p>
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="overview" element={<OverviewPage />} />
              <Route path="catalog/all" element={<CatalogPage title="All Releases" statusFilter="all" />} />
              <Route path="catalog/bulk-import" element={<BulkImportPage />} />
              <Route path="catalog/drafts" element={<CatalogPage title="Drafts" statusFilter="draft" />} />
              <Route path="catalog/correction" element={<CatalogPage title="Correction Requested" statusFilter="correction_requested" />} />
              <Route path="catalog/release/:id" element={<ReleaseDetailPage />} />
              <Route path="analytics/streams" element={<AnalyticsStreamsPage />} />
              <Route path="analytics/trends" element={<AnalyticsTrendsPage />} />
              <Route path="analytics/playlists" element={<AnalyticsPlaylistsPage />} />
              <Route path="analytics/views" element={<Placeholder title="Views" />} />
              <Route path="analytics/shortform" element={<Placeholder title="Short-form videos" />} />
              <Route path="analytics/optimization" element={<Placeholder title="Catalog optimization" />} />
              <Route path="legal/rights" element={<RightsManagerPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route index element={<Navigate to="overview" replace />} />
            </Route>
            {/* Promotion module is a full-page layout without the main dashboard layout */}
            <Route path="promotion" element={<PromotionPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
             <Route path="dashboard" element={<AdminDashboard />} />
             <Route path="users" element={<Placeholder title="Admin: Users" />} />
             <Route path="releases" element={<Placeholder title="Admin: Releases" />} />
             <Route path="catalog" element={<Placeholder title="Admin: Catalog" />} />
             <Route path="analytics" element={<Placeholder title="Admin: Analytics" />} />
             <Route path="rights" element={<Placeholder title="Admin: Rights Issues" />} />
             <Route path="imports" element={<Placeholder title="Admin: Bulk Imports" />} />
             <Route path="settings" element={<Placeholder title="Admin: Settings" />} />
             <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard/overview" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
