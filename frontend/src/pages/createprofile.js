import React, {useState, useContext} from 'react';
import {Form} from '../components';
import { JumbotronContainer } from '../containers/jumbotron';
import * as ROUTES from '../constants/routes';
import {useHistory} from 'react-router-dom';
import {AuthContext} from './../context/auth-context';

export default function CreateProfile() {
    const history = useHistory();
    const [name,setName] = useState('');
    const [email,setEmail] = useState('');
    const [dob,setDOB] = useState('');
    const [error,setError] = useState('');
    
    const isInvalid = name ==='' || dob==="" ;

    const auth = useContext(AuthContext);


    const handleCreateProfile = async event =>{
        event.preventDefault();
        console.log("comes here!");

        //send data to the backend
        try{
            setEmail(auth.email);

            if (auth.email) console.error(auth.email);
            else console.error('Baaaal');


            const response = await fetch('http://localhost:5000/api/profiles/add', {
            method: 'POST',
            headers: {
                  'Content-Type' : 'application/json',

            },
            body: JSON.stringify({
                    PROFILE_ID : name,
                    EMAIL : email,
                    DOB : dob 
            })
            });
            
            const responseData = await response.json();
            
            console.log(responseData);

            if (response.status === 201){
                history.push(ROUTES.PROFILES); //Successful creation, moves to profiles page

                //TODO: add GET request to get user's profiles + auth token
            } else if (response.status === 400){
                setError('Invalid profile info');
            } else if (response.status === 423){
                setError('Profile already exists');
            }

        }catch(err){
            console.log(err);
            console.log("Sending data to backend failed while creating profile");
            setName('');
            setEmail('');
            setDOB('');
            setError(err.message);
        }
    }


    return (
            <Form>
                <Form.Title>Add Profile</Form.Title>
                    {error && <Form.Error data-testid="error">{error}</Form.Error>}
                <Form.Base onSubmit={handleCreateProfile} method="POST" >
                    
                    <Form.Input placeholder="Name" value={name} onChange={({target})=> setName(target.value) } />

                    <Form.Input onfocus="(this.type='date')" placeholder="Date Of Birth (DD-MON-YYYY)" value={dob} onChange={({target})=> setDOB(target.value) } />

                    <Form.Submit disabled={isInvalid} type="submit" data-testid="creeate-profile">
                        Add Profile
                    </Form.Submit>
                </Form.Base>
            </Form>
        
    );
}