import React, { useState } from "react";

export default function BlacklistForm({ onAdd, onDelete }) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e, action) => {
    e.preventDefault();
    if (!url.trim()) return;
    if (action === "add") onAdd(url);
    if (action === "delete") onDelete(url);
    setUrl("");
  };

  return (
    <form>
      <input
        type="text"
        placeholder="URL to blacklist"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button onClick={(e) => handleSubmit(e, "add")}>Add</button>
      <button onClick={(e) => handleSubmit(e, "delete")}>Delete</button>
    </form>
  );
}
