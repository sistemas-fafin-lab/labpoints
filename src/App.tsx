import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { ProfilePreviewProvider } from './components/UserProfilePreviewModal';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Header } from './components/Header';
// import { DebugPanel } from './components/DebugPanel';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Dashboard } from './pages/Dashboard';
import { Rewards } from './pages/Rewards';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { Approvals } from './pages/Approvals';
import { RedeemControl } from './pages/RedeemControl';

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || 
                     location.pathname === '/cadastro' || 
                     location.pathname === '/esqueci-senha' || 
                     location.pathname === '/redefinir-senha';

  return (
    <>
      {/* <DebugPanel /> */}
      <div className="min-h-screen bg-lab-gray-100">
        {!isAuthPage && <Header />}
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Signup />} />
          <Route path="/esqueci-senha" element={<ForgotPassword />} />
          <Route path="/redefinir-senha" element={<ResetPassword />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recompensas"
                element={
                  <ProtectedRoute>
                    <Rewards />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/perfil"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/aprovacoes"
                element={
                  <ProtectedRoute requireManager>
                    <Approvals />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/controle-resgates"
                element={
                  <ProtectedRoute requireManager>
                    <RedeemControl />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/usuarios"
                element={
                  <ProtectedRoute requireAdmin>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/recompensas"
                element={
                  <ProtectedRoute requireAdmin>
                    <Admin />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ProfilePreviewProvider>
            <AppContent />
          </ProfilePreviewProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
