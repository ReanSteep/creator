import { useState } from "react"
import { supabase } from "../lib/supabase"
import { Link } from "react-router-dom"

export default function Signup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isSignupComplete, setIsSignupComplete] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/counter`
      }
    })
    
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setIsSignupComplete(true)
    }
  }

  const handleResendEmail = async () => {
    setResendLoading(true)
    setResendSuccess(false)
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/counter`
      }
    })
    
    setResendLoading(false)
    if (!error) {
      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 5000)
    }
  }

  if (isSignupComplete) {
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
          📧
        </div>
        <h2>Check your email!</h2>
        <p>We've sent a confirmation link to:</p>
        <p style={{ 
          fontWeight: "bold", 
          fontSize: "18px",
          color: "#4CAF50",
          margin: "20px 0"
        }}>
          {email}
        </p>
        
        <div style={{
          backgroundColor: "#f5f5f5",
          padding: "20px",
          borderRadius: "10px",
          marginTop: "30px",
          textAlign: "left"
        }}>
          <h4 style={{ marginTop: 0 }}>What to do next:</h4>
          <ol style={{ paddingLeft: "20px" }}>
            <li>Check your email inbox</li>
            <li>Look for an email from Supabase</li>
            <li>Click the confirmation link in the email</li>
            <li>You'll be redirected to the app and can log in</li>
          </ol>
        </div>

        <div style={{ marginTop: "30px" }}>
          <p style={{ marginBottom: "10px", color: "#666" }}>
            Didn't receive the email? Check your spam folder or
          </p>
          <button
            onClick={handleResendEmail}
            disabled={resendLoading}
            style={{
              padding: "10px 20px",
              backgroundColor: resendLoading ? "#ccc" : "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: resendLoading ? "not-allowed" : "pointer",
              marginBottom: "10px"
            }}
          >
            {resendLoading ? "Sending..." : "Resend confirmation email"}
          </button>
          {resendSuccess && (
            <p style={{ color: "#4CAF50", marginTop: "10px" }}>
              ✓ Email sent successfully!
            </p>
          )}
        </div>

        <p style={{ marginTop: "30px" }}>
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
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
          placeholder="Password (min 6 characters)" 
          required 
          minLength={6}
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
          {loading ? "Creating account..." : "Sign Up"}
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
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  )
}
