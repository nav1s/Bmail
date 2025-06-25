import useLabelManager from "../hooks/useLabelManager";
import LabelManagerView from "./LabelManagerView";
import "../../../styles/Labels.css";

/**
 * LabelManager
 * Glue component that uses hook and passes data to view.
 */
export default function LabelManager({ onSelect, selectedLabel, hideDefaults = false }) {
  const manager = useLabelManager();

  return (
    <LabelManagerView
      {...manager}
      selectedLabel={selectedLabel}
      onSelect={onSelect}
      hideDefaults={hideDefaults}
    />
  );
}
