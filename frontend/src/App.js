

import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";

import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Cart from "./components/Cart";

function NavBar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate("/");
  };

  return (
    <nav style={{ marginBottom: 20 }}>
      <Link to="/" style={{ marginRight: 15 }}>🏠Home</Link>
      <Link to="/cart" style={{ marginRight: 15 }}>🛒My Cart</Link>

      {user ? (
        <>
          <span style={{ marginRight: 15 }}>Welcome, {user.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login" style={{ marginRight: 15 }}>🔑Login</Link>
          <Link to="/register">📝Register</Link>
        </>
      )}
    </nav>
  );
}

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <NavBar user={user} setUser={setUser} />

      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart user={user} />} />
      </Routes>
    </Router>
  );
}

export default App;
