import React from "react";

/**
 * Presentational component for the registration form.
 */
export default function RegisterForm({ form, onChange, onFileChange, onSubmit, error }) {
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
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
            />
          </label>

          <button type="submit">Register</button>

          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      </div>
    </div>
  );
}
