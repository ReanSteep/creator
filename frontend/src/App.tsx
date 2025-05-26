import { AuthProvider, useAuth } from './auth/AuthProvider';
import LoginPage from './components/LoginPage';
import './App.css';

function MainApp() {
  // Placeholder for post-login UI
  return <div style={{ color: '#fff', padding: 32 }}>Welcome to the app!</div>;
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
