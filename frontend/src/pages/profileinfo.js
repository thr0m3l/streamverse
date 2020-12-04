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
    msg = "You Have to Delete More Profiles";
    return (
        
        <> <Header bg={false}>
        <Header.Frame>
          <Header.Logo to={ROUTES.HOME} src={logo} alt="Netflix" />
          <Header.ButtonLink to={ROUTES.DELETE_PROFILE}>Go Back</Header.ButtonLink>
        </Header.Frame>
        <Form>
            <Form.Title>{msg}</Form.Title>
          </Form>
      </Header> </>
    
    );
}