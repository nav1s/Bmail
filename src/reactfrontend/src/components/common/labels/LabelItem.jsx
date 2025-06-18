import React from "react";

export default function LabelItem({ label, selected, onSelect, onMenu, showMenu }) {
  return (
    <li style={{ position: "relative" }}>
      <button
        onClick={() => onSelect(label.name)}
        style={{ fontWeight: selected === label.name ? "bold" : "normal" }}
      >
        {label.name}
      </button>
      {showMenu && <button onClick={() => onMenu(label)}>⋮</button>}
    </li>
  );
}
