import Popup from "./Popup";
import AccountPopupContent from "./forms/AccountPopupContent";
import useAccountPopup from "../hooks/useAccountPopup";

/**
 * AccountPopup
 * Dropdown-style popup shown when clicking user avatar.
 */
export default function AccountPopup({ onClose }) {
  const { username, handleLogout } = useAccountPopup();

  return (
    <Popup onClose={onClose} className="account-popup">
      <AccountPopupContent username={username} onLogout={handleLogout} />
    </Popup>
  );
}
