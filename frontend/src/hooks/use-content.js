import {useEffect,useState,useContext} from 'react';
//imported firbase

export default function useContent(target){
    const [content,setContent]= useState([]);
    //firebase work

    return { [target]: content};
}