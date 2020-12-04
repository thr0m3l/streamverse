import React, { useContext} from 'react';
import {AuthContext} from './../context/auth-context';
import { AddSubscriptionContainer } from '../containers/add_subscription';

export default function AddSubscription() {
    const auth = useContext(AuthContext);
    return <AddSubscriptionContainer param={auth.email} />;
}
