import React, {useState, useCallback} from 'react';
import {BrowserRouter as Router , Redirect, Route, Switch } from 'react-router-dom';
import * as ROUTES from './constants/routes';
import { Home,Signin,Signup,Browse,Profiles,CreateProfile } from './pages';
import {AuthContext} from './context/auth-context';


function App() {

  const [token, setToken] = useState(false);
  const [email, setEmail] = useState(false);
  const [profile, setProfile] = useState(false);
  
  const login = useCallback((email, token) => {
      setToken(token);
      setEmail(email);
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
      <Redirect to = {ROUTES.HOME}/>
      </Switch>
    );
  }


  return (
    <AuthContext.Provider value = {{
      email: email,
      token: token, 
      login: login, 
      logout: logout,
      profile : profile,
      isLoggedIn : !!token}}>
    <Router>
      {routes}
    </Router>
    </AuthContext.Provider>
  );
}


export default App;
