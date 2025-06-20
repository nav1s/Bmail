import { useState } from "react";
import { login } from "../services/authService";
import { getUserByUsername } from "../services/userService";
import { saveToken } from "../utils/tokenUtils";
import { saveUser } from "../utils/userUtils";

/**
 * Custom hook that handles the login process:
 * - authenticates user
 * - saves token and user data
 * - exposes error state and login function
 */
export default function useLogin() {
  const [error, setError] = useState("");

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
      const userInfo = await getUserByUsername(username);
      saveUser(userInfo);

      setError(""); // Clear previous error
      return true;
    } catch (err) {
      setError(err.message || "Login failed");
      return false;
    }
  };

  return { handleLogin, error };
}
