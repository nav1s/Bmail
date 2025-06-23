import { useState } from "react";
import { login } from "../services/authService";
import { getUserById } from "../services/userService";
import { saveToken } from "../utils/tokenUtils";
import { useUser } from "../contexts/UserContext";

/**
 * Custom hook that handles the login process:
 * - authenticates user
 * - saves token
 * - updates global user context
 */
export default function useLogin() {
  const [error, setError] = useState("");
  const { login: setUser } = useUser();

  /**
   * Handles login logic with username and password.
   * @param {string} username
   * @param {string} password
   * @returns {Promise<boolean>} success
   */
  const handleLogin = async (username, password) => {
    try {
      // Auth call → returns token
      const data = await login(username, password);
      saveToken(data.token);

      // Fetch user info
      const userInfo = await getUserById(data.id);

      // Update context
      setUser(userInfo);

      setError("");
      return true;
    } catch (err) {
      setError(err.message || "Login failed");
      return false;
    }
  };

  return { handleLogin, error };
}
