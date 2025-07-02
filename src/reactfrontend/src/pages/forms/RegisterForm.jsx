import React from "react";
import "../../styles/RegisterForm.css";
import "../../styles/AccountPopup.css";
import { useNavigate } from "react-router-dom";


/**
 * Presentational component for the registration form.
 */
export default function RegisterForm({ form = {}, onChange, onFileChange, onSubmit, error }) {
  const navigate = useNavigate();
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register</h2>
        <form onSubmit={onSubmit} encType="multipart/form-data">
          <input
            name="username"
            value={form.username}
            onChange={onChange}
            placeholder="Username"
            required
          />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            placeholder="Password"
            required
          />
          <input
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={onChange}
            placeholder="Confirm Password"
            required
          />
          <input
            name="firstName"
            value={form.firstName}
            onChange={onChange}
            placeholder="First Name"
            required
          />
          <input
            name="lastName"
            value={form.lastName}
            onChange={onChange}
            placeholder="Last Name"
            required
          />

          <label>
            <div>Profile Photo:</div>
            <label  className="custom-file-upload">
            <input type="file" accept="image/*" onChange={onFileChange} />
            📁 Upload Profile Picture
            </label >
          </label>
          <button type="submit">Register</button>
          <button className="login-link" onClick={() => navigate('/login')}>
            Already have an account? Login
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      </div>
    </div>
  );
}
