import { createContext } from 'react';

export const AuthContext = createContext({
  isLoggedIn: false,
  email: null,
  token: null,
  profile: null,
  login: () => {},
  logout: () => {}
});
