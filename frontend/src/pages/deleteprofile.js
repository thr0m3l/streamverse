import React, {useState, useContext,useEffect} from 'react';
import {AuthContext} from './../context/auth-context';
import { DeleteProfileContainer } from '../containers/deleteprofile';

export default function DeleteProfile() {
    const auth = useContext(AuthContext);
    return <DeleteProfileContainer param={auth.email} />;
}