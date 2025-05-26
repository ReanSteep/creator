import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AuthProvider from './providers/AuthProvider';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider
        theme={{
          colorScheme: 'dark',
          colors: {
            'steam-dark': ['#171a21', '#171a21', '#171a21', '#171a21', '#171a21', '#171a21', '#171a21', '#171a21', '#171a21', '#171a21'],
            'steam-light': ['#1b2838', '#1b2838', '#1b2838', '#1b2838', '#1b2838', '#1b2838', '#1b2838', '#1b2838', '#1b2838', '#1b2838'],
            'steam-blue': ['#66c0f4', '#66c0f4', '#66c0f4', '#66c0f4', '#66c0f4', '#66c0f4', '#66c0f4', '#66c0f4', '#66c0f4', '#66c0f4'],
          },
        }}
      >
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </AuthProvider>
        </Router>
      </MantineProvider>
    </QueryClientProvider>
  );
}

export default App;
