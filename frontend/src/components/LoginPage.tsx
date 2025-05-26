import { useState } from 'react';
import { supabase } from '../auth/supabaseClient';
import '../App.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Check your email for the magic link!');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">Creator</div>
        <form onSubmit={handleLogin} className="login-form">
          <label htmlFor="email" className="login-label">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="login-input"
          />
          <div className="login-btn-row">
            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
            <button
              className="login-forgot"
              disabled
            >
              Forgot Password
            </button>
          </div>
        </form>
        <div className="login-subtext">
          Private, encrypted collaboration. No passwords.
        </div>
        {message && <div className="login-message">{message}</div>}
      </div>
    </div>
  );
}
