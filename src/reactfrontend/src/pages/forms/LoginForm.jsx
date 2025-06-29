// src/components/auth/LoginForm.jsx
import React from "react";
import { Link } from "react-router-dom";

/**
 * Pure presentational component: renders login form UI
 */
export default function LoginForm({ form, onChange, onSubmit, error }) {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        <form onSubmit={onSubmit}>
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
          <button type="submit">Login</button>

          {error && <p>{error}</p>}
          <div className="auth-link">
          <p>
            Don’t have an account?{" "}
            <Link to="/register">Register</Link>
          </p>
        </div>

        </form>
      </div>
    </div>
  );
}
