import React, {useState, useEffect,useContext}from 'react';
import { Form, Header, Profiles,Form2 } from '../components';
import * as ROUTES from '../constants/routes';
import logo from '../logo.svg';
import {AuthContext} from './../context/auth-context';
import {useHistory} from 'react-router-dom';

export default function ProfileInfo() {
    const auth = useContext(AuthContext);
    const mp = auth.max_profiles;
    const np = auth.num_profiles;
    var allowed,msg;
    const d= mp-np;
    if(mp>np){
        allowed=true;
        msg = "You Can Create "+d+" More Profiles";
    }else{
        allowed=false;
        msg = "You have reached your profile limit!"
    }
    console.log("allowed info ",allowed);
    return (allowed? (
        <>
          <Header bg={false}>
            <Header.Frame>
              <Header.Logo to={ROUTES.HOME} src={logo} alt="Netflix" />
             <Header.ButtonLink to={ROUTES.CREATE_PROFILE}>Proceed</Header.ButtonLink>
            </Header.Frame>
          </Header>
    
            <Form2>
                <Form2.Title>{msg}</Form2.Title>
          </Form2>
          
        </>
    ) : (<> <Header bg={false}>
        <Header.Frame>
          <Header.Logo to={ROUTES.HOME} src={logo} alt="Netflix" />
          <Header.ButtonLink to={ROUTES.BROWSE}>Go Back</Header.ButtonLink>
        </Header.Frame>
        <Form>
            <Form.Title>{msg}</Form.Title>
          </Form>
      </Header> </>)
    );
}