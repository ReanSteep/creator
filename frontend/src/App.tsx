import { AuthProvider, useAuth } from './auth/AuthProvider';
import { supabase } from './auth/supabaseClient';
import LoginPage from './components/LoginPage';
import './App.css';

function MainApp() {
  // Logout handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };
  return (
    <>
      <div style={{ color: '#fff', padding: 32 }}>Welcome to the app!</div>
      <button
        className="logout-btn"
        onClick={handleLogout}
        style={{
          position: 'fixed',
          right: 32,
          bottom: 32,
          background: 'rgba(40,44,52,0.95)',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          padding: '14px 28px',
          fontSize: '1rem',
          fontWeight: 600,
          boxShadow: '0 4px 16px rgba(31,38,135,0.15)',
          cursor: 'pointer',
          zIndex: 1000,
          transition: 'background 0.2s',
        }}
        onMouseOver={e => (e.currentTarget.style.background = '#4f8cff')}
        onMouseOut={e => (e.currentTarget.style.background = 'rgba(40,44,52,0.95)')}
      >
        Logout
      </button>
    </>
  );
}

function App() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ color: '#fff' }}>Loading...</div>;
  return user ? <MainApp /> : <LoginPage />;
}

export default function RootApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
