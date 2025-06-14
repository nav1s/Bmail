import React from "react";

export default function MailItem({ mail, onDelete }) {
  return (
    <div style={{ border: "1px solid #ccc", padding: "8px", margin: "5px" }}>
      <p><strong>From:</strong> {mail.from}</p>
      <p><strong>To:</strong> {mail.to}</p>
      <p><strong>Title:</strong> {mail.title}</p>
      <p><strong>Body:</strong> {mail.body}</p>
      <button onClick={() => onDelete(mail.id)}>🗑️ Delete</button>
    </div>
  );
}
