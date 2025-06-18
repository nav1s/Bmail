import React from "react";
import LabelItem from "./LabelItem";

export default function LabelList({
  title,
  labels,
  selectedLabel,
  onSelect,
  onEdit,
  onDelete,
  onMenuOpen,
  showMenu
}) {
  return (
    <div>
      {title && <p>{title}</p>}
      <ul>
        {labels.map((label) => (
          <LabelItem
            key={label.id}
            label={label}
            selected={selectedLabel}
            onSelect={onSelect}
            onMenu={(l) => {
              if (onMenuOpen) onMenuOpen(l);
              if (onEdit) onEdit(l); // fallback
            }}
            showMenu={showMenu}
          />
        ))}
      </ul>
    </div>
  );
}
