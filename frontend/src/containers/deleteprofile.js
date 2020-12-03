import React, {useState, useEffect,useContext}from 'react';
import { Form, Header, Profiles,Form2 } from '../components';
import * as ROUTES from '../constants/routes';
import logo from '../logo.svg';
import {AuthContext} from './../context/auth-context';
import {useHistory} from 'react-router-dom';
import { Checkbox } from '@material-ui/core';
import { Radio } from '@material-ui/core';


export function DeleteProfileContainer({ email }) {
    const auth = useContext(AuthContext);
    const [profiles, setProfiles] = useState([]);
    const history = useHistory();
    const [error, setError] = useState('');
    const Email =auth.email;
    const mp =auth.max_profiles;
    var msg,prof_name;
    const np=auth.num_profiles;
    const pt=auth.ptbd;

    var p = Math.abs(mp-np);
    var del =[];
    if(pt){
        msg = "Click to Delete "+p+" Profiles";
    }else{
        msg = "Click to Delete Profiles";
    }
    async function fetchFromAPI (){
        console.log('Hello!');
        
        const url = `http://localhost:5000/api/profiles/${Email}`;
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        console.log(profiles);

        setProfiles(data.profile);
        console.log(profiles);
    }

    useEffect ( () => {
        fetchFromAPI();
    }, []);

    const handleDeleteProfile = async event =>{
        
        try{
            const response = await fetch('http://localhost:5000/api/profiles/delete', {
            method: 'DELETE',
            headers: {
                    'Content-Type' : 'application/json',

            },
            body: JSON.stringify({
                    PROFILE_ID :prof_name,
                    EMAIL : Email
                })
            });
            
            const responseData = await response.json();
            
            console.log(responseData);
            if (response.status === 422){
                setError('Invalid user info');
            } else if (response.status === 423){
                setError('User already exists');
            }

        }catch(err){
            console.log(err);
            console.log("Sending data to backend failed while signing up");
            setError(err.message);
        }
    
}

    const handleDelete = ()=>{

        for(let i=0;i<del.length;i++)
        {
            prof_name = del[i];
            handleDeleteProfile();
        }
        auth.set_ptbd(0);
        history.push(ROUTES.BROWSE);
    }
    return (
    <>
      <Header bg={false}>
        <Header.Frame>
          <Header.Logo to={ROUTES.HOME} src={logo} alt="Netflix" />
        </Header.Frame>
      </Header>

        <Form2>
            <Form2.Title>{msg}</Form2.Title>
        <Form2.Base onSubmit={handleDelete} method="DELETE">
      <Profiles>
        <Profiles.List>
            {profiles.map((name,index)=>{
            return (
                
                <Profiles.User onClick = { () => {del.push(name.PROFILE_ID)}}>
                
                <Profiles.Name >{name.PROFILE_ID}</Profiles.Name>
                <Profiles.Picture src={index+1}/>
                </Profiles.User>
            )
            })}
        </Profiles.List>
      </Profiles>
      <Form2.Submit  type="submit" data-testid="delete">
        Proceed
    </Form2.Submit>
    </Form2.Base>
      </Form2>
      
    </>
  );
}