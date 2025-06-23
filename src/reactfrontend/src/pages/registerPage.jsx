import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "./forms/RegisterForm";
import useRegister from "../hooks/useRegister";
import AppLayout from "../components/layout/AppLayout";

/**
 * registerPage
 *
 * Renders the user registration page.
 * Manages local state for form fields and file input.
 * Delegates validation and API interaction to useRegister().
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const { handleRegister, error } = useRegister();

  // Form state
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  // File state for profile photo
  const [file, setFile] = useState(null);

  /**
   * Handles text input changes and updates form state
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Handles profile image file selection
   */
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  /**
   * Handles form submission and calls the registration hook
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await handleRegister(form, file);
    if (success) {
      navigate("/login");
    }
  };

   return (
    <AppLayout>
      <h2>Register</h2>
      <RegisterForm
        form={form}
        onChange={handleChange}
        onFileChange={handleFileChange}
        onSubmit={handleSubmit}
        error={error}
      />
      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        <button onClick={() => navigate("/login")}>
          Already have an account? Log in
        </button>
      </div>
    </AppLayout>
  );
}
