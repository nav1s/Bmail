import { createContext, useContext, useState } from "react";
import { loadUser, saveUser, clearUser } from "../utils/userUtils";

const UserContext = createContext();

/**
 * UserProvider wraps the app and makes user state available globally.
 */
export function UserProvider({ children }) {
  const [user, setUser] = useState(() => loadUser());

  const login = (userData) => {
    saveUser(userData);
    setUser(userData);
  };

  const logout = () => {
    clearUser();
    setUser(null);
  };

  const update = (updatedUser) => {
    saveUser(updatedUser);
    setUser(updatedUser);
  };

  return (
    <UserContext.Provider value={{ user, login, logout, update }}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Hook to access user state and actions
 */
export const useUser = () => useContext(UserContext);
