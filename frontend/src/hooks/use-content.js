import {useEffect,useState,useContext} from 'react';
//imported firebase

export default function useContent(target){
    const [content, setContent]= useState([]);
    //api call in useEffect

    async function fetchMovieFromAPI (genre){
        const url = `http://localhost:5000/api/browse/movies/${genre}`;
        const response = await fetch(url);
        const data = await response.json();
        console.log(data); //prints JSON data
        setContent(data.movies);
    }

    useEffect( ()=>{
        fetchMovieFromAPI('Comedy');
    },[] );

    return { [target]: content};
}