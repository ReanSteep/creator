import { useState } from "react"
import { supabase } from "../lib/supabase"
import { Link, useNavigate } from "react-router-dom"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      setError(error.message)
      setLoading(false)
    } else if (data?.user) {
      // Successful login - navigation will be handled by auth state change
      navigate("/counter")
    }
  }

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          placeholder="Email" 
          required 
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <input 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          placeholder="Password" 
          required 
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: "100%", 
            padding: "10px", 
            backgroundColor: loading ? "#ccc" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
        {error && (
          <div style={{ 
            marginTop: "10px", 
            padding: "10px", 
            backgroundColor: "#ffebee", 
            color: "#c62828",
            borderRadius: "5px" 
          }}>
            {error}
          </div>
        )}
        <p style={{ marginTop: "20px", textAlign: "center" }}>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
        <p style={{ marginTop: "10px", textAlign: "center" }}>
          <Link to="/forgot-password">Forgot password?</Link>
        </p>
      </form>
    </div>
  )
}
