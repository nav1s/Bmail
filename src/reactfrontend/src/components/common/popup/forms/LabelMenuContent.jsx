/**
 * LabelMenuContent
 * Shows Edit / Delete options for a label.
 */
export default function LabelMenuContent({ label, onEdit, onDelete, onClose }) {
  return (
    <div style={{ textAlign: "center" }}>
      <p><strong>{label.name}</strong></p>
      <button onClick={onEdit}>Edit</button>
      <button onClick={onDelete} style={{ marginLeft: "10px" }}>Delete</button>
      <div style={{ marginTop: "10px" }}>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
