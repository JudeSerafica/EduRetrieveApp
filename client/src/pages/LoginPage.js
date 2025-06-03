import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in successfully.');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err.message);
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <img src='../assets/eduretrieve-logo.png' alt='logo-img' className='auth-container-img'/>
      <div className="auth-form-card">
        <div className='auth-header-flex'>
          <h2>Login</h2>
          <img src='../assets/eduretrieve-logo.png' alt='logo-img' className='auth-header-flex-img'/>
        </div>
        <form onSubmit={handleLogin}>
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
          <p>
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
          <button type="submit">Login</button>
        </form>
        {error && <p className="auth-message error">{error}</p>}
        <p>
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;