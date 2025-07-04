import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import useAuthStatus from '../hooks/useAuthStatus';
import { FaBookmark } from 'react-icons/fa';

function Saves() {
  const { user, loading: authLoading } = useAuthStatus();
  const [savedModules, setSavedModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSavedModules = async () => {
      if (authLoading || !user || !user.uid) return;

      console.log('👤 Firebase UID:', user.uid);
      setLoading(true);
      setError(null);

      try {
        // Step 1: Get all saved module IDs
        const { data: savedRows, error: savedError } = await supabase
          .from('save_modules')
          .select('module_id')
          .eq('user_id', user.uid);

        if (savedError) throw savedError;

        const moduleIds = savedRows.map((row) => row.module_id).filter(Boolean);

        console.log('📌 Module IDs:', moduleIds);

        if (moduleIds.length === 0) {
          setSavedModules([]);
          setLoading(false);
          return;
        }

        // Step 2: Fetch module details
        const { data: modulesData, error: modulesError } = await supabase
          .from('modules')
          .select('*')
          .in('id', moduleIds)
          .order('uploadedAt', { ascending: false });

        if (modulesError) throw modulesError;

        console.log('📦 Saved modules:', modulesData);
        setSavedModules(modulesData);
      } catch (err) {
        console.error('🚨 Error loading saved modules:', err);
        setError('Failed to load saved modules.');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedModules();
  }, [user, authLoading]);

  const handleUnsaveModule = async (moduleId) => {
    if (!user) {
      alert('You must be logged in to unsave modules.');
      return;
    }

    try {
      await supabase
        .from('save_modules')
        .delete()
        .eq('user_id', user.uid)
        .eq('module_id', moduleId);

      setSavedModules((prev) => prev.filter((m) => m.id !== moduleId));
      setError(null);
    } catch (err) {
      console.error('❌ Error unsaving module:', err);
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
        {!loading &&
          savedModules.map((module) => (
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
                <p>
                  <a
                    href={module.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-file-link"
                  >
                    📎 View Uploaded File
                  </a>
                </p>
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









