import React, { useState } from 'react';
import useAuthStatus from '../hooks/useAuthStatus';
import { useNavigate } from 'react-router-dom';

function Upload() {
  const { user } = useAuthStatus();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const token = await user.getIdToken();

      const response = await fetch('/api/upload-module', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title,
          description: description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      setMessage(data.message);
      setTitle('');
      setDescription('');

      setTimeout(() => navigate('/dashboard'), 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setMessage(`Upload failed: ${error.message}`);
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

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Module Outline'}
        </button>

        {message && <p className="upload-status-message">{message}</p>}
      </form>
    </div>
  );
}

export default Upload;