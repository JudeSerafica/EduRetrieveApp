import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { FaUserCircle } from 'react-icons/fa'; //include this if want pfp { FaCamera }
import { supabase } from '../supabaseClient';

function UserProfile({ user }) {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [pfpUrl, setPfpUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
  const fetchUserProfile = async () => {
    if (user) {
      try {
        const token = await user.getIdToken();

        const res = await fetch('http://localhost:4000/get-user-profile', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();
        if (res.ok && result.profile) {
          const { username, fullName, pfpUrl } = result.profile;
          setUsername(username || '');
          setFullName(fullName || '');
          setPfpUrl(pfpUrl || '');
        } else {
          console.warn('No profile found or fetch error:', result.error);
        }
      } catch (err) {
        console.error('❌ Failed to fetch profile:', err.message);
      }
    }
  };

  fetchUserProfile();
}, [user]);


const handleSaveProfile = async () => {
  if (!user) return;
  setMessage('');

  try {
    const token = await user.getIdToken();

    const response = await fetch('http://localhost:4000/sync-user-profile', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        fullName,
        pfpUrl
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Backend update error:', result);
      throw new Error(result.error || 'Failed to update profile.');
    }

    setMessage(result.message || '✅ Profile updated!');
    setIsEditing(false);
  } catch (err) {
    console.error('❌ Error updating profile:', err.message);
    setMessage('❌ Failed to update profile.');
  }
};


  // const handlePfpChange = (e) => {
  //   setMessage('PFP upload not yet implemented.');
  // };

  if (!user) return <p>Please log in to view your profile.</p>;

  return (
    <div className="profile-panel">
      <h4>Your Profile</h4>
      <div className="profile-pfp-section">
        {pfpUrl ? (
          <img src={pfpUrl} alt="Profile" className="profile-pfp" />
        ) : (
          <FaUserCircle className="profile-pfp-placeholder" />
        )}
        {/* {isEditing && (
          <label className="pfp-upload-button">
            <FaCamera /> Change
            <input type="file" accept="image/*" onChange={handlePfpChange} style={{ display: 'none' }} />
          </label>
        )} */}
      </div>
      <div className="profile-info-grid">
        <label>Email:</label>
        <input type="text" value={user.email} disabled className="locked-input" />

        <label>Username:</label>
        {isEditing ? (
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        ) : (
          <span>{username || 'Not set'}</span>
        )}

        <label>Full Name:</label>
        {isEditing ? (
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        ) : (
          <span>{fullName || 'Not set'}</span>
        )}
      </div>

      <div className="profile-actions">
        {isEditing ? (
          <>
            <button onClick={handleSaveProfile}>Save Changes</button>
            <button onClick={() => setIsEditing(false)} className="cancel-button">Cancel</button>
          </>
        ) : (
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        )}
      </div>
      {message && <p className="profile-message">{message}</p>}
    </div>
  );
}

export default UserProfile;