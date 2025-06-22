import { useState } from "react";
import { register } from "../services/authService";

/**
 * Custom hook for handling user registration.
 * - Validates password confirmation
 * - Sends user data to backend
 * - Tracks registration error
 */
export default function useRegister() {
  const [error, setError] = useState("");

  /**
   * Handles the registration process.
   * @param {Object} form - Form data from the UI
   * @returns {Promise<boolean>} - Whether registration succeeded
   */
  const handleRegister = async (form, file) => {
  const { password, confirmPassword, ...rest } = form;

  if (password !== confirmPassword) {
    setError("Passwords do not match");
    return false;
  }

  const formData = new FormData();
  formData.append("password", password);
  for (const [key, value] of Object.entries(rest)) {
    formData.append(key, value);
  }
  if (file) {
    formData.append("image", file);
  }

  try {
    await register(formData); // sends multipart/form-data
    setError("");
    return true;
  } catch (err) {
    setError(err.message || "Registration failed");
    return false;
  }
};


  return { handleRegister, error };
}
