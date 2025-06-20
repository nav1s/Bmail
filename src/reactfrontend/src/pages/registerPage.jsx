import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useRegister from "../hooks/useRegister";
import RegisterForm from "../components/auth/RegisterForm";

/**
 * Page for user registration.
 * Uses:
 * - useRegister: handles registration logic
 * - RegisterForm: handles UI layout
 */
export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  const { handleRegister, error } = useRegister();
  const navigate = useNavigate();

  /**
   * Updates form state as user types.
   */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /**
   * Submits the form via custom hook.
   * Redirects on success.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await handleRegister(form);
    if (success) {
      navigate("/login");
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <RegisterForm form={form} onChange={handleChange} onSubmit={handleSubmit} error={error} />
      <Link to="/login">Already have an account? Login</Link>
    </div>
  );
}
