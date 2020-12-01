import React, {useState, useEffect,useContext}from 'react';
import { Header, Profiles,Header2 } from '../components';
import { Profile } from '../components/header/styles/header';
import * as ROUTES from '../constants/routes';
import logo from '../logo.svg';
import {AuthContext} from './../context/auth-context';

export function SubscriptionHistoryContainer({ email}) {
    const auth = useContext(AuthContext);
    const [subs, setSubs] = useState([]);
    
    //console.log(email);
    async function fetchFromAPI (){
        
        const url = `http://localhost:5000/api/subscription/history/${email}`;
        const response = await fetch(url);
        var data = await response.json();
        var temp;
        console.log(data.history);
        temp =data.history;
        console.log(temp);
        setSubs(data.history);
        console.log(subs);
        console.log(typeof subs);
    }
    
    
    
    useEffect ( () => {
        fetchFromAPI();
    }, []);

  
    return (
    <>
      <Header bg={false}>
        <Header.Frame>
          <Header.Logo to={ROUTES.HOME} src={logo} alt="Netflix" />
          <Header.ButtonLink onClick = {() => auth.logout()}>
                Sign Out
        </Header.ButtonLink>
        </Header.Frame>
      </Header>
      

      <Profiles.Title>Payment History</Profiles.Title>
      
      <Header bg={false}>
        
            {subs.map((name,index)=>{
            return (
                <>
                <Header2.Text >Subscription {index+1}</Header2.Text>
                <Header.Frame>
                        <Header.Group>
                            <Header.Text>Start Date</Header.Text>
                            <Header.Text>{name.S_DATE}</Header.Text>
                        </Header.Group>
                </Header.Frame>
                <Header.Frame>
                        <Header.Group>
                        <Header.Text>End Date</Header.Text>
                        <Header.Text>{name.T_DATE}</Header.Text>
                        </Header.Group>
                </Header.Frame>
                <Header.Frame>
                     <Header.Group>
                        <Header.Text>Total Payment</Header.Text>
                        <Header.Text>{name.TOTAL_BILL} $</Header.Text>
                        </Header.Group>
                        
                </Header.Frame>
                <Header.Frame>
                        <Header.Group>
                        <Header.Text>Plan Type</Header.Text>
                        <Header.Text>{name.SUB_TYPE}</Header.Text>
                        </Header.Group>
                </Header.Frame>
                </>
            )
            })}
        
      
      </Header>
    </>
  );
}
/*<Header.Frame>
          <Header.Group>
              <Header.Text>Start Date</Header.Text>
              <Header.Text>End Date</Header.Text>
              <Header.Text>Bill</Header.Text>
              <Header.Text>Plan Type</Header.Text>
          </Header.Group>
      </Header.Frame>
 */