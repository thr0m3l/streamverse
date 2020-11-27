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

    async function fetchShowFromAPI (genre) {
        const url = `http://localhost:5000/api/browse/shows/${genre}`;
        const response = await fetch(url);
        const data = await response.json();
        console.log(data); //prints JSON data

        console.log('fetching show from API');
        setContent(data.shows);
    }

    useEffect( ()=>{
        if (target === 'films') fetchMovieFromAPI('all');
        else fetchShowFromAPI('all');
    },[] );

    return { [target]: content};
}