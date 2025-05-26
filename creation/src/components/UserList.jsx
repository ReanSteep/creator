const placeholderUsers = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" },
];

export default function UserList() {
  return (
    <div style={{ background: "#181a1b", minHeight: "100vh", width: 180, padding: 0 }}>
      <h4 style={{ color: "#66c0f4", margin: "20px 0 10px 20px", fontWeight: "bold" }}>Online Users</h4>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {placeholderUsers.map(user => (
          <li key={user.id} style={{ margin: "10px 0 10px 20px", display: "flex", alignItems: "center" }}>
            <span style={{ color: "#5fff5f", marginRight: 10, fontSize: 18 }}>●</span>
            <span style={{ color: "#fff", fontWeight: "bold" }}>{user.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
} 