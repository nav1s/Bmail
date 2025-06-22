import api from "./api";
import { saveToken } from "../utils/tokenUtils";

/**
 * register
 *
 * Registers a new user using multipart/form-data.
 * Automatically supports file uploads (e.g. profile image).
 *
 * @param {FormData} formData - registration fields + optional file
 * @returns {Promise<Object>} - registered user data or server response
 * @throws {Error} - if the registration fails
 */
export const register = async (formData) => {
  return api.post("/users", formData);
};

/**
 * login
 *
 * Authenticates a user using username/password.
 *
 * @param {Object} credentials - { username, password }
 * @returns {Promise<Object>} - login result (e.g. token, user data)
 * @throws {Error} - if login fails
 */
export async function login(username, password) {
  const res = await api.post("/tokens", { username, password });
  saveToken(res);
  return res;
}
