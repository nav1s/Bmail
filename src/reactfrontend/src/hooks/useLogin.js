import { useState } from "react";
import { login } from "../services/authService";
import { getUserById } from "../services/userService";
import { saveToken } from "../utils/tokenUtils";
import { useUser } from "../contexts/UserContext";
import { BASE_URL } from "../services/api";

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
    const data = await login(username, password);
    saveToken(data.token);

    let userInfo = await getUserById(data.id);

     if (userInfo.image && !userInfo.imageUrl) {
      userInfo.imageUrl = `${BASE_URL.replace("/api", "")}${userInfo.image}`;
    }

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
