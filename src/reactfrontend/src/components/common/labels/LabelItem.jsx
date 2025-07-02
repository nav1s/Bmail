/**
 * LabelItem
 * Represents a single label item in the list.
 *
 * Props:
 * - label: the label object
 * - selected: currently selected label name
 * - onSelect: function(labelName)
 * - onMenu: function(label)
 * - showMenu: boolean — whether to show the menu (⋮)
 */
export default function LabelItem({ label, selected, onSelect, onMenu, showMenu }) {
  const isSelected = selected?.id === label.id;

  const className = [
    "label-tab",
    label.isDefault ? "default-label" : "custom-label",
    isSelected ? "active" : "",
    isSelected && label.isDefault ? "default-label-active" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <li
      className={className}
      onClick={() => onSelect?.(label)}
    >
      <span className="label-name label-content">{label.name}</span>

      {showMenu && !label.isDefault && (
        <span
          className="more-icon"
          onClick={(e) => {
            e.stopPropagation();
            onMenu?.(label);
          }}
          title="Label options"
        >
          ⋮
        </span>
      )}
    </li>
  );
}
