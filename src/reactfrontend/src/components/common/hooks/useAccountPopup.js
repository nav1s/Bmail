import { useNavigate } from "react-router-dom";
import { clearToken } from "../../../utils/tokenUtils";
import { clearUser } from "../../../utils/userUtils";
import { useUser } from "../../../contexts/UserContext";

/**
 * useAccountPopup
 *
 * Custom hook for AccountPopup UI.
 * Provides formatted user name and full logout logic.
 *
 * Responsibilities:
 * - Expose reactive user identity
 * - Expose logout method that clears session and redirects
 */
export default function useAccountPopup() {
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const handleLogout = () => {
    clearToken();
    clearUser();
    logout();
    navigate("/login");
  };

  const username = user?.firstName
    ? `${user.firstName}`.trim()
    : user?.username || "Unknown";


  return {
    username,
    handleLogout,
  };
}
