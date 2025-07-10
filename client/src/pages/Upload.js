import React, { useState, useEffect } from 'react'; 
import useAuthStatus from '../hooks/useAuthStatus';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

function Upload() {
  const { user, authLoading } = useAuthStatus(); // Firebase user
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      console.warn("⛔ No user logged in");
      return;
    }
    console.log("✅ User ready:", user.uid);
  }, [authLoading, user]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!user) {
      setMessage('You must be logged in to upload a module.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setMessage('Module title and outline cannot be empty.');
      return;
    }

    setIsSubmitting(true);

    try {
      const auth = getAuth();
      const firebaseUser = auth.currentUser;

      if (!firebaseUser) throw new Error("Failed to retrieve Firebase user.");

      const token = await firebaseUser.getIdToken(); // 🔐 Firebase ID token

      // === 📤 Upload via backend API using FormData ===
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (file) {
        formData.append('file', file);
      }

      const response = await fetch('http://localhost:4000/upload-module', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`, // 🔐 Pass Firebase token
        },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        console.error("🛑 Backend responded with error:", result.error);
        throw new Error(result.error || 'Upload failed.');
      }

      // === ✅ Success ===
      setMessage('✅ Module uploaded successfully!');
      setTitle('');
      setDescription('');
      setFile(null);
      sessionStorage.removeItem('modules');

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('🚫 Upload error:', err);
      setMessage(`Upload failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="upload-page">
      <h2>Upload New Module Outline</h2>
      <form onSubmit={handleUpload} className="upload-form">
        <div className="form-group">
          <label htmlFor="title">Module Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Introduction to Calculus"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Module Outline/Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide a detailed outline of the module topics, learning objectives, etc."
            rows="10"
            required
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="file">Attach a file (optional):</label>
          <input
            type="file"
            id="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Module Outline'}
        </button>

        {message && <p className="upload-status-message">{message}</p>}
      </form>
    </div>
  );
}

export default Upload;
