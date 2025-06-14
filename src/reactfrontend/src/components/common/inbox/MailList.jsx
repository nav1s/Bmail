import React from "react";
import MailItem from "./MailItem";

export default function MailList({ mails, onDelete }) {
  return (
    <div>
      {mails.map((mail) => (
        <MailItem key={mail.id} mail={mail} onDelete={onDelete} />
      ))}
    </div>
  );
}
