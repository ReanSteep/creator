import { AuthProvider, useAuth } from './auth/AuthProvider';
import { supabase } from './auth/supabaseClient';
import LoginPage from './components/LoginPage';
import BlockEditor from './components/BlockEditor';
import './App.css';

function MainApp() {
  // For now, we'll use a hardcoded page ID
  // In a real app, this would come from the URL or state management
  const pageId = 'default-page';

  // Logout handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Creator</h1>
        <button className="btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </header>
      <main className="app-main">
        <BlockEditor pageId={pageId} />
      </main>
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  return user ? <MainApp /> : <LoginPage />;
}

export default function RootApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
