import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useRegister from "../hooks/useRegister";
import DarkModeToggle from "../components/layout/DarkModeToggle";
import RegisterForm from "./forms/RegisterForm";
import "../styles/RegisterForm.css";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { handleRegister } = useRegister();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "1rem" }}>
        <DarkModeToggle />
      </div>

      <RegisterForm
        form={form}
        onChange={handleChange}
        onFileChange={handleFileChange}
        onSubmit={handleSubmit}
        error={error}
      />
    </>
  );
}
