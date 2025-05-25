import { useState } from "react"
import { supabase } from "../lib/supabase"
import { Link } from "react-router-dom"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isEmailSent, setIsEmailSent] = useState(false)

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setIsEmailSent(true)
    }
  }

  if (isEmailSent) {
    return (
      <div style={{ 
        textAlign: "center", 
        marginTop: "50px", 
        padding: "20px",
        maxWidth: "500px",
        margin: "50px auto"
      }}>
        <div style={{
          fontSize: "48px",
          marginBottom: "20px"
        }}>
          📨
        </div>
        <h2>Check your email!</h2>
        <p>We've sent a password reset link to:</p>
        <p style={{ 
          fontWeight: "bold", 
          fontSize: "18px",
          color: "#4CAF50",
          margin: "20px 0"
        }}>
          {email}
        </p>
        <p style={{ color: "#666", marginTop: "20px" }}>
          Click the link in the email to reset your password.
        </p>
        <p style={{ marginTop: "30px" }}>
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h2>Forgot Password</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Enter your email address and we'll send you a link to reset your password.
      </p>
      <form onSubmit={handleResetPassword}>
        <input 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          placeholder="Email" 
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
          {loading ? "Sending..." : "Send Reset Link"}
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
          Remember your password? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  )
} 