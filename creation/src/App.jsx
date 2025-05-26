import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Server from "./pages/Server";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<Home />} />
        <Route path="/server/:serverId" element={<Server />}/>
        <Route path="/server/:serverId/tab/:tabId" element={<Server />}/>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
} 