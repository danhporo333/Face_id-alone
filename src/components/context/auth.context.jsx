import { createContext, useState } from "react";

export const AuthContext = createContext({
  id: "",
  username: "",
  role: "",
});

export const AuthWarner = (props) => {
  const [user, setUser] = useState({
    id: "",
    username: "",
    role: "",
  });

  const [isAppLoading, setIsAppLoading] = useState(true);
  return (
    <AuthContext.Provider
      value={{ user, setUser, isAppLoading, setIsAppLoading }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};
