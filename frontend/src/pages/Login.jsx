import React, { useState } from "react";
import { useNavigate , Link } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // send to backend (axios/fetch)
    console.log("Login Data:", formData);
axios.post("https://chatgpt-clone-ruzm.onrender.com/api/auth/login", formData, {
  withCredentials: true,   // ⚡ Add this line
})
.then((response) => {
  console.log("Login Successful1:", response.data);
        navigate("/");
})
.catch((error) => {
  console.error("Login Error:", error.response?.data || error.message);
});

  };

  return (
    <div className="login-form">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Login</button>
        <Link to="/register" className="switch-link">
          Don't have an account? Register
        </Link>
      </form>
    </div>
  );
};

export default Login;
