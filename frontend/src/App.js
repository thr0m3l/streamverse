import React, {useState, useCallback} from 'react';
import {BrowserRouter as Router , Redirect, Route, Switch } from 'react-router-dom';
import * as ROUTES from './constants/routes';
import { Home,Signin,Signup,Browse,Profiles,CreateProfile,AddSubscription,AccountSettings,UpdateSubscription,CancelSubscription} from './pages';
import {AuthContext} from './context/auth-context';


function App() {

  const [token, setToken] = useState(false);
  const [email, setEmail] = useState(false);
  const [profile, setProfile] = useState(false);
  const [sub_id,set_Sub_Id] = useState(false);
  const [bill,set_Bill] = useState(false);
  
  const login = useCallback((email, token) => {
      setToken(token);
      setEmail(email);
  }, []);
  
  const set_sub_id = useCallback((subid) => {
    set_Sub_Id(subid);
  }, []);

  const set_bill = useCallback((b) => {
    set_Bill(b);
  }, []);
  
  const logout = useCallback(() => {
    setToken(null);
    setEmail(null);
  }, []);

  let routes;

  if (!token){
    routes = (
      <React.Fragment>
      <Route exact path={ROUTES.HOME}>
        <Home/>
      </Route>
      <Route exact path={ROUTES.SIGN_UP}>
        <Signup/>
      </Route>
      <Route exact path={ROUTES.SIGN_IN}>
        <Signin/>
      </Route>
      {/* <Route exact path={ROUTES.BROWSE}>
        <Browse/>
      </Route> */}
      <Redirect to = {ROUTES.HOME}/>
      </React.Fragment>
    );
  } else {
    routes = (
      <Switch>
      {/* <Route exact path={ROUTES.PROFILES}>
        <Profiles email={email}/>
      </Route> */}
      <Route exact path={ROUTES.CREATE_PROFILE}>
        <CreateProfile/>
      </Route>
      <Route exact path={ROUTES.HOME}>
        <Home/>
      </Route>
      <Route exact path={ROUTES.BROWSE}>
        <Browse/>
      </Route>
      <Route exact path={ROUTES.ADD_SUBSCRIPTION}>
        <AddSubscription/>
      </Route>
      <Route exact path={ROUTES.UPDATE_SUBSCRIPTION}>
        <UpdateSubscription/>
      </Route>
      <Route exact path={ROUTES.CANCEL_SUBCRIPTION}>
        <CancelSubscription/>
      </Route>
      <Route exact path={ROUTES.ACCOUNT_SETTINGS}>
        <AccountSettings/>
      </Route>
      <Redirect to = {ROUTES.HOME}/>
      </Switch>
    );
  }


  return (
    <AuthContext.Provider value = {{
      email: email,
      token: token, 
      sub_id : sub_id,
      bill : bill,
      login: login, 
      logout: logout,
      set_sub_id : set_sub_id,
      set_bill : set_bill,
      profile : profile,
      isLoggedIn : !!token}}>
    <Router>
      {routes}
    </Router>
    </AuthContext.Provider>
  );
}


export default App;
