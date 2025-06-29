export default function EditProfilePopup({ form, onChange, onFileChange, onSubmit, error }) {
  return (
    <form onSubmit={onSubmit} encType="multipart/form-data">
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
      <button type="submit">Update</button>
      {error && <p>{error}</p>}
    </form>
  );
}
