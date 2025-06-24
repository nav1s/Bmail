import React, { useState } from "react";
import EditProfilePopup from "./../EditProfilePopup";
import useEditProfile from "../../hooks/useEditProfilePopup";
import { useUser } from "../../../../contexts/UserContext";

/**
 * AccountPopupContent
 * Displays user greeting, logout option, and profile editing.
 *
 * @param {Object} props
 * @param {Function} props.onLogout - Logout callback
 */
export default function AccountPopupContent({ onLogout }) {
  const { user } = useUser();
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
  });
  const [file, setFile] = useState(null);

  const { handleEdit, error } = useEditProfile();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await handleEdit(form, file);
    if (success) setShowEdit(false);
  };

  return (
    <div className="account-popup-full">
      {showEdit ? (
        <EditProfilePopup
          form={form}
          onChange={handleChange}
          onFileChange={handleFileChange}
          onSubmit={handleSubmit}
          error={error}
          onCancel={() => setShowEdit(false)}
        />
      ) : (
        <>
          <h3>Hello, <strong>{user?.username || "User"}</strong></h3>
          <p className="email">{user?.email}</p>

          <div className="button-row">
            <button className="send-btn" onClick={() => setShowEdit(true)}>
              Edit Profile
            </button>
            <button className="cancel-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
