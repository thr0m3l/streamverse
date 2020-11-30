import { createContext } from 'react';

export const AuthContext = createContext({
  isLoggedIn: false,
  email: null,
  token: null,
  profile: null,
  sub_id : null,
  bill : null,
  login: () => {},
  logout: () => {},
  set_sub_id : () => {},
  set_bill : ()=>{}
});
