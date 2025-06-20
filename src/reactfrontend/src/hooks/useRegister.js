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
  const handleRegister = async (form) => {
    const { password, confirmPassword, ...rest } = form;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    try {
      await register({ password, ...rest });
      setError("");
      return true;
    } catch (err) {
      setError(err.message || "Registration failed");
      return false;
    }
  };

  return { handleRegister, error };
}
