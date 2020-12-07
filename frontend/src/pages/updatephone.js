import React, { useContext} from 'react';
import {AuthContext} from './../context/auth-context';
import { UpdatePhoneContainer } from '../containers/updatephone';

export default function UpdatePhone() {
    const auth = useContext(AuthContext);
    return <UpdatePhoneContainer param={auth.email} />;
}
