import LabelInput from "./LabelInput";
import LabelList from "./LabelList";
import EditLabelPopup from "../popup/EditLabelPopup";
import ConfirmDeletePopup from "../popup/ConfirmDeletePopup";
import LabelMenuPopup from "../popup/LabelMenuPopup";
import "../../../styles/Labels.css";

export const ALL_LABEL = {
  id: "all",
  name: "all",
  isDefault: true,
  isAttachable: false,
};

export default function LabelManagerView({
  labels,
  newLabelName,
  setNewLabelName,
  handleAddLabel,
  selectedLabel,
  onSelect,
  setSelectedLabel,
  showEdit,
  setShowEdit,
  showDelete,
  setShowDelete,
  handleEditLabel,
  handleDeleteLabel,
  menuLabel,
  setMenuLabel,
  hideDefaults = false,
}) {
  const defaultLabels = [...labels.filter((l) => l.isDefault), ALL_LABEL];
  const customLabels = labels.filter((l) => !l.isDefault);

  return (
    <div className="labels-container">
      {!hideDefaults && (
        <>
          <LabelList
            labels={defaultLabels}
            selected={selectedLabel}
            onSelect={onSelect}
          />
          <div style={{ height: "12px" }} />
        </>
      )}

      <LabelInput
        value={newLabelName}
        onChange={setNewLabelName}
        onAdd={handleAddLabel}
      />

      <LabelList
        labels={customLabels}
        selected={selectedLabel}
        onSelect={onSelect}
        onMenuClick={setMenuLabel}
      />

      {showEdit && selectedLabel && (
        <EditLabelPopup
          label={selectedLabel}
          onClose={() => setShowEdit(false)}
          onSave={handleEditLabel}
        />
      )}

      {showDelete && selectedLabel && (
        <ConfirmDeletePopup
          label={selectedLabel}
          onClose={() => setShowDelete(false)}
          onConfirm={handleDeleteLabel}
        />
      )}

      {menuLabel && (
        <LabelMenuPopup
          label={menuLabel}
          onEdit={() => {
            setSelectedLabel(menuLabel);
            setShowEdit(true);
            setMenuLabel(null);
          }}
          onDelete={() => {
            setSelectedLabel(menuLabel);
            setShowDelete(true);
            setMenuLabel(null);
          }}
          onClose={() => setMenuLabel(null)}
        />
      )}
    </div>
  );
}
