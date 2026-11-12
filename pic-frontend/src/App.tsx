import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from '@/context/AppContext';
import { AppShell } from '@/components/layout/AppShell';
import { ToastContainer } from '@/components/ui/ToastContainer';

import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { ProfileSetup } from '@/pages/ProfileSetup';
import { Discover } from '@/pages/Discover';
import { PicDetails } from '@/pages/PicDetails';
import { CreatePic } from '@/pages/CreatePic';
import { MyPics } from '@/pages/MyPics';
import { Messages } from '@/pages/Messages';
import { Chat } from '@/pages/Chat';
import { Passed } from '@/pages/Passed';
import { Notifications } from '@/pages/Notifications';
import { Profile } from '@/pages/Profile';
import { EditProfile } from '@/pages/EditProfile';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthLoading } = useApp();
  if (isAuthLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthLoading } = useApp();
  if (isAuthLoading) return null;
  if (isAuthenticated) return <Navigate to="/discover" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
      <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />

      {/* Auth-required but no shell */}
      <Route path="/profile/setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />

      {/* Authenticated — with app shell */}
      <Route path="/discover" element={<ProtectedRoute><AppShell><Discover /></AppShell></ProtectedRoute>} />
      <Route path="/pic/:id" element={<ProtectedRoute><AppShell><PicDetails /></AppShell></ProtectedRoute>} />
      <Route path="/create-pic" element={<ProtectedRoute><AppShell><CreatePic /></AppShell></ProtectedRoute>} />
      <Route path="/my-pics" element={<ProtectedRoute><AppShell><MyPics /></AppShell></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><AppShell><Messages /></AppShell></ProtectedRoute>} />
      <Route path="/messages/:id" element={<ProtectedRoute><AppShell><Chat /></AppShell></ProtectedRoute>} />
      <Route path="/passed" element={<ProtectedRoute><AppShell><Passed /></AppShell></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><AppShell><Notifications /></AppShell></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AppShell><Profile /></AppShell></ProtectedRoute>} />
      <Route path="/profile/edit" element={<ProtectedRoute><AppShell><EditProfile /></AppShell></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer />
      </BrowserRouter>
    </AppProvider>
  );
}
