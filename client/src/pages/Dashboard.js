import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import useAuthStatus from '../hooks/useAuthStatus';

function Dashboard() {
  const { user, loading } = useAuthStatus();
  const navigate = useNavigate();

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
    return <div>Loading dashboard...</div>;
  }

  return (
    <div>
      <h2>Dashboard</h2>
      {user ? (
        <>
          <p>Welcome, {user.email}!</p>
          <p>This is your EduRetrieve Dashboard. More content coming soon!</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <p>You are not logged in. Please <a href="/login">login</a>.</p>
      )}
    </div>
  );
}

export default Dashboard;