import React from "react";

export default function LabelInput({ value, onChange, onAdd }) {
  return (
    <div>
      <input
        type="text"
        placeholder="New label name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button onClick={onAdd}>Add</button>
    </div>
  );
}
