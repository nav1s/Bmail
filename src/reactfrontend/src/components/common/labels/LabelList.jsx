import React from "react";
import LabelItem from "./LabelItem";

export default function LabelList({
  title,
  labels,
  selected,
  onSelect,
  onMenuClick,
}) {
  return (
    <div>
      {title && <p className="label-section-title">{title}</p>}
      <ul className="label-list">
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
