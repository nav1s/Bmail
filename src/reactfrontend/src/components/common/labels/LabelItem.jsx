import React from "react";

export default function LabelItem({ label, selected, onSelect, onMenu, showMenu }) {
  const isSelected = selected === label.name;

  return (
    <li
      className={`label-item ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect(label.name)}
    >
      <span className="label-name">{label.name}</span>

      {/* Show menu button only for non-default labels if needed */}
      {showMenu && !label.isDefault && (
        <button
          className="label-menu-btn"
          onClick={(e) => {
            e.stopPropagation(); // Prevent parent onClick
            onMenu(label);
          }}
          title="Label options"
        >
          ⋮
        </button>
      )}
    </li>
  );
}
