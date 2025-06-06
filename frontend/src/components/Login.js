import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    axios.post("http://localhost:8888/login", { email, password })
      .then(res => {
        if (res.data.status === "success") {
          setUser({ user_id: res.data.user_id, name: res.data.name });
          navigate("/");
        } else {
          setError(res.data.message);
        }
      })
      .catch(err => {
        setError("Login failed");
        console.error(err);
      });
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleLogin}>
        
        <div>
          <label>Email:</label><br />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>

        <div>
          <label>Password:</label><br />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>

        <button type="submit">Login</button>
      </form>

      <p>Don't have an account? <Link to="/register">Register here</Link></p>
    </div>
  );
}

export default Login;