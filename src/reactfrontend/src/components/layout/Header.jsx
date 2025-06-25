import { useEffect, useState } from "react";
import { loadUser } from "../../utils/userUtils";
import "../../styles/Header.css";

/**
 * Header
 * Displays app title, dark mode toggle, and user avatar.
 */
export default function Header({ onAvatarClick }) {
  const user = loadUser();
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

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="dark-mode-toggle"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>

        {user && (
          <div className="user-avatar" onClick={onAvatarClick}>
            {user.firstName?.[0]?.toUpperCase() ?? "?"}
            {user.lastName?.[0]?.toUpperCase() ?? ""}
          </div>
        )}
      </div>
    </header>
  );
}
