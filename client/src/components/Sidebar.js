import { NavLink } from 'react-router-dom';
import { FaHome, FaComments, FaUpload, FaBookmark, FaSignOutAlt } from 'react-icons/fa';

function Sidebar({ onLogout }) {
  return (
    <nav className="dashboard-sidebar">
      <div className="sidebar-top">
        <NavLink to="/dashboard/home" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          <FaHome className="sidebar-icon" /> Home
        </NavLink>
        <NavLink to="/dashboard/chats" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          <FaComments className="sidebar-icon" /> Chats
        </NavLink>
        <NavLink to="/dashboard/upload" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          <FaUpload className="sidebar-icon" /> Upload
        </NavLink>
        <NavLink to="/dashboard/saves" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          <FaBookmark className="sidebar-icon" /> Saves
        </NavLink>
      </div>
      <div className="sidebar-bottom">
        <button onClick={onLogout} className="sidebar-link logout-button">
          <FaSignOutAlt className="sidebar-icon" /> Logout
        </button>
      </div>
    </nav>
  );
}

export default Sidebar;