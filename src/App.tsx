import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { OnboardingForm } from './components/OnboardingForm';
import { ParentsPage } from './components/ParentsPage';
import { StudentsPage } from './components/StudentsPage';
import { BulkSMSPage } from './components/BulkSMSPage';
import { DataImportPage } from './components/DataImportPage';
import { SettingsPage } from './components/SettingsPage';
import { RoleManagementPage } from './components/RoleManagementPage';
import { StaffManagementPage } from './components/StaffManagementPage';
import { InvitePage } from './components/InvitePage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { EnvironmentCheck } from './components/EnvironmentCheck';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, loading } = useAuth();

  // Check if environment variables are missing
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return <EnvironmentCheck />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          {/* Public routes */}
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parents"
            element={
              <ProtectedRoute>
                <ParentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedRoute>
                <StudentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sms"
            element={
              <ProtectedRoute>
                <BulkSMSPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/import"
            element={
              <ProtectedRoute>
                <DataImportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute>
                <StaffManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/permissions"
            element={
              <ProtectedRoute>
                <RoleManagementPage />
              </ProtectedRoute>
            }
          />
          
          {/* Public invite route */}
          <Route path="/invite/:token" element={<InvitePage />} />
          
          {/* Redirect root based on auth status */}
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/landing" replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;