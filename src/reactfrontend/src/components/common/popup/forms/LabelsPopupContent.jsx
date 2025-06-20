/**
 * LabelsPopupContent
 * Pure UI for showing label options and toggling them
 */
export default function LabelsPopupContent({
  labels,
  selected,
  onToggle,
  onSave,
  onClose,
}) {
  return (
    <div>
      <h4>Assign Labels</h4>
      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {labels.map((label) => (
          <li key={label.id}>
            <label>
              <input
                type="checkbox"
                checked={selected.includes(label.name)}
                onChange={() => onToggle(label.name)}
              />
              {label.name}
            </label>
          </li>
        ))}
      </ul>
      <button onClick={onSave}>Save</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}
