import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import useAuthStatus from '../hooks/useAuthStatus';
import { FaBookmark } from 'react-icons/fa';

function Saves() {
  const { user, loading: authLoading } = useAuthStatus();
  const [savedModules, setSavedModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSavedModules = useCallback(async () => {
    if (!user || authLoading) {
      setSavedModules([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Get all saved module references
      const { data: savedData, error: savedError } = await supabase
        .from('save_modules')
        .select('module_id')
        .eq('user_id', user.id);

      if (savedError) throw savedError;

      const moduleIds = savedData.map(row => row.module_id);

      if (moduleIds.length === 0) {
        setSavedModules([]);
        return;
      }

      // Step 2: Fetch actual module data
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .in('id', moduleIds);

      if (modulesError) throw modulesError;

      setSavedModules(modulesData);
    } catch (err) {
      console.error('Error fetching saved modules:', err);
      setError('Failed to load your saved modules. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    fetchSavedModules();
  }, [fetchSavedModules]);

  const handleUnsaveModule = async (moduleId) => {
    if (!user) {
      alert('You must be logged in to unsave modules.');
      return;
    }

    try {
      await supabase
        .from('save_modules')
        .delete()
        .eq('user_id', user.id)
        .eq('module_id', moduleId);

      setSavedModules(prev => prev.filter(m => m.id !== moduleId));
      setError(null);
    } catch (err) {
      console.error('Error unsaving module:', err);
      setError('Failed to unsave module. Please try again.');
    }
  };

  if (authLoading) return <div className="dashboard-loading">Loading user authentication...</div>;
  if (!user) return <div className="dashboard-not-logged-in">Please log in to view your saved modules.</div>;

  return (
    <div className="dashboard-content-page">
      <h2>My Saved Modules</h2>
      {loading && <div className="dashboard-loading">Loading saved modules...</div>}
      {error && <div className="dashboard-error">{error}</div>}
      {!loading && savedModules.length === 0 && (
        <div className="dashboard-empty">
          You haven't saved any modules yet. Go to the dashboard to save some!
        </div>
      )}

      <div className="module-list">
        {!loading && savedModules.map(module => (
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




