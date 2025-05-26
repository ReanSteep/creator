import ServerList from "../components/ServerList";

export default function Home() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#101214" }}>
      <ServerList />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#23272b" }}>
        <h2 style={{ color: "#fff", fontWeight: "bold", fontSize: 32 }}>Welcome to Discord Clone</h2>
      </div>
    </div>
  );
} 