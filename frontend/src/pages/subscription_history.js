import React, {useState, useEffect,useContext}from 'react';
import { Header, Profiles } from '../components';
import * as ROUTES from '../constants/routes';
import logo from '../logo.svg';
import { SubscriptionHistoryContainer } from '../containers/subscriptionhistory';
import {AuthContext} from './../context/auth-context';

export default function SubscriptionHistory() {
    const auth = useContext(AuthContext);
    
    return < SubscriptionHistoryContainer email={auth.email} />;
}