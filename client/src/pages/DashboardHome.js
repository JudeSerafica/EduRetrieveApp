import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FaRegBookmark } from 'react-icons/fa';
import useAuthStatus from '../hooks/useAuthStatus';

function Dashboard() {
  const { user, loading: authLoading } = useAuthStatus();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedModuleIds, setSavedModuleIds] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading || !user) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch all uploaded modules
        const { data: modulesData, error: modulesError } = await supabase
          .from('modules')
          .select('*')
          .order('uploadedAt', { ascending: false });

        if (modulesError) throw modulesError;

        // Fetch saved module IDs for current user
        const { data: savedData, error: savedError } = await supabase
          .from('save_modules')
          .select('module_id')
          .eq('user_id', user.id);

        if (savedError) throw savedError;

        const savedIds = new Set(savedData.map((row) => row.module_id));
        setSavedModuleIds(savedIds);

        // Filter out already saved modules
        const filteredModules = modulesData.filter((m) => !savedIds.has(m.id));
        setModules(filteredModules);
      } catch (err) {
        console.error('Error fetching data for dashboard:', err);
        setError('Failed to load modules. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, user]);

  const handleToggleSave = async (moduleId, moduleTitle) => {
    if (!user) return alert('You must be logged in to save modules!');

    const isSaved = savedModuleIds.has(moduleId);
    try {
      if (isSaved) {
        await supabase
          .from('save_modules')
          .delete()
          .eq('user_id', user.id)
          .eq('module_id', moduleId);

        setSavedModuleIds((prev) => {
          const updated = new Set(prev);
          updated.delete(moduleId);
          return updated;
        });
      } else {
        await supabase
          .from('save_modules')
          .insert({ user_id: user.id, module_id: moduleId, title: moduleTitle });

        setSavedModuleIds((prev) => new Set(prev).add(moduleId));
        setModules((prev) => prev.filter((m) => m.id !== moduleId));
      }
    } catch (err) {
      console.error('Save/unsave error:', err);
      setError(`Failed to ${isSaved ? 'unsave' : 'save'} module. Please try again.`);
    }
  };

  if (authLoading) return <div className="dashboard-loading">Loading user authentication...</div>;
  if (!user) return <div className="dashboard-not-logged-in">Please log in to view modules.</div>;

  return (
    <div className="dashboard-page">
      <h2>Available Modules</h2>
      {loading && <div className="dashboard-loading">Loading modules...</div>}
      {error && <div className="dashboard-error">{error}</div>}
      {!loading && modules.length === 0 && (
        <div className="dashboard-empty">No modules available yet. Upload one or check your saved list!</div>
      )}
      <div className="module-list">
        {!loading &&
          modules.map((module) => (
            <div key={module.id} className="module-card">
              <div className="module-card-header">
                <h3>{module.title}</h3>
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
                Uploaded by: {module.uploadedBy} <br />
                at {module.uploadedAt ? new Date(module.uploadedAt).toLocaleString() : 'N/A'}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Dashboard;






