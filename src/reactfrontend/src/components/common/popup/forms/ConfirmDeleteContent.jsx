/**
 * ConfirmDeleteContent
 * Simple UI for confirming label deletion.
 */
export default function ConfirmDeleteContent({ label, onConfirm, onClose }) {
  return (
    <div style={{ textAlign: "center" }}>
      <p>
        Are you sure you want to delete the label <strong>"{label.name}"</strong>?
      </p>
      <button onClick={onConfirm}>Yes</button>
      <button onClick={onClose} style={{ marginLeft: "10px" }}>
        Cancel
      </button>
    </div>
  );
}
