import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPassword from './pages/ForgotPassword';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import Chats from './pages/Chats';
import Upload from './pages/Upload';
import Saves from './pages/Saves';
import HomePageContent from './HomePageContent';
import ProtectedRoute from './components/ProtectedRoute';

function AuthWrapper() {
  const [loadingInitialAuth, setLoadingInitialAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (
        user &&
        (window.location.pathname === '/' ||
          window.location.pathname === '/login' ||
          window.location.pathname === '/signup')
      ) {
        navigate('/dashboard/home', { replace: true });
      }
      setLoadingInitialAuth(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  if (loadingInitialAuth) {
    return <div className="loading-full-page">Loading application...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<HomePageContent />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="home" element={<DashboardHome />} />
        <Route path="chats" element={<Chats />} />
        <Route path="upload" element={<Upload />} />
        <Route path="saves" element={<Saves />} />
      </Route>
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <AuthWrapper />
      </div>
    </Router>
  );
}

export default App;
