import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import ProfileModal from './ProfileModal';

function Header({ user }) {
  const navigate = useNavigate();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User logged out');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error.message);
    }
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <h1 className="app-logo">EduRetrieve</h1>
      </div>
      <div className="header-right">
        {user && <span className="user-greeting">Welcome, {user.email}!</span>}
        <button className="icon-button profile-button" onClick={() => setIsProfileModalOpen(true)}>
          <FaUserCircle />
        </button>
        <button className="icon-button logout-button" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>

      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} user={user} />
    </header>
  );
}

export default Header;