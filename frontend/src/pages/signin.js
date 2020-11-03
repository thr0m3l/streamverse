import React, {useState} from 'react';
import {HeaderContainer} from '../containers/header';
import {FooterContainer} from '../containers/footer';
import {Form} from '../components';

export default function SignIn() {
    
    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
  
    const isInvalid = password === '' || emailAddress === '';
  
    const handleSignin = async event => {
        event.preventDefault();
        
        //send data to backend
        
        fetch('http://localhost:5000/api/users/login', {
          method: 'POST',
          headers: {
              'Content-Type' : 'application/json',

          },
          body: JSON.stringify({
              EMAIL: emailAddress,
              PASSWORD : password
          })
      });

        
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