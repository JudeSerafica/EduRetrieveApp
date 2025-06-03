import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy, doc, setDoc, deleteDoc } from 'firebase/firestore';
import useAuthStatus from '../hooks/useAuthStatus';
import { FaRegBookmark } from 'react-icons/fa';

function Dashboard() {
  const { user, loading: authLoading } = useAuthStatus();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedModuleIds, setSavedModuleIds] = useState(new Set());

  useEffect(() => {
    const fetchAllData = async () => {
      if (authLoading) return;

      setLoading(true);
      setError(null);

      try {
        const modulesCollectionRef = collection(db, 'modules');
        const q = query(modulesCollectionRef, orderBy('uploadedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        let allFetchedModules = [];
        querySnapshot.forEach((doc) => {
          allFetchedModules.push({ id: doc.id, ...doc.data() });
        });

        let currentSavedIds = new Set();
        if (user) {
          const userSavedModulesRef = collection(db, `users/${user.uid}/savedModules`);
          const savedSnapshot = await getDocs(userSavedModulesRef);
          savedSnapshot.forEach(doc => {
            currentSavedIds.add(doc.id);
          });
        }
        setSavedModuleIds(currentSavedIds);

        const filteredModules = allFetchedModules.filter(module => !currentSavedIds.has(module.id));
        setModules(filteredModules);

      } catch (err) {
        console.error('Error fetching data for dashboard:', err);
        setError('Failed to load modules. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [authLoading, user]);

  const handleToggleSave = async (moduleId, moduleTitle) => {
    if (!user) {
      alert('You must be logged in to save modules!');
      return;
    }

    const isCurrentlySaved = savedModuleIds.has(moduleId);
    const savedModuleDocRef = doc(db, `users/${user.uid}/savedModules`, moduleId);

    try {
      if (isCurrentlySaved) {
        await deleteDoc(savedModuleDocRef);
        setSavedModuleIds(prev => {
          const newState = new Set(prev);
          newState.delete(moduleId);
          return newState;
        });
        console.log(`Module ${moduleId} unsaved.`);
      } else {
        await setDoc(savedModuleDocRef, {
            title: moduleTitle,
            savedAt: new Date()
        });
        setSavedModuleIds(prev => new Set(prev).add(moduleId));
        setModules(prevModules => prevModules.filter(m => m.id !== moduleId));
        console.log(`Module ${moduleId} saved.`);
      }
      setError(null);
    } catch (err) {
      console.error('Error toggling save status:', err);
      setError(`Failed to ${isCurrentlySaved ? 'unsave' : 'save'} module. Please try again.`);
    }
  };

  if (authLoading) {
    return <div className="dashboard-loading">Loading user authentication...</div>;
  }

  if (!user) {
    return <div className="dashboard-not-logged-in">Please log in to view modules.</div>;
  }

  return (
    <div className="dashboard-page">
      <h2>Available Modules</h2>
      {loading && <div className="dashboard-loading">Loading modules...</div>}
      {error && <div className="dashboard-error">{error}</div>}
      {!loading && modules.length === 0 && (
        <div className="dashboard-empty">No modules available yet. Upload one or check your saved list!</div>
      )}
      <div className="module-list">
        {!loading && modules.map((module) => (
          <div key={module.id} className="module-card">
            <div className="module-card-header">
              <h3>{module.title}</h3>
              {}
              <button
                className="save-module-button"
                onClick={() => handleToggleSave(module.id, module.title)}
                aria-label="Save module"
                title="Save module"
              >
                <FaRegBookmark className="unsaved-icon" />
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

export default Dashboard;