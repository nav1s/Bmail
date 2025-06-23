import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Import styling
import "../styles/AuthForm.css";

import RegisterForm from "./forms/RegisterForm";
import useRegister from "../hooks/useRegister";

/**
 * RegisterPage
 *
 * Displays the user registration page.
 * Uses RegisterForm for UI, and manages form state + submission.
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const { handleRegister, error } = useRegister();

  // Form state for text inputs
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  // Profile photo file input
  const [file, setFile] = useState(null);

  // Handle typing into text fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle registration form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await handleRegister(form, file);
    if (success) {
      navigate("/login");
    }
  };

  return (
    <RegisterForm
      form={form}
      onChange={handleChange}
      onFileChange={handleFileChange}
      onSubmit={handleSubmit}
      error={error}
    />
  );
}
