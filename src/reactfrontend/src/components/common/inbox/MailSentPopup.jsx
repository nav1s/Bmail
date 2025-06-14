import React from "react";

export default function MailSentPopup({ onClose }) {
  return (
    <div>
      <div>Mail sent.</div>
      <button onClick={onClose}>Close</button>
    </div>
  );
}
