import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for Firebase-only auth (hybrid with Supabase backend via server).
 */
const useAuthStatus = ({ autoRedirect = true, fetchProtectedData = true, debug = false } = {}) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [protectedData, setProtectedData] = useState(null);
  const [dataError, setDataError] = useState('');
  const navigate = useNavigate();

  // ✅ Track Firebase auth state
  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          if (debug) console.log('✅ Firebase user:', firebaseUser.uid);
          setUser(firebaseUser);
        } else {
          if (debug) console.warn('⛔ Firebase user is null');
          setUser(null);
        }
      } catch (err) {
        console.error('❌ Error during Firebase auth check:', err.message);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, [debug]);

  // 🔐 Auto redirect if not logged in
  useEffect(() => {
    if (!authLoading && autoRedirect && !user) {
      console.warn('➡️ Redirecting to /login (no auth)');
      navigate('/login');
    }
  }, [authLoading, autoRedirect, user, navigate]);

  // 🔐 Fetch optional protected backend data
  useEffect(() => {
    let isMounted = true;

    const fetchProtected = async () => {
      if (!user || !fetchProtectedData) return;

      try {
        const idToken = await user.getIdToken();
        const response = await fetch('/api/protected-data', {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message || 'Failed to fetch protected data.');

        if (isMounted) {
          setProtectedData(data);
          setDataError('');
        }
      } catch (err) {
        if (isMounted) {
          setProtectedData(null);
          setDataError(err.message);
        }
        console.error('❌ Protected fetch error:', err.message);
      }
    };

    fetchProtected();
    return () => {
      isMounted = false;
    };
  }, [user, fetchProtectedData]);

  return {
    user,
    authLoading,
    protectedData,
    dataError,
    isAuthenticated: !!user,
  };
};

export default useAuthStatus;
