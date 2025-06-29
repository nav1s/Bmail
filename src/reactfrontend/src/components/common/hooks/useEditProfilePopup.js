import { useState } from "react";
import { updateUser } from "../../../services/userService";
import { useUser } from "../../../contexts/UserContext";
import { BASE_URL } from "../../../services/api";



export default function useEditProfile() {
  const [error, setError] = useState(null);
  const { user, update } = useUser();

  const handleEdit = async (form, file) => {
    const formData = new FormData();
    formData.append("firstName", form.firstName);
    formData.append("lastName", form.lastName);
    if (file) formData.append("image", file);

    try {
      const updated = await updateUser(user.id, formData);
      if (updated.image && !updated.imageUrl) {
        updated.imageUrl = `${BASE_URL.replace("/api", "")}${updated.image}`;
      }
      update(updated);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return { handleEdit, error };
}