import { useEffect, useState } from "react";
import { loadUser } from "../../utils/userUtils";
import "../../styles/Header.css";
import DarkModeToggle from "./DarkModeToggle";
import { useUser } from "../../contexts/UserContext";

/**
 * Header
 * Displays app title, dark mode toggle, and user avatar.
 */
export default function Header({ onAvatarClick, showUser = true }) {
  const { user } = useUser();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const getInitials = (user) => {
    const first = user?.firstName?.[0]?.toUpperCase() ?? "";
    const last = user?.lastName?.[0]?.toUpperCase() ?? "";
    return first + last || "?";
  };

  return (
    <header className="app-header">
      <div className="app-title">📧 Bmail</div>

      <div className="header-right">
        <DarkModeToggle />
        {showUser && user && (
          user.imageUrl ? (
            <img
              src={`${user.imageUrl}?t=${new Date().getTime()}`}
              alt="avatar"
              style={{
                width: "35px",
                height: "35px",
                borderRadius: "50%",
                objectFit: "cover",
                cursor: "pointer",
              }}
              onClick={onAvatarClick}
            />
          ) : (
            <div
              className="user-avatar"
              onClick={onAvatarClick}
              style={{
                backgroundColor: "#555",
                color: "#fff",
                borderRadius: "50%",
                width: "35px",
                height: "35px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {getInitials(user)}
            </div>
          )
        )}
      </div>
    </header>
  );
}
