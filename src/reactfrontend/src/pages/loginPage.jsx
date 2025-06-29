import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AuthForm.css";
import DarkModeToggle from "../components/layout/DarkModeToggle";

import LoginForm from "./forms/LoginForm";
import useLogin from "../hooks/useLogin";

/**
 * LoginPage
 * Displays the login form for user authentication.
 */
export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const { handleLogin, error } = useLogin();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await handleLogin(form.username, form.password);
    if (success) {
      navigate("/mails/inbox");
    }
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "1rem" }}>
        <DarkModeToggle />
      </div>

      <LoginForm
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        error={error}
      />
    </>
  );
}
