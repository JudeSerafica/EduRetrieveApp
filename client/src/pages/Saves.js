import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import useAuthStatus from '../hooks/useAuthStatus';
import { FaBookmark } from 'react-icons/fa';

function Saves() {
  const { user, loading: authLoading } = useAuthStatus();
  const [savedModules, setSavedModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSavedModulesDetails = useCallback(async () => {
    if (!user || authLoading) {
      setSavedModules([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userSavedModulesRef = collection(db, `users/${user.uid}/savedModules`);
      const savedSnapshot = await getDocs(userSavedModulesRef);
      const savedModulesPromises = [];

      savedSnapshot.forEach(savedDoc => {
        const moduleId = savedDoc.id;

        const moduleDocRef = doc(db, 'modules', moduleId);
        savedModulesPromises.push(
          getDoc(moduleDocRef).then(moduleSnap => {
            if (moduleSnap.exists()) {
              return { id: moduleSnap.id, ...moduleSnap.data() };
            }
            return null;
          })
        );
      });

      const fetchedDetails = await Promise.all(savedModulesPromises);
      setSavedModules(fetchedDetails.filter(module => module !== null));

    } catch (err) {
      console.error('Error fetching saved module details:', err);
      setError('Failed to load your saved modules. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    fetchSavedModulesDetails();
  }, [fetchSavedModulesDetails]);

  const handleUnsaveModule = async (moduleId) => {
    if (!user) {
      alert('You must be logged in to unsave modules.');
      return;
    }

    try {
      const savedModuleDocRef = doc(db, `users/${user.uid}/savedModules`, moduleId);
      await deleteDoc(savedModuleDocRef);

      setSavedModules(prevModules => prevModules.filter(m => m.id !== moduleId));
      console.log(`Module ${moduleId} unsaved from Saves page.`);
      setError(null);
    } catch (err) {
      console.error('Error unsaving module:', err);
      setError('Failed to unsave module. Please try again.');
    }
  };

  if (authLoading) {
    return <div className="dashboard-loading">Loading user authentication...</div>;
  }

  if (!user) {
    return <div className="dashboard-not-logged-in">Please log in to view your saved modules.</div>;
  }

  return (
    <div className="dashboard-content-page">
      <h2>My Saved Modules</h2>
      {loading && <div className="dashboard-loading">Loading saved modules...</div>}
      {error && <div className="dashboard-error">{error}</div>}
      {!loading && savedModules.length === 0 && (
        <div className="dashboard-empty">You haven't saved any modules yet. Go to the dashboard to save some!</div>
      )}

      <div className="module-list">
        {!loading && savedModules.map((module) => (
          <div key={module.id} className="module-card">
            <div className="module-card-header">
              <h3>{module.title}</h3>
              <button
                className="save-module-button saved"
                onClick={() => handleUnsaveModule(module.id)}
                aria-label="Unsave module"
                title="Unsave module"
              >
                <FaBookmark className="saved-icon" />
              </button>
            </div>
            <p><strong>Outline:</strong></p>
            <p className="module-description">{module.description}</p>
            <p className="module-meta">
                Uploaded by: {module.uploadedBy} at {module.uploadedAt ? new Date(module.uploadedAt.toDate()).toLocaleString() : 'N/A'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Saves;