import { createContext, useState, useEffect } from "react";
import { User } from "../types/user.type";
import { getAccessTokenFromLS, getProfileFromLS, clearLS } from "../utils/auth";

interface AppContextInterface {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  profile: User | null;
  setProfile: React.Dispatch<React.SetStateAction<User | null>>;
  reset: () => void;
}

export const getInitialAppContext: () => AppContextInterface = () => ({
  isAuthenticated: Boolean(getAccessTokenFromLS()) && Boolean(getProfileFromLS()),
  setIsAuthenticated: () => null,
  profile: getProfileFromLS(),
  setProfile: () => null,
  reset: () => null,
});

const initialAppContext = getInitialAppContext();

export const AppContext = createContext<AppContextInterface>(initialAppContext);

export const AppProvider = ({
  children,
  defaultValue = initialAppContext,
}: {
  children: React.ReactNode;
  defaultValue?: AppContextInterface;
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    defaultValue.isAuthenticated
  );
  const [profile, setProfile] = useState<User | null>(defaultValue.profile);

  // Đồng bộ isAuthenticated với profile
  useEffect(() => {
    if (!profile) {
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
  }, [profile]);

  const reset = () => {
    setIsAuthenticated(false);
    setProfile(null);
    clearLS(); // Xóa local storage khi đăng xuất
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        profile,
        setProfile,
        reset,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};