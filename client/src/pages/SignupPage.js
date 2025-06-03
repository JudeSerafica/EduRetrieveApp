import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';

function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        username: email.split('@')[0],
        fullName: '',
        pfpUrl: '',
        createdAt: new Date(),
      });

      console.log('User signed up:', user);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      console.error('Signup error:', err.message);
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <img src='../assets/eduretrieve-logo.png' alt='logo-img' className='auth-container-img'/>
      
      <div className="auth-form-card">
        <div className='auth-header-flex'>
          <h2>Sign Up</h2>
          <img src='../assets/eduretrieve-logo.png' alt='logo-img' className='auth-header-flex-img'/>
        </div>
        
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value) || setError('')}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value) || setError('')}
              required
            />
          </div>
          <button type="submit">Sign Up</button>
        </form>
        {error && <p className="auth-message error">{error}</p>}
        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;