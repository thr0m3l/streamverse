import React, {useState, useCallback} from 'react';
import {BrowserRouter as Router , Redirect, Route, Switch } from 'react-router-dom';
import * as ROUTES from './constants/routes';
import { Home,Signin,Signup,Browse,Profiles } from './pages';
import {AuthContext} from './context/auth-context';


function App() {

  const [token, setToken] = useState(false);
  const [email, setEmail] = useState(false);

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
      <Redirect to = {ROUTES.SIGN_IN}/>
      </React.Fragment>
      
    );
  } else {
    routes = (
      <Switch>
      <Route exact path={ROUTES.BROWSE}>
        <Browse/>
      </Route>
      <Redirect to = {ROUTES.BROWSE}/>
      </Switch>
    );
  }


  return (
    <AuthContext.Provider value = {{
      token: token, 
      login:login, 
      logout:logout,
      isLoggedIn : !!token}}>
    <Router>
      {routes}
    </Router>
    </AuthContext.Provider>
  );
}


export default App;
