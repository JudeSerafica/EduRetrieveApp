import React, { useState } from 'react';
import useAuthStatus from '../hooks/useAuthStatus';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function Upload() {
  const { user } = useAuthStatus();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
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
    let fileUrl = null;

    try {
      // 1. Upload file to storage if selected
      if (file) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('eduretrieve')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from('eduretrieve')
          .getPublicUrl(filePath);

        fileUrl = publicData.publicUrl;
      }

      // 2. Insert metadata to `modules` table
      const { error } = await supabase.from('modules').insert({
        title,
        description,
        uploadedBy: user.email,
        uploadedAt: new Date().toISOString(),
        user_id: user.id,
        file_url: fileUrl,
      });

      if (error) throw error;

      setMessage('Module uploaded successfully!');
      setTitle('');
      setDescription('');
      setFile(null);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      console.error('Upload error:', error);
      setMessage(`Upload failed: ${error.message || JSON.stringify(error)}`);
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
          <label htmlFor="file">Attach File (optional):</label>
          <input
            type="file"
            id="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx"
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










