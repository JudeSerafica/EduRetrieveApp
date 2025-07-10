import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import useAuthStatus from '../hooks/useAuthStatus';
import { FaBookmark } from 'react-icons/fa';
import { getAuth } from 'firebase/auth';

function Saves() {
  const { user, authLoading } = useAuthStatus();
  const [savedModules, setSavedModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Debug: log when user is ready
  useEffect(() => {
    if (authLoading) {
      console.log('⏳ Waiting for auth to finish...', { authLoading, user });
      return;
    }

    if (!user) {
      console.warn('⛔ No user logged in');
      return;
    }

    console.log('✅ User ready:', user.uid);
    // your fetchSavedModules logic here...
  }, [authLoading, user]);

  // ✅ Fetch user's saved modules
  useEffect(() => {
    const controller = new AbortController();

    const fetchSavedModules = async () => {
      if (authLoading || !user) return;

      try {
        const token = await user.getIdToken();
        const res = await fetch('http://localhost:4000/get-saved-modules', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to load saved modules');

        setSavedModules(result.modules);
      } catch (err) {
        console.error('🚨 Error loading saved modules:', err.message);
        setError('Failed to load your saved modules.');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedModules();
    window.addEventListener('saved-modules-updated', fetchSavedModules);
    return () => {
      controller.abort();
      window.removeEventListener('saved-modules-updated', fetchSavedModules);
    };
  }, [user, authLoading]);

  // ✅ Unsave function
  const handleUnsaveModule = async (moduleId) => {
    if (!user) {
      alert('You must be logged in to unsave modules.');
      return;
    }

    try {
      const token = await getAuth().currentUser.getIdToken();

      const res = await fetch('http://localhost:4000/unsave-module', {
        method: 'POST', // Change to DELETE if your backend expects it
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ module_id: moduleId }),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Failed to unsave module');
      }

      // ✅ Optimistically remove from UI
      setSavedModules((prev) => prev.filter((m) => m.id !== moduleId));
      setError(null);
      window.dispatchEvent(new Event('saved-modules-updated'));
    } catch (err) {
      console.error('❌ Error unsaving module:', err.message);
      setError('Failed to unsave module.');
    }
  };

  if (authLoading) return <div className="dashboard-loading">Loading authentication...</div>;
  if (!user) return <div className="dashboard-not-logged-in">Please log in to view saved modules.</div>;

  return (
    <div className="dashboard-content-page">
      <h2>My Saved Modules</h2>
      {loading && <div className="dashboard-loading">Loading saved modules...</div>}
      {error && <div className="dashboard-error">{error}</div>}
      {!loading && savedModules.length === 0 && (
        <div className="dashboard-empty">You haven't saved any modules yet.</div>
      )}

      <div className="module-list">
        {savedModules.map((module) => (
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
            {module.file_url && (
            <button
               className="view-file-button"
                onClick={() => window.open(module.file_url, '_blank')}
            >
               📄 View File
            </button>
          )}
            <p className="module-meta">
              Uploaded by: {module.uploadedBy}<br />
              at {module.uploadedAt ? new Date(module.uploadedAt).toLocaleString() : 'N/A'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Saves;
