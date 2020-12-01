import React, {useState, useEffect}from 'react';
import { Header, Profiles } from '../components';
import * as ROUTES from '../constants/routes';
import logo from '../logo.svg';

export function SelectProfileContainer({ email, setProfile }) {
    const [profiles, setProfiles] = useState([]);

    async function fetchFromAPI (){
        console.log('Hello!');
        
        const url = `http://localhost:5000/api/profiles/${email}`;
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
  
    return (
    <>
      <Header bg={false}>
        <Header.Frame>
          <Header.Logo to={ROUTES.HOME} src={logo} alt="Netflix" />
          <Header.ButtonLink to={ROUTES.CREATE_PROFILE}>Create Profile</Header.ButtonLink>
        </Header.Frame>
      </Header>

      <Profiles>
        <Profiles.Title>Who's watching?</Profiles.Title>
        <Profiles.List>
            {profiles.map((name,index)=>{
            return (
                <Profiles.User onClick = { () => setProfile (name)}>
                    <Profiles.Name >{name.PROFILE_ID}</Profiles.Name>
                    <Profiles.Picture src={index+1}/>
                </Profiles.User>
            )
            })}
        </Profiles.List>
      </Profiles>
    </>
  );
}