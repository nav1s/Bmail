import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import "../styles/AuthForm.css";

// Layout
import AppLayout from "../components/layout/AppLayout";

// Login logic and UI
import useLogin from "../hooks/useLogin";
import LoginForm from "./forms/LoginForm";

/**
 * LoginPage
 *
 * Displays the login form for user authentication.
 * Uses AppLayout to provide shared layout (Header, dark mode toggle).
 * Handles user input, form state, and login logic via custom hook.
 */
export default function LoginPage() {
  // Form state for controlled inputs
  const [form, setForm] = useState({ username: "", password: "" });

  // Custom hook handles login logic (auth, token, user info)
  const { handleLogin, error } = useLogin();

  // Used for redirecting after successful login
  const navigate = useNavigate();

  /**
   * Updates form state in real time as user types
   */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /**
   * Handles form submission:
   * - Prevents default behavior
   * - Calls login logic from hook
   * - Navigates to inbox if successful
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await handleLogin(form.username, form.password);
    if (success) {
      navigate("/mails/inbox");
    }
  };

  return (
    <>
      <LoginForm
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        error={error}
      />
    </>
  );
}
