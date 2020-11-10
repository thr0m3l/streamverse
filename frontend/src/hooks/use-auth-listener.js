import {useState, useEffect, useContext} from 'react';

export default function useAuthListener(){
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem('authUser'))
    );
    //firebase work
    
    
    



    return {user};
}