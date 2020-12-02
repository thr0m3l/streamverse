import React, {useContext, useState} from 'react';
import { BrowseContainer } from '../containers/browse';
import { useContent } from '../hooks';
import { selectionFilter } from '../utils';
import {AuthContext} from './../context/auth-context';

export default function Browse() {
    const auth = useContext(AuthContext);
    console.log(auth.email);
    console.log(auth.sub_id);
    console.log("in browse,num_profiles",auth.num_profiles);
    const { series } = useContent('series');
    const { films } = useContent('films');
    const slides = selectionFilter({ series, films });
    return <BrowseContainer slides={slides} />;
}