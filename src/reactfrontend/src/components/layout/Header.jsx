import { useEffect, useState } from "react";
import { loadUser } from "../../utils/userUtils";

/**
 * Header
 *
 * Displays app title, dark mode toggle, and user avatar.
 * Avatar opens account menu via `onAvatarClick`.
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
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem",
        borderBottom: "1px solid var(--border-color)",
        backgroundColor: "var(--card-bg)",
        color: "var(--text-color)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            padding: "6px 12px",
            backgroundColor: "transparent",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            cursor: "pointer",
            color: "var(--text-color)",
          }}
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>

        {user && (
          <div
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
            {user.firstName?.[0]?.toUpperCase() ?? "?"}
            {user.lastName?.[0]?.toUpperCase() ?? ""}
          </div>
        )}
      </div>
    </header>
  );
}
