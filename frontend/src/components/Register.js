import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    axios.post("http://localhost:8888/register", { name, email, password })
      .then(res => {
        if (res.data.status === "success") {
          setSuccess("Registration successful! You can now login.");
          setError("");
          setName("");
          setEmail("");
          setPassword("");
        } else {
          setError(res.data.message);
          setSuccess("");
        }
      })
      .catch(err => {
        setError("Registration failed");
        setSuccess("");
        console.error(err);
      });
  };

  return (
    <div id="reg_back">
      <h2>Register</h2>
      {success && <p style={{ color: "green" }}>{success}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleRegister}>
        <div>
          <label>Name:</label><br />
          <input type="text" value={name} onChange={e => setName(e.target.value)} required />
        </div>

        <div>
          <label>Email:</label><br />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>

        <div>
          <label>Password:</label><br />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <p></p>

        <button type="submit" id="reg_button">Register</button>
      </form>
      <p>Already have an account? <Link to="/login">Login here</Link></p>
    </div>
  );
}

export default Register;