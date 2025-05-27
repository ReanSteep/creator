import { useEffect, useState } from 'react'
import './App.css'
import { supabase } from './supabaseClient'
import Chat from './components/Chat'

function App() {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user ?? null)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) setError(error.message)
    else alert('Check your email for the magic link!')
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 400, margin: 'auto', padding: 32 }}>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginBottom: 8 }}
          />
          <button type="submit" disabled={loading} style={{ width: '100%', padding: 8 }}>
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    )
  }

  return (
    <div>
      <div style={{ padding: '10px 20px', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Welcome, {user.email}</h2>
        <button onClick={handleLogout} style={{ padding: '8px 16px' }}>Logout</button>
      </div>
      <Chat />
    </div>
  )
}

export default App
