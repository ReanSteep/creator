import { AuthProvider, useAuth } from './auth/AuthProvider';
import { supabase } from './auth/supabaseClient';
import LoginPage from './components/LoginPage';
import Chat from './components/Chat';
import './App.css';

function MainApp() {
  // Logout handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };
  return (
    <div className="app-bg">
      <div className="main-app-panel">
        <div className="main-app-title">Welcome to the app!</div>
        <Chat />
        <button
          className="fixed bottom-8 right-8 bg-white/5 border border-white/10 text-white font-bold font-mono py-3 px-10 rounded-xl shadow-xl uppercase tracking-wider hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 z-50 backdrop-blur-lg"
          style={{position: 'fixed', bottom: 32, right: 32, background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.10)', color: '#e3e6ea', fontWeight: 700, fontFamily: 'Roboto Mono, monospace', borderRadius: '1rem', boxShadow: '0 4px 24px 0 rgba(31,38,135,0.18)', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '0.9rem 2.5rem', zIndex: 1000, cursor: 'pointer', transition: 'background 0.2s'}}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-white">Loading...</div>;
  return user ? <MainApp /> : <LoginPage />;
}

export default function RootApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
