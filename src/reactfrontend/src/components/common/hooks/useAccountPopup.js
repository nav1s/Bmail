import { useNavigate } from "react-router-dom";
import { clearToken } from "../../../utils/tokenUtils";
import { loadUser } from "../../../utils/userUtils";


/**
 * Hook to provide user info and logout behavior for AccountPopup
 */
export default function useAccountPopup() {
  const navigate = useNavigate();
  const user = loadUser(); // e.g. { username, firstName, lastName }

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  return {
    username: user?.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : user?.username || "Unknown",
    handleLogout,
  };
}
