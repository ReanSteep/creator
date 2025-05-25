import { useState } from "react"
import { supabase } from "../lib/supabase"
import { Link } from "react-router-dom"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleReset = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    setLoading(false)
    if (error) setError(error.message)
    else setMessage("Password reset email sent!")
  }

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", padding: 40, textAlign: "center" }}>
      <h2>Forgot Password</h2>
      <form onSubmit={handleReset}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />
        <button type="submit" style={{ width: "100%", padding: 10 }} disabled={loading}>
          {loading ? "Sending..." : "Send Reset Email"}
        </button>
        {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
        {message && <div style={{ color: "green", marginTop: 10 }}>{message}</div>}
      </form>
      <div style={{ marginTop: 20 }}>
        <Link to="/login">Back to Login</Link>
      </div>
    </div>
  )
} 