import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { AuthProvider } from './context/AuthContext';
import { CrowdProvider } from './context/CrowdContext';
import { BookingProvider } from './context/BookingContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts & Common
import { AnnouncementBar } from './components/layout/AnnouncementBar';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AdminLayout } from './components/layout/AdminLayout';
import { ToastContainer } from './components/common/ToastContainer';
import { EmergencyHelpTrigger } from './components/common/EmergencyHelpTrigger';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Public Pages (Code-split for fast initial page load)
import { LandingPage } from './pages/LandingPage';
const TemplesPage = lazy(() => import('./pages/TemplesPage').then(m => ({ default: m.TemplesPage })));
const TempleDetailsPage = lazy(() => import('./pages/TempleDetailsPage').then(m => ({ default: m.TempleDetailsPage })));
const PlanYatraPage = lazy(() => import('./pages/PlanYatraPage').then(m => ({ default: m.PlanYatraPage })));
const LiveCrowdPage = lazy(() => import('./pages/LiveCrowdPage').then(m => ({ default: m.LiveCrowdPage })));
const BookingPage = lazy(() => import('./pages/BookingPage').then(m => ({ default: m.BookingPage })));
const PrasadPage = lazy(() => import('./pages/PrasadPage').then(m => ({ default: m.PrasadPage })));
const PaymentPage = lazy(() => import('./pages/PaymentPage').then(m => ({ default: m.PaymentPage })));
const ConfirmationPage = lazy(() => import('./pages/ConfirmationPage').then(m => ({ default: m.ConfirmationPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const LiveDarshanPage = lazy(() => import('./pages/LiveDarshanPage').then(m => ({ default: m.LiveDarshanPage })));
const EmergencyAssistancePage = lazy(() => import('./pages/EmergencyAssistancePage').then(m => ({ default: m.EmergencyAssistancePage })));

// Admin Pages (Code-split)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminCrowdMonitor = lazy(() => import('./pages/admin/AdminCrowdMonitor').then(m => ({ default: m.AdminCrowdMonitor })));
const AdminAlerts = lazy(() => import('./pages/admin/AdminAlerts').then(m => ({ default: m.AdminAlerts })));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics').then(m => ({ default: m.AdminAnalytics })));
const AdminEmergency = lazy(() => import('./pages/admin/AdminEmergency').then(m => ({ default: m.AdminEmergency })));
const DivyatraAdministration = lazy(() => import('./pages/admin/DivyatraAdministration').then(m => ({ default: m.DivyatraAdministration })));

/**
 * Lightweight Route Suspense Fallback
 */
const PageLoadingFallback = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3 p-8">
    <div className="w-10 h-10 rounded-full border-3 border-[#E97820]/30 border-t-[#E97820] animate-spin" />
    <span className="text-xs font-serif font-bold text-[#102A56] tracking-widest uppercase">
      Loading DivYatra...
    </span>
  </div>
);

/**
 * Android Hardware Back Button Navigator
 * Handles natural back navigation across React Router routes and exits cleanly at the root.
 */
const AndroidBackButtonHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let listenerHandle;
    const initBackListener = async () => {
      try {
        listenerHandle = await CapApp.addListener('backButton', () => {
          if (location.pathname === '/' || location.pathname === '') {
            CapApp.exitApp();
          } else if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate('/');
          }
        });
      } catch (e) {
        // Fallback for non-native environments
      }
    };

    initBackListener();

    return () => {
      if (listenerHandle && typeof listenerHandle.remove === 'function') {
        listenerHandle.remove();
      }
    };
  }, [navigate, location]);

  return null;
};

// Public Shell Component
const PublicShell = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#102A56] safe-top">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <EmergencyHelpTrigger />
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CrowdProvider>
          <BookingProvider>
            <Router>
              <AndroidBackButtonHandler />
              <ToastContainer />
              <Suspense fallback={<PageLoadingFallback />}>
                <Routes>
                  {/* Public Routes */}
                  <Route element={<PublicShell />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/temples" element={<TemplesPage />} />
                    <Route path="/temples/:id" element={<TempleDetailsPage />} />
                    <Route path="/plan-yatra" element={<PlanYatraPage />} />
                    <Route path="/live-crowd" element={<LiveCrowdPage />} />
                    <Route path="/booking" element={<BookingPage />} />
                    <Route path="/prasad" element={<PrasadPage />} />
                    <Route path="/payment" element={<PaymentPage />} />
                    <Route path="/confirmation" element={<ConfirmationPage />} />
                    <Route path="/live-darshan" element={<LiveDarshanPage />} />
                    <Route path="/emergency-help" element={<EmergencyAssistancePage />} />
                    <Route path="/login" element={<LoginPage />} />
                  </Route>

                  {/* Standalone Administration & State Command Matrix Login */}
                  <Route path="/DivyatraAdministration" element={<DivyatraAdministration />} />
                  <Route path="/admin/login" element={<DivyatraAdministration />} />

                  {/* Authority / Admin Command Center Routes (Guarded) */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['authority', 'admin']}>
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<AdminDashboard />} />
                    <Route path="crowd" element={<AdminCrowdMonitor />} />
                    <Route path="alerts" element={<AdminAlerts />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                    <Route path="emergency" element={<AdminEmergency />} />
                  </Route>

                  {/* Fallback to Home */}
                  <Route path="*" element={<LandingPage />} />
                </Routes>
              </Suspense>
            </Router>
          </BookingProvider>
        </CrowdProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
