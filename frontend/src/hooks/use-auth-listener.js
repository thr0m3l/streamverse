import {useState,useEffect,useContext} from 'react';
//imported firbase

export default function useAuthListener(){
    const [user,setUser] = useState(JSON.parse(localStorage.getItem('authUser')));
    //firebase work
    
    



    return {user};
}