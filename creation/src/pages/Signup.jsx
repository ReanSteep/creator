import { useState } from "react"
import { supabase } from "../lib/supabase"
import { Link } from "react-router-dom"

export default function Signup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)

  const handleSignup = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else alert("Check your email to confirm signup.")
  }

  return (
    <form onSubmit={handleSignup}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
      <button type="submit">Sign Up</button>
      {error && <p>{error}</p>}
      <p>Already have an account? <Link to="/login">Log in</Link></p>
    </form>
  )
}
