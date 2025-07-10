import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FaRegBookmark } from 'react-icons/fa';
import useAuthStatus from '../hooks/useAuthStatus';

function Dashboard() {
  const { user, authLoading } = useAuthStatus();
  const [modules, setModules] = useState([]);
  const [savedModuleIds, setSavedModuleIds] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);

  useEffect(() => {
    if (authLoading || !user) return;
    console.log('✅ User ready:', user.uid);
  }, [authLoading, user]);

  useEffect(() => {
    const fetchModules = async () => {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('uploadedAt', { ascending: false });

      if (error) {
        console.error('❌ Module fetch error:', error.message);
      } else {
        setModules(data || []);
      }
    };

    fetchModules();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchSaved = async () => {
      const { data, error } = await supabase
        .from('save_modules')
        .select('module_id')
        .eq('user_id', user.uid);

      if (error) {
        console.error('❌ Saved fetch error:', error.message);
      } else {
        setSavedModuleIds(new Set(data.map(row => row.module_id)));
      }
    };

    fetchSaved();
  }, [user]);

  const handleToggleSave = async (moduleId, moduleTitle) => {
    if (!user) {
      alert('You must be logged in to save modules.');
      return;
    }

    const isSaved = savedModuleIds.has(moduleId);

    try {
      if (!isSaved) {
        const { error } = await supabase.from('save_modules').insert({
          module_id: moduleId,
          user_id: user.uid,
          title: moduleTitle,
        });

        if (error) throw new Error(error.message);

        setSavedModuleIds(prev => new Set(prev).add(moduleId));
        window.dispatchEvent(new Event('saved-modules-updated'));
      }
    } catch (err) {
      console.error('❌ Save error:', err.message);
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteClick = (id) => {
    setModuleToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!moduleToDelete) return;

    try {
      const token = await user.getIdToken();

      const res = await fetch(`http://localhost:4000/delete-module/${moduleToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to delete');

      setModules(prev => prev.filter(m => m.id !== moduleToDelete));
      const updatedSaved = new Set(savedModuleIds);
      updatedSaved.delete(moduleToDelete);
      setSavedModuleIds(updatedSaved);

      alert('✅ Module deleted successfully');
    } catch (err) {
      console.error('❌ Delete error:', err.message);
      alert(`Delete failed: ${err.message}`);
    } finally {
      setShowDeleteModal(false);
      setModuleToDelete(null);
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
                  className={`save-icon ${savedModuleIds.has(module.id) ? 'saved' : 'unsaved'}`}
                />
              </button>
            </div>

            <div className="module-card-content">
              <p><strong>Outline:</strong></p>
              <p>{module.description}</p>

              {module.file_url && (
                <button
                  className="view-file-button"
                  onClick={() => window.open(module.file_url, '_blank')}
                >
                  📄 View File
                </button>
              )}
              <p>
                Uploaded by: {module.uploadedBy} <br />
                at {new Date(module.uploadedAt).toLocaleString()}
              </p>
            </div>

            <div className="module-card-footer">
              <button
                onClick={() => handleDeleteClick(module.id)}
                className="delete-module-button"
              >
                🗑️ Delete Module
              </button>
            </div>
          </div>
        ))}
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p>Are you sure you want to delete?</p> {/* Changed the message */}
            <div className="modal-buttons">
              <button className="modal-logout-btn" onClick={handleConfirmDelete}>
                Logout
              </button>
              <button className="modal-cancel-btn" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
}

export default Dashboard;
