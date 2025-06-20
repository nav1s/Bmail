import React from "react";

/**
 * Presentational component for the registration form.
 * Props:
 * - form: form state object
 * - onChange: input change handler
 * - onSubmit: submit handler
 * - error: error string
 */
export default function RegisterForm({ form, onChange, onSubmit, error }) {
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
      <button type="submit">Register</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
