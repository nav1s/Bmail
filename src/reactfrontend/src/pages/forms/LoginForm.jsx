// src/components/auth/LoginForm.jsx
import React from "react";

/**
 * Pure presentational component: renders login form UI
 */
export default function LoginForm({ form, onChange, onSubmit, error }) {
  return (
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
    </form>
  );
}
