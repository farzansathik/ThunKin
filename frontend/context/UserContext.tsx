import React, { createContext, useContext, useState } from "react";

interface UserContextType {
  userId: number | null;
  restId: number | null;
  isVendor: boolean;
  setUserId: (id: number | null) => void;
  setRestId: (id: number | null) => void;
  setIsVendor: (val: boolean) => void;
}

const UserContext = createContext<UserContextType>({
  userId: null,
  restId: null,
  isVendor: false,
  setUserId: () => {},
  setRestId: () => {},
  setIsVendor: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<number | null>(null);
  const [restId, setRestId] = useState<number | null>(null);
  const [isVendor, setIsVendor] = useState(false);

  return (
    <UserContext.Provider value={{ userId, setUserId, restId, setRestId, isVendor, setIsVendor }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}