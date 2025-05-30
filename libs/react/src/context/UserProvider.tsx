import { createContext, useContext, useState } from 'react';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [isLogin, setIsLogin] = useState(false);
  const [nowChatId, setNowChatId] = useState('');

  return (
    <UserContext.Provider value={{ isLogin, setIsLogin, nowChatId, setNowChatId }}>{children}</UserContext.Provider>
  );
}

interface UserContextType {
  isLogin: boolean;
  nowChatId: string;
  setIsLogin: (isLogin: boolean) => void;
  setNowChatId: (nowChatId: string) => void;
}

export const UserContext = createContext<UserContextType>({
  isLogin: false,
  nowChatId: '',
  setIsLogin: () => {
    // do nothing
  },
  setNowChatId: () => {
    // do nothing
  },
});

export const useUser = () => useContext(UserContext);
