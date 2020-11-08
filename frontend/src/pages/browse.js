import React from 'react';
import { useContent } from '../hooks';
import { selectionFilter } from '../utils';
import {BrowseContainer} from '../containers/browse';

export default function Browse(){

    //contents
    const {series}=useContent('series');
    const {films} = useContent('films');
    const slides = selectionFilter({series,films});
     
    //actually returns a browsecounter
    return <BrowseContainer slides={slides}/>;
}