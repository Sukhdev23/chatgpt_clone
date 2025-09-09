import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: {
      firstName: "",
      lastName: "",
    },
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "firstName" || name === "lastName") {
      setFormData({
        ...formData,
        fullName: {
          ...formData.fullName,
          [name]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Register Data:", formData);
    axios
      .post("https://chatgpt-clone-90mn.onrender.com/api/auth/register", formData, {
        withCredentials: true,
      })
      .then(
        (response) => {
          console.log("Registration Successful:", response.data);
          navigate("/");
        }
      )
      .catch((error) => {
        console.error("Registration Error:", error);
      });
  };

  return (
    <div className="register-form">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <div className="name-row">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.fullName.firstName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.fullName.lastName}
            onChange={handleChange}
            required
          />
        </div>

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

        <button type="submit">Register</button>
      </form>

      <Link to="/login" className="switch-link">
        Already have an account? Login
      </Link>
    </div>
  );
};

export default Register;
