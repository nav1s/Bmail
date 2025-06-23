import { useUser } from "../../contexts/UserContext";

export default function Header({ onAvatarClick }) {
  const { user } = useUser();

  const getInitials = (user) => {
    const first = user?.firstName?.[0]?.toUpperCase() ?? "";
    const last = user?.lastName?.[0]?.toUpperCase() ?? "";
    return first + last || "?";
  };

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