import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FaRegBookmark } from 'react-icons/fa';
import useAuthStatus from '../hooks/useAuthStatus';

function Dashboard() {
  const { user, loading: authLoading } = useAuthStatus();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [savedModuleIds, setSavedModuleIds] = useState(new Set());

  useEffect(() => {
    const fetchModules = async () => {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('uploadedAt', { ascending: false });

      if (data) setModules(data);
    };

    fetchModules();
  }, []);

  // ✅ Fetch user's saved modules
  useEffect(() => {
    const fetchSaved = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('save_modules')
        .select('module_id')
        .eq('user_id', user.id);

      if (data) {
        const ids = new Set(data.map((row) => row.module_id));
        setSavedModuleIds(ids);
      }
    };

    fetchSaved();
  }, [user]);

  // ✅ Save or Unsave a module
  const handleToggleSave = async (moduleId, moduleTitle) => {
    if (!user) {
      alert('You must be logged in to save modules.');
      return;
    }

    const isSaved = savedModuleIds.has(moduleId);

    try {
      if (isSaved) {
        // Unsave
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
        // Save
        const { error } = await supabase.from('save_modules').insert({
          user_id: user.id,
          module_id: moduleId,
          title: moduleTitle,
        });

        if (error) throw error;

        setSavedModuleIds((prev) => new Set(prev).add(moduleId));
        navigate('/dashboard/saves');
      }
    } catch (err) {
      console.error('❌ Save/Unsave error:', err.message);
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="dashboard-page">
      <h2>Available Modules</h2>
      <div className="module-list">
        {modules.map((module) => (
          <div key={module.id} className="module-card">
            <div className="module-card-header">
              <h3>{module.title}</h3>
              <button
                onClick={() => handleToggleSave(module.id, module.title)}
                className="save-module-button"
              >
                <FaRegBookmark
                  className={`save-icon ${
                    savedModuleIds.has(module.id) ? 'saved' : 'unsaved'
                  }`}
                />
              </button>
            </div>
            <p>{module.description}</p>
            {module.file_url && (
              <p>
                <a href={module.file_url} target="_blank" rel="noopener noreferrer">
                  📎 View Uploaded File
                </a>
              </p>
            )}
            <p>
              Uploaded by: {module.uploadedBy} <br />
              at {new Date(module.uploadedAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;













