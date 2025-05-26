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
      <div className="text-white p-8">Welcome to the app!</div>
      <button
        className="fixed bottom-8 right-8 bg-white/5 border border-white/10 text-white font-bold font-mono py-3 px-10 rounded-xl shadow-xl uppercase tracking-wider hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 z-50 backdrop-blur-lg"
        onClick={handleLogout}
      >
        Logout
      </button>
    </>
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
