import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useUser } from "./UserContext";
import { getToken } from "../utils/tokenUtils";
import { BASE_URL } from "../services/api";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    const token = getToken();
    if (user && token) {
      const serverUrl = BASE_URL.replace("/api", "");
      const newSocket = io(serverUrl);

      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
        console.log("Registering socket for user:", user.username);
        newSocket.emit("register", user.username + "@bmail.com");
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
