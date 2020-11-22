/*import React from 'react';
import { useContent } from '../hooks';
import { selectionFilter } from '../utils';
import {BrowseContainer} from '../containers/browse';

export default function Browse(){

     
    
    return <h1>Hello from browser</h1>;
}*/

  
import React from 'react';
import { BrowseContainer } from '../containers/browse';
import { useContent } from '../hooks';
import { selectionFilter } from '../utils';

export default function Browse() {
  const { series } = useContent('series');
  const { films } = useContent('films');
  const slides = selectionFilter({ series, films });

  return <BrowseContainer slides={slides} />;
}