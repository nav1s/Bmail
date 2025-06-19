import React from "react";

export default function MailViewerModal({ mail, onClose }) {
  return (
    <div style={{ position: "fixed", top: "20%", left: "30%", background: "#fff", padding: "16px", border: "1px solid #000" }}>
      <h3>{mail.title}</h3>
      <p><strong>From:</strong> {mail.from}</p>
      <p><strong>To:</strong> {mail.to.join(", ")}</p>
      <p>{mail.body}</p>
      <button onClick={onClose}>x</button>
    </div>
  );
}
