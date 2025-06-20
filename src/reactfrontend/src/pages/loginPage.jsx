import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useLogin from "../hooks/useLogin";
import LoginForm from "../components/auth/LoginForm";

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
    <div>
      <h2>Login</h2>

      {/* Renders the login form UI with fields and submit button */}
      <LoginForm
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        error={error}
      />

      {/* Link to registration page */}
      <Link to="/register">Don't have an account? Register</Link>
    </div>
  );
}
