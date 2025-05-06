import { createContext, useContext, useState } from 'react';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [isLogin, setIsLogin] = useState(false);

  return <UserContext.Provider value={{ isLogin, setIsLogin }}>{children}</UserContext.Provider>;
}

interface UserContextType {
  isLogin: boolean;
  setIsLogin: (isLogin: boolean) => void;
}

export const UserContext = createContext<UserContextType>({
  isLogin: false,
  setIsLogin: () => {
    // do nothing
  },
});

export const useUser = () => useContext(UserContext);
