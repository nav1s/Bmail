/**
 * MailSentPopupContent
 * Simple UI for showing confirmation after mail is sent.
 */
export default function MailSentPopupContent({ onClose }) {
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ fontSize: "16px", marginBottom: "10px" }}>📬 Mail sent successfully.</p>
    </div>
  );
}
