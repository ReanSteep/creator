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
        className="fixed bottom-8 right-8 bg-[#23272f] border border-[#353945] text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-blue-700 transition-colors duration-150 z-50"
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
