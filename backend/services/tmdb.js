const HttpError = require('../models/http-error');
const database = require('./database'); 
const api_key = 'e7bafd491af23dcc2cc134b14174e118';
const axios = require('axios');

const instance = axios.create({
    baseURL: "https://api.themoviedb.org/3",
});


// instance.get('');

const requests = {
    fetchTrending : `/trending/all/week?api_key=${api_key}&language=en-US`,
    fetchNetflixOriginals: `/discover/tv?api_key=${api_key}&with_networks=213`,
    fetchTopRated: `movie/top_rated?api_key=${api_key}&language=en-US`,
    fetchActionMovies: `discover/movie?api_key=${api_key}&with_genres=28`,
    fetchComedyMovies: `discover/movie?api_key=${api_key}&with_genres=35`,
    fetchHorrorMovies: `discover/movie?api_key=${api_key}&with_genres=27`,
    fetchRomanceMovies: `discover/movie?api_key=${api_key}&with_genres=10749`,
    fetchDocumentaries: `discover/movie?api_key=${api_key}&with_genres=99`,
}

async function fetchData (){
    try {
        const request = await instance.get(requests.fetchTrending.data);
        console.log(request);
    } catch(err){
        console.log(err);
    }
    
    
}

fetchData();



// export default requests;