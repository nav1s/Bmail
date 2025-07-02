import Popup from "./Popup";
import AccountPopupContent from "./forms/AccountPopupContent";
import useAccountPopup from "../hooks/useAccountPopup";
import "../../../styles/AccountPopup.css";

/**
 * AccountPopup
 * Dropdown-style popup shown when clicking user avatar.
 */
export default function AccountPopup({ onClose }) {
  const { username, handleLogout } = useAccountPopup();

  return (
    <Popup
        onClose={onClose}
        className="account-popup"
        style={{
          position: "absolute",
          top: "60px",
          right: "20px",
        }}
      >
      <AccountPopupContent username={username} onLogout={handleLogout} />
    </Popup>
  );
}
