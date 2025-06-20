import { useState } from "react";
import useDarkMode from "../../hooks/useDarkMode";
import { loadUser } from "../../utils/userUtils";
import AccountPopup from "../common/popup/AccountPopup";

/**
 * Header - top bar with app title, dark mode toggle, and user profile button
 */
export default function Header() {
  const [dark, setDark] = useDarkMode();
  const [showAccount, setShowAccount] = useState(false);

  const user = loadUser();

  // Generate initials like "JS" from first and last name, or username fallback
  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.username?.slice(0, 2).toUpperCase() || "US";

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 20px",
      borderBottom: "1px solid #ccc"
    }}>
      {/* App Title */}
      <h2 style={{ margin: 0 }}>Inbox</h2>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* 🌗 Dark Mode Toggle */}
        <button onClick={() => setDark(prev => !prev)}>
          {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>

        {/* 👤 Profile Initials Button + AccountPopup */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowAccount(true)}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "#555",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px"
            }}
            title={user?.username || "User"}
          >
            {initials}
          </button>

          {showAccount && (
            <AccountPopup onClose={() => setShowAccount(false)} />
          )}
        </div>
      </div>
    </div>
  );
}
