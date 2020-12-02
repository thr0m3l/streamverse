import { createContext } from 'react';

export const AuthContext = createContext({
  isLoggedIn: false,
  email: null,
  token: null,
  profile: null,
  sub_id : null,
  bill : null,
  max_profiles : null,
  num_profiles :null,
  ptbd : null,
  login: () => {},
  logout: () => {},
  set_sub_id : () => {},
  set_bill : ()=>{},
  set_max_profiles : () => {},
  set_ptbd : () => {},
  set_num_profiles : () =>{}
});
