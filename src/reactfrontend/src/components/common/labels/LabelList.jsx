import React from "react";
import LabelItem from "./LabelItem";

export default function LabelList({
  title,
  labels,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onMenuClick,
  showMenu,
}) {
  return (
    <div>
      {title && <p>{title}</p>}
      <ul>
        {labels.map((l) => (
          <LabelItem
            key={l.name}
            label={l}
            selected={selected}
            onSelect={onSelect}
            onMenu={onMenuClick}
            showMenu={Boolean(onMenuClick)}
          />
        ))}
      </ul>
    </div>
  );
}
