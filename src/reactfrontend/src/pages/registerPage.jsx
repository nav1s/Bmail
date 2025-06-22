import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

// Layout
import AppLayout from "../components/layout/AppLayout";

// Auth logic and UI
import useRegister from "../hooks/useRegister";
import RegisterForm from "./forms/RegisterForm";

/**
 * RegisterPage
 *
 * Displays the user registration form.
 * Uses AppLayout to provide shared layout (Header, dark mode toggle).
 * Delegates form rendering to RegisterForm and handles logic via useRegister hook.
 */
export default function RegisterPage() {
  // Form state for controlled inputs
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  // Registration logic (API call, validation, etc.)
  const { handleRegister, error } = useRegister();

  // Router for redirecting after success
  const navigate = useNavigate();

  /**
   * Updates form fields on input change.
   */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /**
   * Submits the form and redirects to login on success.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await handleRegister(form);
    if (success) {
      navigate("/login");
    }
  };

  return (
    <AppLayout>
      <div style={{ padding: "1rem" }}>
        <h2>Register</h2>

        <RegisterForm
          form={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          error={error}
        />

        <Link to="/login" style={{ display: "block", marginTop: "1rem" }}>
          Already have an account? Login
        </Link>
      </div>
    </AppLayout>
  );
}
