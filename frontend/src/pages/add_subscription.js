import React, {useState, useContext} from 'react';
import {Form} from '../components';
import { JumbotronContainer } from '../containers/jumbotron';
import * as ROUTES from '../constants/routes';
import {useHistory} from 'react-router-dom';
import {AuthContext} from './../context/auth-context';
import { FooterContainer } from '../containers/footer';
import { HeaderContainer } from '../containers/header';


export default function AddSubscription() {
    const history = useHistory();
    const [expire_date,set_expire_date] = useState('');
    const [bill,setBill] = useState('');
    const[sub_type,set_sub_type] = useState('');
    //const[sub_id,set_sub_id] = useState('');
    const sub_id=101;
    const [error,setError] = useState('');
    const auth = useContext(AuthContext);
    const email = auth.email;
    
    const isInvalid = bill ==='' || email ==='' || expire_date==="" || sub_type==="" ;

    const handleSignup = async event =>{
        event.preventDefault();

        //send data to the backend
        try{
            const response = await fetch('http://localhost:5000/api/subscription/add', {
            method: 'POST',
            headers: {
                  'Content-Type' : 'application/json',

            },
            body: JSON.stringify({
                    SUB_ID : sub_id,
                    SUB_TYPE : sub_type, 
                    EMAIL : email,
                    END_DATE : expire_date
                })
            });
            
            const responseData = await response.json();
            
            console.log("after submit data in subscribe",responseData);

            if (response.status === 201){
                history.push(ROUTES.BROWSE); //Successful subscription, moves to netflix browse page

                //TODO: add GET request to get user's profiles + auth token
            } else if (response.status === 422){
                setError('Invalid user info');
            } else if (response.status === 423){
                setError('User already exists');
            }

        }catch(err){
            console.log(err);
            console.log("Sending data to backend failed while subscribing");
            setError(err.message);
        }
    }
    return (
    <>
        <HeaderContainer/>
            <Form>
                <Form.Title>Add Subscription</Form.Title>
                {error && <Form.Error data-testid="error">{error}</Form.Error>}
                <Form.Base onSubmit={handleSignup} method="POST">
                
                <Form.Input onfocus="(this.type='date')" placeholder="Expire Date (DD-MON-YYYY)" value={expire_date} onChange={({target})=> set_expire_date(target.value) } />
                
                <Form.Input  placeholder="Subscription Type" value={sub_type} onChange={({target})=> set_sub_type(target.value) } />

                <Form.Input  placeholder="Bill" value={bill} onChange={({target})=> setBill(target.value) } />
               
                <Form.Submit disabled={isInvalid} type="submit" data-testid="add-subscription">
                    Start Membership
                </Form.Submit>
                </Form.Base>
            </Form>

        <FooterContainer/>
    </>
    );

}