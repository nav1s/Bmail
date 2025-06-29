/**
 * ConfirmDeleteContent
 * Simple UI for confirming label deletion.
 */
export default function ConfirmDeleteContent({ onConfirm, onClose }) {
  return (
    <div style={{ textAlign: "center" }}>
      <p>
        Are you sure you want to delete this label?
      </p>
      <button onClick={onConfirm}>Yes</button>
      <button onClick={onClose} style={{ marginLeft: "10px" }}>
        Cancel
      </button>
    </div>
  );
}
