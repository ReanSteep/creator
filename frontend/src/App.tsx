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
      </div>
      <div className="logout-btn-fixed">
        <button className="logout-btn" onClick={handleLogout}>
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
