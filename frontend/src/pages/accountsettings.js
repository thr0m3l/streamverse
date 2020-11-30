import React, {useState, useContext} from 'react';
import {Card, Form,Form2} from '../components';
import { JumbotronContainer } from '../containers/jumbotron';
import * as ROUTES from '../constants/routes';
import {useHistory} from 'react-router-dom';
import {AuthContext} from './../context/auth-context';
import { FooterContainer } from '../containers/footer';
import { HeaderContainer } from '../containers/header';


export default function AccountSettings() {
    const auth = useContext(AuthContext);
    const email = auth.email;
    var bill = auth.bill;
    var type="";
    if(bill===5){
        type = "Basic Plan.Enjoy upto 2 profiles";
    }else if(bill===8){
        type = "Standard Plan.Enjoy upto 4 profiles";
    }else if(bill===10){
        type = "Premium Plan.Enjoy upto 6 profiles";
    }else{
        type="Subscribe now"
    }
     bill="Monthly "+bill+"$";
    
    return(
        <>
        <HeaderContainer/>
        <Form2>
            <Form2.Title>Account Settings</Form2.Title>
        
            <Form2.Text>Membership and billing</Form2.Text>
            
            <Form2.TextSmall>{email}</Form2.TextSmall>
            <Form2.Link to="/cancelsubscription">Cancel membership</Form2.Link>

            <Form2.Text>Plan Details</Form2.Text>
            <Form2.TextSmall>{type}</Form2.TextSmall>
            <Form2.TextSmall>{bill}</Form2.TextSmall>
            <Form2.Link to="/updatesubscription">Upgrade Your Plan</Form2.Link>


            <Form2.Text>Settings</Form2.Text>
            <Form2.Link to="#">Watch History</Form2.Link>
        </Form2>
        <FooterContainer/>
      </>  
    );
}

/*
<Form>
            <Form.Title>Account Settings</Form.Title>
            <h2>Membership and billing</h2>
            <h2>cancel membership</h2>
            <h2>user email</h2>
            <h2 className="ml-2">monthly bill</h2>
            <Form.Title>plan details</Form.Title>
            <h2>plan name</h2>
            <h2>upgrade your plan</h2>
            <Form.Title>settings</Form.Title>
            <Form.Link to="#">see watch history</Form.Link>
        </Form>
        */