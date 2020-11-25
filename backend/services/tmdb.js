const HttpError = require('../models/http-error');
const database = require('./database'); 
const api_key = 'e7bafd491af23dcc2cc134b14174e118';
const axios = require('axios');
// const fetch = require('node-fetch');

const instance = axios.create({
    baseURL: "https://api.themoviedb.org/3/movie/popular?api_key=e7bafd491af23dcc2cc134b14174e118",
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

async function fetchMovieData (totalPages){
    try {
        console.log('Initializing database module');
        await database.initialize();
    } catch (err) {
        console.error(err);
        process.exit(1); // Non-zero failure code
    }
    
    for(pi =  1; pi <= totalPages; ++pi){
        let page = pi.toString();
        const req = await axios.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${api_key}&language=en-US&page=${page}`)
        .then(function (response){
            for(i = 0 ; i < response.data.results.length; ++i){
                // console.log(response.data.results[i]);
                
                let {release_date, adult, id, overview, original_language, 
                    title, vote_average, vote_count, poster_path} = response.data.results[i];

                if (adult) adult = 'R';
                else adult = 'PG13';
            
                // console.log(adult);
                // console.log(title);
                // console.log(typeof id);
            // console.log(release_date + ' ' + id + ' ' + title + ' ' + vote_average );

            try {
                database.simpleExecute(`INSERT INTO MOVIE (MOVIE_ID, TITLE,
                    DESCRIPTION, RELEASE_DATE, RATING, TOTAL_VOTES, IMAGE_URL, LANGUAGE, MATURITY_RATING)
               VALUES (:movie_id, :title, :overview, TO_DATE (:release_date, 'yyyy-mm-dd'), 
               :vote_average, :vote_count, :poster_path, :lang, :adult)`,
               {
                   movie_id : id,
                   title : title,
                   overview : overview,
                   release_date : release_date,
                   vote_average : vote_average,
                   vote_count : vote_count,
                   poster_path : poster_path,
                   lang : original_language,
                   adult : adult
               } );
               for(j = 0; j < response.data.results[i].genre_ids.length; ++j){
                let genre_id = response.data.results[i].genre_ids[j];
                console.log(response.data.results[i].genre_ids[j]);
                database.simpleExecute(`INSERT INTO MOVIE_GENRE (MOVIE_ID, GENRE_ID) 
                    VALUES (:movie_id, :genre_id) `, {
                        movie_id : id,
                        genre_id : genre_id
                });
                
               }
            } catch (err){
                console.log(err);
            }
            //TO_DATE(:release_date, 'yyyy-mm-dd')
            
        }

    }).catch(function (error) {
        console.log(error);
    }).then(function(){
        console.log('Yeah!');
    });
    }
    
    
}

async function fetchGenreData(){
    try {
        console.log('Initializing database module');
        await database.initialize();
    } catch (err) {
        console.error(err);
        process.exit(1); // Non-zero failure code
    }

    


    axios.get('https://api.themoviedb.org/3/genre/tv/list?api_key=e7bafd491af23dcc2cc134b14174e118&language=en-US').
    then(function (response) {
        for(i = 0 ; i < response.data.genres.length; ++i){
            let {id, name} = response.data.genres[i];
            try {
                database.simpleExecute(`INSERT INTO GENRE (GENRE_ID, NAME, CONTENTS)
                VALUES (:genre_id, :genre_name, 0)`,
               {
                    genre_id : id,
                    genre_name : name   
               } );
            } catch (err){
                console.log(err);
            }
        }
    }).catch(function(err){
        console.log(err);
    });

}

fetchMovieData(20);
// fetchGenreData();



// export default requests;