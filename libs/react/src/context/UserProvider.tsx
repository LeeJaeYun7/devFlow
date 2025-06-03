import { createContext, useContext, useState, useEffect } from 'react';
import { useUserMySelf } from '../hooks/useUser';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [isLogin, setIsLogin] = useState(false);
  const [nowChatId, setNowChatId] = useState('');
  const { data: userMySelf, error } = useUserMySelf();

  useEffect(() => {
    // userMySelf 데이터가 있고 에러가 없으면 로그인 상태
    if (userMySelf?.data && !error) {
      setIsLogin(true);
    } else {
      setIsLogin(false);
    }
  }, [userMySelf, error]);

  return (
    <UserContext.Provider
      value={{
        isLogin,
        setIsLogin,
        nowChatId,
        setNowChatId,
      }}
    >
      {children}
    </UserContext.Provider>
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
