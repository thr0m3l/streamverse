const HttpError = require('../models/http-error');
const database = require('./database'); 
const api_key = 'e7bafd491af23dcc2cc134b14174e118';
const axios = require('axios');
// const fetch = require('node-fetch');

async function fetchMovieData (totalPages){
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

async function startup () {
    try {
        console.log('Initializing database module');
        await database.initialize();
    } catch (err) {
        console.error(err);
        process.exit(1); // Non-zero failure code
    }
};

startup();


async function fetchShowData(totalPages){
    for(pi =  1; pi <= totalPages; ++pi){
        let page = pi.toString();
        const req = await axios.get(`https://api.themoviedb.org/3/tv/top_rated?api_key=${api_key}&language=en-US&page=${page}`)
        .then(function (response){
            for(i = 0 ; i < response.data.results.length; ++i){
                // console.log(response.data.results[i]);
                
                let {first_air_date, id, overview, original_language, 
                    name, vote_average, vote_count, poster_path} = response.data.results[i];
            
                // console.log(adult);
                // console.log(title);
                // console.log(typeof id);
            // console.log(release_date + ' ' + id + ' ' + title + ' ' + vote_average );

            try {
                database.simpleExecute(`INSERT INTO SHOW (SHOW_ID, TITLE,
                    DESCRIPTION, START_DATE, RATING, TOTAL_VOTES, IMAGE_URL, LANGUAGE)
               VALUES (:show_id, :title, :overview, TO_DATE (:release_date, 'yyyy-mm-dd'), 
               :vote_average, :vote_count, :poster_path, :lang)`,
               {
                   show_id : id,
                   title : name,
                   overview : overview,
                   release_date : first_air_date,
                   vote_average : vote_average,
                   vote_count : vote_count,
                   poster_path : poster_path,
                   lang : original_language
               } );
               for(j = 0; j < response.data.results[i].genre_ids.length; ++j){
                let genre_id = response.data.results[i].genre_ids[j];
                console.log(response.data.results[i].genre_ids[j]);
                database.simpleExecute(`INSERT INTO SHOW_GENRE (SHOW_ID, GENRE_ID) 
                    VALUES (:show_id, :genre_id) `, {
                        show_id : id,
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
    

    axios.get('https://api.themoviedb.org/3/genre/movie/list?api_key=e7bafd491af23dcc2cc134b14174e118&language=en-US').
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

// fetchGenreData();
fetchMovieData(20);
fetchShowData(20);



// export default requests;