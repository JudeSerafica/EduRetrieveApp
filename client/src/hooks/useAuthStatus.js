import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';

const useAuthStatus = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [protectedData, setProtectedData] = useState(null);
  const [dataError, setDataError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    const fetchProtectedData = async () => {
      if (user) {
        try {
          const idToken = await user.getIdToken();

          const response = await fetch('/api/protected-data', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`,
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch protected data.');
          }

          const data = await response.json();
          setProtectedData(data);
          setDataError('');
        } catch (error) {
          console.error('Error fetching protected data:', error);
          setDataError(error.message);
        }
      } else {
        setProtectedData(null);
        setDataError('');
      }
    };

    fetchProtectedData();
  }, [user]);

  return { user, loading, protectedData, dataError };
};

export default useAuthStatus;
