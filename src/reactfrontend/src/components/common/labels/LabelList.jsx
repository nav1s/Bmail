import React from "react";
import LabelItem from "./LabelItem";

/**
 * LabelList
 * Displays a list of labels.
 *
 * Props:
 * - title: optional title above the list
 * - labels: array of label objects
 * - selected: currently selected label
 * - onSelect: function(label) — called when a label is selected
 * - onMenuClick: function(label) — called when menu icon is clicked
 */
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
        {labels.map((label) => {
          const isActive = selected?.id === label.id;

          return (
            <li
              key={label.id}
              className={`label-tab ${isActive ? "active" : ""}`}
              onClick={() => onSelect?.(label)}
            >
              <span className="label-name">{label.name}</span>

              {onMenuClick && (
                <span
                  className="more-icon"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent selecting the label
                    onMenuClick(label);
                  }}
                >
                  ⋮
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
