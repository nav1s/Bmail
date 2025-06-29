import { useEffect, useState } from "react";
import api from "../../../services/api";
import { useNavigate, useParams } from "react-router-dom";


export default function useLabelManager() {
  const [labels, setLabels] = useState([]);
  const [newLabelName, setNewLabelName] = useState("");
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [menuLabel, setMenuLabel] = useState(null);
  const navigate = useNavigate();
  const { label: currentLabel } = useParams(); // current route param


  const loadLabels = async () => {
    try {
      const data = await api.get("/labels", { auth: true });
      setLabels(data);
    } catch (err) {
      console.error("Failed to load labels:", err);
    }
  };

  const handleAddLabel = async () => {
    if (!newLabelName.trim()) return;
    try {
      const added = await api.post("/labels", { name: newLabelName }, { auth: true });
      setLabels((prev) => [...prev, added]);
      setNewLabelName("");
    } catch (err) {
      console.error("Failed to add label:", err);
    }
  };

  const handleEditLabel = async (newName) => {
    try {
      const updated = await api.patch(`/labels/${selectedLabel.id}`, { name: newName }, { auth: true });
      setLabels((prev) =>
        prev.map((l) => (l.id === selectedLabel.id ? { ...l, name: updated.name } : l))
      );
      setSelectedLabel(null);
      setShowEdit(false);
    } catch (err) {
      console.error("Failed to edit label:", err);
    }
  };

  const handleDeleteLabel = async () => {
  try {
    const nameToDelete = selectedLabel.name.toLowerCase(); // get the label name

    await api.delete(`/labels/${selectedLabel.id}`, { auth: true });
    setLabels((prev) => prev.filter((l) => l.id !== selectedLabel.id));
    setSelectedLabel(null);
    setShowDelete(false);

    if (currentLabel?.toLowerCase() === nameToDelete) {
      navigate("/mails/inbox");
    }
  } catch (err) {
    console.error("Failed to delete label:", err);
  }
};


  useEffect(() => {
    loadLabels();
  }, []);

  return {
    labels,
    newLabelName,
    setNewLabelName,
    handleAddLabel,
    handleEditLabel,
    handleDeleteLabel,
    selectedLabel,
    setSelectedLabel,
    showEdit,
    setShowEdit,
    showDelete,
    setShowDelete,
    menuLabel,
    setMenuLabel
  };
}
