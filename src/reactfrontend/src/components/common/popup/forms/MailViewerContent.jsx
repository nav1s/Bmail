/**
 * MailViewerContent
 * Pure display of a single mail's contents.
 */
export default function MailViewerContent({ mail }) {
  return (
    <div style={{ textAlign: "left" }}>
      <h3>{mail.title}</h3>
      <p><strong>From:</strong> {mail.from}</p>
      <p><strong>To:</strong> {mail.to.join(", ")}</p>
      <p>{mail.body}</p>
    </div>
  );
}
