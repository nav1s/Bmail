import Popup from "./Popup";
import AccountPopupContent from "./forms/AccountPopupContent";
import useAccountPopup from "../hooks/useAccountPopup";
import "../../../styles/AccountPopup.css";

/**
 * AccountPopup
 * Dropdown-style popup shown when clicking user avatar.
 *
 * @param {Object} props
 * @param {Function} props.onClose - Callback to close the popup
 */
export default function AccountPopup({ onClose }) {
  const { username, handleLogout } = useAccountPopup();

  return (
    <Popup onClose={onClose}>
      <div className="account-popup">
        <AccountPopupContent username={username} onLogout={handleLogout} />
      </div>
    </Popup>
  );
}
