import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";

export default function LabelSelector({ selectedLabel }) {
  const [labels, setLabels] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const data = await api.get("/labels", { auth: true });
        setLabels(data);
      } catch (err) {
        console.error("Failed to load labels:", err);
      }
    };
    fetchLabels();
  }, []);

  const handleSelect = (label) => {
    navigate(`/mails/${label}`);
  };

  return (
    <div>
      <h4>Labels</h4>
      {labels.map((label) => (
        <button
          key={label.id}
          onClick={() => handleSelect(label.name)}
          style={{
            fontWeight: selectedLabel === label.name ? "bold" : "normal",
            marginRight: "8px",
          }}
        >
          {label.name}
        </button>
      ))}
    </div>
  );
}
