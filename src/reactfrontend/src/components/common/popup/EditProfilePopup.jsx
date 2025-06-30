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
    <div className="account-popup-full" >
      <h3>Edit Profile</h3>
      <form
        onSubmit={onSubmit}
        encType="multipart/form-data"
        style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}
      >
        <input
          name="firstName"
          value={form.firstName}
          onChange={onChange}
          placeholder="First name"
          required
        />
        <input
          name="lastName"
          value={form.lastName}
          onChange={onChange}
          placeholder="Last name"
          required
        />

        <label  className="custom-file-upload" style={{ display: "flex", gap: "12px", marginTop: "1rem" }}>
          <input type="file" accept="image/*" onChange={onFileChange} />
          📁 Upload Profile Picture
        </label >

        <div className="button-row" style={{ display: "flex", gap: "12px", marginTop: "1rem" }}>
          <button type="submit" className="send-btn">Update</button>
          <button type="button" className="cancel-btn" style={{ marginLeft: "auto" }} onClick={onCancel}>Cancel</button>
        </div>

        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      </form>
    </div>
  );
}
