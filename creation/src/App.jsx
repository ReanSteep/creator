import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Counter from './pages/Counter'
import ForgotPassword from './pages/ForgotPassword'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for changes on auth state (sign in, sign out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/counter" />} />
        <Route path="/signup" element={!session ? <Signup /> : <Navigate to="/counter" />} />
        <Route path="/forgot-password" element={!session ? <ForgotPassword /> : <Navigate to="/counter" />} />
        <Route path="/counter" element={session ? <Counter /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={session ? "/counter" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
