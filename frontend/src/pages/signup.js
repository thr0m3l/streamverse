import React, {useState} from 'react';
import {HeaderContainer} from '../containers/header';
import {FooterContainer} from '../containers/footer';
import {Form} from '../components';
import * as ROUTES from '../constants/routes';
import {useHistory} from 'react-router-dom';

export default function Signup(){
    const history = useHistory();

    //user id might be reomved later or , without removing here, just removing the form.input element also should sufflice and then an empty user_id will be sent to backend
    const [user_id,setUserId] = useState(''); 
    const [name,setName] = useState('');
    const [email,setEmail] = useState('');
    const [dob,setDOB] = useState('');
    //in case of country_id,same as user_id 
    const [country_id,setCountryId] = useState('');
    const [creditcard,setCreditCard] = useState('');
    const [password,setPassword] = useState('');
    const [phone,setPhone] = useState('');
    const [error,setError] = useState('');

    const isInvalid = name ==='' || email ==='' || dob==="" || password===''|| creditcard==='' || phone==='';

    const handleSignup = async event =>{
        event.preventDefault();

        //send data to the backend
        try{
            const response = await fetch('http://localhost:5000/api/users/signup', {
            method: 'POST',
            headers: {
                  'Content-Type' : 'application/json',

            },
            body: JSON.stringify({
                    USER_ID : user_id,
                    NAME : name,
                    EMAIL : email,
                    DOB : dob ,
                    COUNTRY_ID : country_id,
                    CREDIT_CARD : creditcard,
                    PASSWORD : password,
                    PHONE : phone
                })
            });
            
            const responseData = await response.json();
            
            console.log(responseData);

            if (response.status === 201){
                history.push(ROUTES.BROWSE); //Successful signup, moves to netflix browse page
            } else if (response.status === 422){
                setError('Invalid user info');
            }

        }catch(err){
            console.log(err);
            console.log("Sending data to backend failed while signing up");
            setName('');
            setEmail('');
            setPassword('');
            setPhone('');
            setCreditCard('');
            setDOB('');
            setUserId('');
            setCountryId('');
            setError(err.message);
        }
    }
    


    return (
        <>
        <HeaderContainer>
            <Form>
                <Form.Title>Sign Up</Form.Title>
                {error && <Form.Error data-testid="error">{error}</Form.Error>}
                <Form.Base onSubmit={handleSignup} method="POST">

                    <Form.Input placeholder="Name" value={name} onChange={({target})=> setName(target.value) } />

                    <Form.Input placeholder="Email" value={email} onChange={({target})=> setEmail(target.value) } />

                    <Form.Input type="password" autoComplete="off" placeholder="Password" value={password} onChange={({target})=> setPassword(target.value) } />
                    
                    <Form.Input onfocus="(this.type='date')" placeholder="Date Of Birth (MM / DD / YYYY)" value={dob} onChange={({target})=> setDOB(target.value) } />
                    
                    <Form.Input  placeholder="Credit Card No." value={creditcard} onChange={({target})=> setCreditCard(target.value) } />
                    
                    <Form.Input  placeholder="Phone Number." value={phone} onChange={({target})=> setPhone(target.value) } />

                    <Form.Input   placeholder="User Id" value={user_id} onChange={({target})=> setUserId(target.value) } />
                    <Form.Input   placeholder="Country Id" value={country_id} onChange={({target})=> setCountryId(target.value) } />
                
                    <Form.Submit disabled={isInvalid} type="submit" data-testid="sign-up">
                        Sign Up
                    </Form.Submit>
                </Form.Base>

                <Form.Text>
                    Already a user? <Form.Link to ="/signin">Sign in now</Form.Link>
                </Form.Text>
            </Form>
        </HeaderContainer>  
        <FooterContainer/>
        </>
    );
}