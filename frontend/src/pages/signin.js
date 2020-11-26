import React, {useContext, useState} from 'react';
import {HeaderContainer} from '../containers/header';
import {FooterContainer} from '../containers/footer';
import {Form} from '../components';
import * as ROUTES from '../constants/routes';
import {useHistory} from 'react-router-dom';
import {AuthContext} from './../context/auth-context';

export default function SignIn() {
    const history = useHistory();
    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const auth = useContext(AuthContext); //auth context

    const isInvalid = password === '' || emailAddress === '';
  
    const handleSignin = async event => {
        event.preventDefault();
        
        //send data to backend
        try{
            const response = await fetch('http://localhost:5000/api/users/login', {
            method: 'POST',
            headers: {
                  'Content-Type' : 'application/json',

            },
            body: JSON.stringify({
                  EMAIL: emailAddress,
                PASSWORD : password
            })
            });

            const responseData = await response.json();
            
            console.log(responseData);

            if (response.status === 201){
                auth.login(emailAddress, responseData.token); //updates the auth context
                console.log(auth.email);
                history.push( ROUTES.BROWSE ); //Successful login, moves to netflix profiles page
            } else if (response.status === 422){
                setError('User does not exist. Please sign up instead');
            } else if (response.status === 423){
                setError('Incorrect Password');
            }

        } catch(err) {
            console.log(err)
            console.log('Sending data to the backend failed');
            setEmailAddress('');
            setPassword('');
            setError(err.message);
        }
        

        
    };
  
    return (
      <>
        <HeaderContainer>
          <Form>
            <Form.Title>Sign In</Form.Title>
            {error && <Form.Error data-testid="error">{error}</Form.Error>}
  
            <Form.Base onSubmit={handleSignin} method="POST">
              <Form.Input
                placeholder="Email address"
                value={emailAddress}
                onChange={({ target }) => setEmailAddress(target.value)}
              />
              <Form.Input
                type="password"
                value={password}
                placeholder="Password"
                onChange={({ target }) => setPassword(target.value)}
              />
              <Form.Submit disabled={isInvalid} type="submit" data-testid="sign-in">
                Sign In
              </Form.Submit>
            </Form.Base>
  
            <Form.Text>
              New to Netflix? <Form.Link to="/signup">Sign up now.</Form.Link>
            </Form.Text>
          </Form>
        </HeaderContainer>
        <FooterContainer />
      </>
    );
  }