import { useState } from "react";
import { updateUser } from "../../../services/userService";
import { useUser } from "../../../contexts/UserContext";

export default function useEditProfile() {
  const [error, setError] = useState(null);
  const { user, update } = useUser(); // צריך את user.id

  const handleEdit = async (form, file) => {
    const formData = new FormData();
    formData.append("firstName", form.firstName);
    formData.append("lastName", form.lastName);
    if (file) formData.append("image", file);

    try {
      const updated = await updateUser(user.id, formData); // כולל getUserById
      update(updated); // שולח לקונטקסט אובייקט מעודכן מלא
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return { handleEdit, error };
}
