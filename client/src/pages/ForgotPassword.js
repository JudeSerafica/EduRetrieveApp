import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth} from '../firebaseConfig';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [step, setStep] = useState('emailInput');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email address.');
      setLoading(false);
      return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/reset-password/email-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error during email check.');
      }
      if (!data.exists) {
        setError('No account found with that email address. Please check your spelling or sign up.');
        setLoading(false);
        return;
      }
      await sendPasswordResetEmail(auth, email);
      setMessage('A password reset link has been sent to your email. Please check your inbox.');
      setStep('step2');
      setLoading(false);
    } catch (err) {
      console.error('Password reset email error:', err.message);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-card">
        <h2>Forgot Password?</h2>

        {step === 'emailInput' && (
          <form onSubmit={handleEmailSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address:</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        {step === 'step2' && (
          <div>
            <h1>Email authenticated, please check your email</h1>
            {message && <p className="auth-message success">{message}</p>}
          </div>
        )}

        {error && <p className="auth-message error">{error}</p>}
        {message && step === 'emailInput' && !error && (
            <p className="auth-message success">{message}</p>
        )}

        <p className="back-link">
          Back to <Link to="/login">Login page</Link>
        </p>
      </div>
    </div>
  );
}