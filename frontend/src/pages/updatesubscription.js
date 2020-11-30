import React, {useState, useContext} from 'react';
import {Card, Form} from '../components';
import { JumbotronContainer } from '../containers/jumbotron';
import * as ROUTES from '../constants/routes';
import {useHistory} from 'react-router-dom';
import {AuthContext} from './../context/auth-context';
import { FooterContainer } from '../containers/footer';
import { HeaderContainer } from '../containers/header';



export default function UpdateSubscription() {
    const history = useHistory();
    const [expire_date,set_expire_date] = useState('');
    const [bill,setBill] = useState('');
    const[sub_type,set_sub_type] = useState('');
    
    const [error,setError] = useState('');
    const auth = useContext(AuthContext);
    var Bill;
    const sub_id = auth.sub_id;
    const email = auth.email;
    console.log(email);
    
    
    const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    
    const isInvalid =   expire_date==="" || sub_type==="" ;

    const handleSubscription = async event =>{
        event.preventDefault();

        //send data to the backend
        try{
            const response = await fetch('http://localhost:5000/api/subscription/update', {
            method: 'PATCH',
            headers: {
                  'Content-Type' : 'application/json',

            },
            body: JSON.stringify({
                    SUB_ID :sub_id ,
                    SUB_TYPE : sub_type, 
                    END_DATE : expire_date
                })
            });

            console.log(sub_type);
            console.log(expire_date);
            
            const responseData = await response.json();
            
            console.log("after submit data in subscribe",responseData);

            if (response.status === 201){
                const url3 = `http://localhost:5000/api/subscription/bill/${sub_id}`;
                const response3 = await fetch(url3);         
                Bill = await response3.json(); 
                Bill = Bill["bill"]["BILL"];
                auth.set_bill(Bill);     
                
                history.push(ROUTES.BROWSE); //Successful update subscription, moves to netflix browse page

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
                <Form.Title>Update Subscription</Form.Title>
                {error && <Form.Error data-testid="error">{error}</Form.Error>}
                <Form.Base onSubmit={handleSubscription} method="PATCH">
                

                
                <form onSelect={({target})=> {
                    var date = new Date(target.value);
                    var day = date.getDate();
                    var month = date.getMonth();
                    month = months[month];
                    var year=date.getFullYear();
                    var s=[day,month,year].join('-');
                    console.log('Final date=',s);
                    set_expire_date(s);
                } }>

                    <label htmlFor="date"  style={{color: "white"}}>Expire Date </label>
                    
                    <input type="date" id="date" ></input>
                
                </form>

                <Form.Text>Choose your plane</Form.Text>
                
                <form onClick={ ({target})=> set_sub_type(target.value)}>
                
                <input type="radio" name="sub_type" value="BAS" id="basic"/><label htmlFor="basic" style={{color: "white"}}> Basic: Maximum 2 profiles, 5$ per month</label>
                <br></br><br></br>
                <input type="radio" name="sub_type" value="STA" id="standard"/><label htmlFor="standard" style={{color: "white"}}> Standard: Maximum 4 profiles, 8$ per month</label>
                <br></br><br></br>
                <input type="radio" name="sub_type" value="PRE" id="premium"/><label htmlFor="premium" style={{color: "white"}}> Premium: Maximum 6 profiles, 10$ per month</label>
                </form>
                



                <Form.Submit disabled={isInvalid} type="submit" data-testid="update-subscription">
                    Update Membership
                </Form.Submit>
                </Form.Base>
            </Form>

        <FooterContainer/>  
    </>
    );

}

/*<HeaderContainer/>
            <Form>
                <Form.Title>Add Subscription</Form.Title>
                {error && <Form.Error data-testid="error">{error}</Form.Error>}
                <Form.Base onSubmit={handleSignup} method="POST">
                
                <Form.Input onfocus="(this.type='date')" placeholder="Expire Date (DD-MON-YYYY)" value={expire_date} onChange={({target})=> set_expire_date(target.value) } />

                <Form.Text>Choose your plane</Form.Text>

                <Form.Input  placeholder="Subscription Type" value={sub_type} onChange={({target})=> set_sub_type(target.value) } />
               <Form.Title>            
                <RadioButton 
                    changed={ null} 
                    id="1" 
                    isSelected={ null } 
                    label="QuickPay" 
                    value="QuickPay" 
                />
                </Form.Title>

                <Form.Submit disabled={isInvalid} type="submit" data-testid="add-subscription">
                    Start Membership
                </Form.Submit>
                </Form.Base>
            </Form>

        <FooterContainer/>*/