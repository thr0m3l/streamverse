import {useEffect,useState,useContext} from 'react';
//imported firbase

export default function useContent(target){
    const [content,setContent]= useState([]);
    //api call in useEffect

    useEffect( ()=>{
        
    },[] );

    return { [target]: content};
}