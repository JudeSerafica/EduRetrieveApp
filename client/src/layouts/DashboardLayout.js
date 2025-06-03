import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate, Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../styles/App.css';

function DashboardLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser) {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User logged out');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error.message);
    }
  };

  if (loading) {
    return <div className="loading-full-page">Loading dashboard layout...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-layout">
      <Header user={user} />
      <div className="dashboard-content-wrapper">
        <Sidebar onLogout={handleLogout} />
        <main className="dashboard-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;