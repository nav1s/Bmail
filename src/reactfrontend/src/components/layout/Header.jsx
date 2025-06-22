import { loadUser } from "../../utils/userUtils";

/**
 * Header
 *
 * Displays app title, dark mode toggle, and user avatar.
 * Avatar opens account menu via `onAvatarClick`.
 */
export default function Header({ onAvatarClick }) {
  const user = loadUser();

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem",
        borderBottom: "1px solid #ccc",
      }}
    >
      <h1>Inbox</h1>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button onClick={() => document.body.classList.toggle("dark")}>
          🌙 Dark Mode
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
