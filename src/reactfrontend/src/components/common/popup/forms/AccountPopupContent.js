/**
 * AccountPopupContent
 * UI form for logout confirmation and greeting.
 */
export default function AccountPopupContent({ username, onLogout }) {
  return (
    <div className="account-popup-content">
      <p>Hello, <strong>{username}</strong></p>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}
