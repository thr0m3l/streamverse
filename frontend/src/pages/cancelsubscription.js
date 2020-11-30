import React, {useState, useContext} from 'react';
import {HeaderContainer} from '../containers/header';
import {FooterContainer} from '../containers/footer';
import {Form} from '../components';
import * as ROUTES from '../constants/routes';
import {useHistory} from 'react-router-dom';
import { CountryDropdown, CountryRegionData} from 'react-country-region-selector';
import {AuthContext} from './../context/auth-context';

export default function CancelSubscription(){
    const history = useHistory();
    const [error,setError] = useState('');
    const auth = useContext(AuthContext);
    const sub_id  = auth.sub_id;
    
    const handleCancelSubscription = async event =>{
        event.preventDefault();

        //send data to the backend
        try{
            const response = await fetch('http://localhost:5000/api/subscription/delete', {
            method: 'DELETE',
            headers: {
                  'Content-Type' : 'application/json',

            },
            body: JSON.stringify({
                    SUB_ID : sub_id
                })
            });
            
            const responseData = await response.json();
            
            console.log(responseData);

            if (response.status === 201){
                history.push(ROUTES.ADD_SUBSCRIPTION); //subscription deleted, move to add subscription page

                //TODO: add GET request to get user's profiles + auth token
            } else if (response.status === 422){
                setError('Invalid user info');
            } else if (response.status === 423){
                setError('User already exists');
            }

        }catch(err){
            console.log(err);
            console.log("Sending data to backend failed while deleting subscription");
            setError(err.message);
        }
    }
    


    return (
        <>
        <HeaderContainer>
            <Form>
                <Form.Title>Cancel Membership?</Form.Title>
                {error && <Form.Error data-testid="error">{error}</Form.Error>}
                <Form.Base onSubmit={handleCancelSubscription} method="DELETE">

                    <Form.Submit type="submit" data-testid="cancel">
                        Yes
                    </Form.Submit>
                </Form.Base>
                <Form.Link to="/accountsettings">Go back</Form.Link>

            </Form>
        </HeaderContainer>  
        <FooterContainer/>
        </>
    );
}