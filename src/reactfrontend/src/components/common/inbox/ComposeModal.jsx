import React, { useState } from "react";

export default function ComposeModal({ onClose, onSend }) {
  const [form, setForm] = useState({ to: "", title: "", body: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSend = (e, isDraft = false) => {
  if (e) e.preventDefault();
  const toList = form.to.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
  const finalForm = { ...form, to: toList, draft: isDraft };
  onSend(finalForm);
};


  return (
    
    <div style={{ border: "1px solid #000", padding: "16px", background: "#fff", position: "fixed", top: "20%", left: "30%" }}>
      <h3>Compose Mail</h3>
      <form onSubmit={handleSend}>
        <input name="to" placeholder="To" value={form.to} onChange={handleChange} required />
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
        <textarea name="body" placeholder="Body" value={form.body} onChange={handleChange} required />
        <button type="submit">Send</button>
        <button type="button" onClick={() => handleSend(null, true)}>Save as Draft</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
}
