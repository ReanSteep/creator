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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#232526] to-[#414345]">
      <div className="bg-[#23272f] border border-[#2c313a] rounded-xl shadow-2xl p-8 flex flex-col items-center w-full max-w-sm">
        <img src="/logo.png" alt="App Logo" className="w-16 mb-4" />
        <h2 className="text-2xl font-bold text-gray-100 mb-6 tracking-wide">Sign In</h2>
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-md bg-[#181a20] text-gray-100 border border-[#353945] focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-base font-mono"
          />
          <button
            type="submit"
            className="w-full py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-base tracking-wide transition-colors duration-150 shadow-md disabled:bg-gray-600"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>
        <button
          className="w-full mt-2 py-2 rounded-md bg-[#23272f] text-gray-400 font-medium text-sm border border-[#353945] cursor-not-allowed"
          disabled
        >
          Forgot Password
        </button>
        <div className="mt-6 text-gray-400 text-center text-sm font-mono">
          Private, encrypted collaboration. No passwords.
        </div>
        {message && <div className="mt-4 text-blue-400 text-center font-semibold">{message}</div>}
      </div>
    </div>
  );
}
