import { useState } from "react";
import { updateUser } from "../../../services/userService";
import { clearUser, saveUser } from "../../../utils/userUtils";
import { useUser } from "../../../contexts/UserContext";



export default function useEditProfile() {
  const [error, setError] = useState(null);
  const { update } = useUser();

  const handleEdit = async (form, file) => {
    const formData = new FormData();
    formData.append("firstName", form.firstName);
    formData.append("lastName", form.lastName);
    if (file) formData.append("image", file);

    try {
      const updated = await updateUser(formData);
      update(updated);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return { handleEdit, error };
}
