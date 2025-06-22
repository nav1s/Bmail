import { useNavigate } from "react-router-dom";
import { clearToken } from "../../../utils/tokenUtils";
import { loadUser, clearUser } from "../../../utils/userUtils";

/**
 * useAccountPopup
 *
 * Custom hook for AccountPopup UI.
 * Provides formatted user name and full logout logic.
 *
 * Responsibilities:
 * - Load user identity for display
 * - Expose logout method that clears session and redirects
 */
export default function useAccountPopup() {
  const navigate = useNavigate();
  const user = loadUser(); // e.g. { username, firstName, lastName }

  /**
   * Fully logs the user out by:
   * - Clearing token storage
   * - Cleaning cached user data
   * - Redirecting to login
   */
  const handleLogout = () => {
    clearToken();
    clearUser();
    navigate("/login");
  };

  return {
    username: user?.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : user?.username || "Unknown",
    handleLogout,
  };
}
