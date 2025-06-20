import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearTokenFromCookie } from "../../utils/tokenUtils";
import { loadUser, clearUser } from "../../utils/userUtils";
import useClickOutside from "../../hooks/useClickOutside";
import useDarkMode from "../../hooks/useDarkMode";

export default function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const [username, setUsername] = useState("");
  const [dark, setDark] = useDarkMode();
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useClickOutside(menuRef, () => setShowMenu(false));

  useEffect(() => {
    const user = loadUser();
    if (user?.firstName && user?.lastName) {
      setUsername(`${user.firstName} ${user.lastName}`);
    } else {
      setUsername(user?.username || "");
    }
  }, []);

  const handleLogout = () => {
    clearTokenFromCookie();
    clearUser();
    navigate("/login");
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 20px",
      borderBottom: "1px solid #ccc"
    }}>
      <h2 style={{ margin: 0 }}>Inbox</h2>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* 🌙 Dark mode toggle */}
        <button onClick={() => setDark(prev => !prev)}>
          {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>

        {/* 👤 Profile button + popout */}
        <div style={{ position: "relative" }} ref={menuRef}>
          <button
            onClick={() => setShowMenu(prev => !prev)}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "#ccc",
              border: "none",
              cursor: "pointer",
              fontSize: "18px"
            }}
          >
            👤
          </button>

          {showMenu && (
            <div
              style={{
                position: "absolute",
                top: "45px",
                right: 0,
                backgroundColor: "white",
                border: "1px solid #ddd",
                borderRadius: "4px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                padding: "10px",
                zIndex: 1000
              }}
            >
              <div style={{ marginBottom: "8px" }}>
                Hello, <strong>{username}</strong>
              </div>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
