import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import LabelList from "./LabelList";

/**
 * LabelSelector
 * Fetches labels from the backend and renders a selectable list.
 * Clicking a label updates the URL using react-router navigation.
 */
export default function LabelSelector() {
  const [labels, setLabels] = useState([]);
  const { labelName } = useParams();
  const navigate = useNavigate();

  /**
   * Fetches all available labels on mount.
   */
  useEffect(() => {
    const loadLabels = async () => {
      try {
        const res = await api.get("/labels");
        setLabels(res.data);
      } catch (err) {
        console.error("Failed to load labels", err);
      }
    };

    loadLabels();
  }, []);

  /**
   * Navigates to the selected label view.
   * @param {string} labelName - The name of the selected label.
   */
  const handleSelect = (labelName) => {
    navigate(`/mails/${labelName}`);
  };

  return (
    <div>
      <LabelList
        labels={labels}
        selected={labelName}
        onSelect={handleSelect}
      />
    </div>
  );
}
