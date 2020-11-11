import React, { Component } from 'react';
import {Header,Profiles} from '../components';
import * as ROUTES from '../constants/routes';
import logo from '../logo.svg';

export function SelectProfileContainer({user,setProfile}){


        return (
            <>
                <Header bg={false}>
                    <Header.Frame>
                        <Header.Logo to={ROUTES.HOME} src={logo} alt="Netflix"/>
                        <Header.ButtonLink to={ROUTES.CREATE_PROFILE}>Create Profile</Header.ButtonLink>
                    </Header.Frame>
                </Header>

                <Profiles>
                    <Profiles.Title>Who's watching?</Profiles.Title>
                    
                </Profiles>
            </>
        );
    
}