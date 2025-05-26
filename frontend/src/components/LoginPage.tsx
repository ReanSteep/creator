import { useState } from 'react';
import { supabase } from '../auth/supabaseClient';

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
    <div className="login-bg">
      <div className="login-card">
        <img src="/logo.png" alt="App Logo" className="login-logo" />
        <h2>Sign In</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="login-input"
          />
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>
        <button className="login-link" style={{ marginTop: 8 }} disabled>
          Forgot Password
        </button>
        <div className="login-subtext">
          Private, encrypted collaboration. No passwords.
        </div>
        {message && <div className="login-message">{message}</div>}
      </div>
    </div>
  );
}
