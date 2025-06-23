import "../../../styles/AccountPopup.css";

export default function EditProfilePopup({
  form,
  onChange,
  onFileChange,
  onSubmit,
  error,
  onCancel,
}) {
  return (
    <div className="account-popup">
      <h3>Edit Profile</h3>
      <form onSubmit={onSubmit} encType="multipart/form-data" style={{ width: "100%" }}>
        <input
          name="firstName"
          value={form.firstName}
          onChange={onChange}
          placeholder="First name"
        />
        <input
          name="lastName"
          value={form.lastName}
          onChange={onChange}
          placeholder="Last name"
        />
        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
        />

        <div className="button-row">
          <button type="submit" className="send-btn">Update</button>
          <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
        </div>

        {error && <p style={{ color: "red", marginTop: "8px" }}>{error}</p>}
      </form>
    </div>
  );
}
