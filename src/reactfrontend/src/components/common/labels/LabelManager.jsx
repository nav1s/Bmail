import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import EditLabelModal from "./EditLabelModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import LabelMenuPopup from "./LabelMenuPopup";
import LabelInput from "./LabelInput";
import LabelList from "./LabelList";

export default function LabelManager({ selectedLabel }) {
  const [labels, setLabels] = useState([]);
  const [newLabel, setNewLabel] = useState("");
  const [editLabel, setEditLabel] = useState(null);
  const [deleteLabel, setDeleteLabel] = useState(null);
  const [anchorLabel, setAnchorLabel] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadLabels();
  }, []);

  const loadLabels = async () => {
    try {
      const data = await api.get("/labels", { auth: true });
      setLabels(data);
    } catch (err) {
      console.error("Failed to load labels", err);
    }
  };

  const handleAddLabel = async () => {
    if (!newLabel.trim()) return;
    try {
      await api.post("/labels", { name: newLabel }, { auth: true });
      setNewLabel("");
      loadLabels();
    } catch (err) {
      console.error("Add failed:", err);
    }
  };

  const handleNavigate = (labelName) => {
    navigate(`/mails/${labelName}`);
  };

  const defaultLabels = labels.filter((l) => l.isDefault);
  const customLabels = labels.filter((l) => !l.isDefault);

  return (
    <div>
      <h4>Labels</h4>

      <LabelInput value={newLabel} onChange={setNewLabel} onAdd={handleAddLabel} />

      <LabelList
        title="System Labels"
        labels={[...defaultLabels, { id: "all", name: "All Mails" }]}
        selectedLabel={selectedLabel}
        onSelect={handleNavigate}
        showMenu={false}
      />



      <LabelList
        title={customLabels.length ? "Your Labels" : ""}
        labels={customLabels}
        selectedLabel={selectedLabel}
        onSelect={handleNavigate}
        onMenuOpen={setAnchorLabel}
        showMenu={true}
      />

      {anchorLabel && (
        <LabelMenuPopup
          label={anchorLabel}
          onClose={() => setAnchorLabel(null)}
          onEdit={() => {
            setEditLabel(anchorLabel);
            setAnchorLabel(null);
          }}
          onDelete={() => {
            setDeleteLabel(anchorLabel);
            setAnchorLabel(null);
          }}
        />
      )}

      {editLabel && (
        <EditLabelModal
          label={editLabel}
          onClose={() => setEditLabel(null)}
          onSave={() => {
            setEditLabel(null);
            loadLabels();
          }}
        />
      )}

      {deleteLabel && (
        <ConfirmDeleteModal
          label={deleteLabel}
          onClose={() => setDeleteLabel(null)}
          onConfirm={async () => {
            try {
              await api.delete(`/labels/${deleteLabel.id}`, { auth: true });
              setDeleteLabel(null);
              loadLabels();
              if (selectedLabel === deleteLabel.name) {
                navigate("/mails/inbox");
              }
            } catch (err) {
              console.error("Delete failed:", err);
            }
          }}
        />
      )}
    </div>
  );
}
