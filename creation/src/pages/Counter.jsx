import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

export default function Counter() {
  const [count, setCount] = useState(0)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Get the current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  const handleClick = () => {
    setCount(count + 1)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome{user?.email ? `, ${user.email}` : ''}!</h1>
      <p style={{ color: "#666", marginBottom: "30px" }}>
        You're successfully logged in 🎉
      </p>
      
      <div style={{
        backgroundColor: "#f5f5f5",
        padding: "40px",
        borderRadius: "10px",
        display: "inline-block",
        marginBottom: "30px"
      }}>
        <h2 style={{ fontSize: "48px", margin: "20px" }}>{count}</h2>
        <button 
          onClick={handleClick} 
          style={{ 
            fontSize: "24px", 
            padding: "15px 30px", 
            cursor: "pointer",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            transition: "background-color 0.3s"
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#45a049"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#4CAF50"}
        >
          Click Me!
        </button>
      </div>
      
      <br />
      
      <button 
        onClick={handleSignOut} 
        style={{ 
          marginTop: "30px", 
          padding: "10px 20px", 
          cursor: "pointer",
          backgroundColor: "#f44336",
          color: "white",
          border: "none",
          borderRadius: "5px",
          transition: "background-color 0.3s"
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = "#da190b"}
        onMouseOut={(e) => e.target.style.backgroundColor = "#f44336"}
      >
        Sign Out
      </button>
    </div>
  )
} 