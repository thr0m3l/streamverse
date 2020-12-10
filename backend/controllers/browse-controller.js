const HttpError = require('../models/http-error');
const database = require('./../services/database');
const cosine_similarity = require('../services/cosine_similarity');
const axios = require('axios');
const { query } = require('express');

const getMovieByGenre = async (req, res, next) => {
   const genre = req.params.genre;
   
   let query;
   
   if (genre === 'all'){
       query = `SELECT M.MOVIE_ID, M.TITLE, M.IMAGE_URL, M.DESCRIPTION, EXTRACT (YEAR FROM M.RELEASE_DATE) as RELEASE_DATE, M.RATING, G.NAME
       FROM MOVIE M, MOVIE_GENRE MG, GENRE G
       WHERE M.MOVIE_ID = MG.MOVIE_ID AND MG.GENRE_ID = G.GENRE_ID AND ROWNUM <= 1000
       ORDER BY DBMS_RANDOM.RANDOM`

       try {
        const result = await database.simpleExecute(query);
        res.status(200).json({movies : result.rows});
        } catch (err){
            console.log(err);
            res.status(400).json({message: 'Cant fetch movie data from backend'});
        }
   }
    else {query = `SELECT *
        FROM MOVIE M, MOVIE_GENRE MG, GENRE G
        WHERE M.MOVIE_ID = MG.MOVIE_ID AND MG.GENRE_ID = G.GENRE_ID
        AND G.NAME = :genre
        ORDER BY M.RATING DESC`

        try {
            const result = await database.simpleExecute(
                query, {
                    genre : genre
                }
            );
            res.status(200).json({movies : result.rows});
        } catch (err){
            console.log(err);
            res.status(400).json({message: 'Cant fetch movie data from backend'});
        }
    }

    


}

const getShowByGenre = async (req, res, next) => {
    const genre = req.params.genre;
    
    let query;
    
    if (genre === 'all'){
        query = `SELECT S.SHOW_ID, S.TITLE, S.RATING, S.IMAGE_URL, S.DESCRIPTION, (EXTRACT(YEAR FROM S.START_DATE) || ' - ' || EXTRACT(YEAR FROM S.END_DATE)) RELEASE_DATE, G.NAME
        FROM SHOW S, SHOW_GENRE SG, GENRE G
        WHERE S.SHOW_ID = SG.SHOW_ID AND SG.GENRE_ID = G.GENRE_ID AND ROWNUM <= 1000
        ORDER BY DBMS_RANDOM.RANDOM`
 
        try {
         const result = await database.simpleExecute(query);
         res.status(200).json({shows : result.rows});
         } catch (err){
             console.log(err);
             res.status(400).json({message: 'Cant fetch show data from backend'});
         }
    }
     else {query = `SELECT S.SHOW_ID, S.TITLE, S.IMAGE_URL, S.DESCRIPTION, EXTRACT(YEAR FROM S.START_DATE) || ' - ' || (YEAR FROM S.END_DATE) as RELEASE_DATE, G.NAME
        FROM SHOW S, SHOW_GENRE SG, GENRE G
        WHERE S.SHOW_ID = SG.SHOW_ID AND SG.GENRE_ID = G.GENRE_ID AND G.NAME = :genre
        ORDER BY DBMS_RANDOM.RANDOM`
 
         try {
             const result = await database.simpleExecute(
                 query, {
                     genre : genre
                 }
             );
             res.status(200).json({shows : result.rows});
         } catch (err){
             console.log(err);
             res.status(400).json({message: 'Cant fetch show data from backend'});
         }
     }
 
 }

 const search = async (req, res, next) => {
    let {kw, param, ss} = req.query; //keyword, search parameter and search space
    if (!kw) kw = ' ';
    if(!param) param = 'all';
    if (!ss) ss = 'all';
    let movieQuery, showQuery, select, from, where, order, space = ss;
    let result = [];
    

    if (ss === 'all' & param !== 'all') space = 'movie';
    //Dynamic Query
    //If search space is movie
    if (space === 'movie') {
        select = `SELECT M.MOVIE_ID, M.TITLE, M.DESCRIPTION, M.RATING, M.IMAGE_URL, EXTRACT(YEAR FROM M.RELEASE_DATE) AS RELEASE_DATE `;
        from = `FROM MOVIE M `;
        order = `ORDER BY M.RATING DESC `;
        if (param === 'celeb'){
            from += `, MOVIE_CELEB MC, CELEB C `;
            where = `WHERE (M.MOVIE_ID = MC.MOVIE_ID AND C.CELEB_ID = MC.CELEB_ID) AND (LOWER(C.NAME) LIKE LOWER(:kw)) `;
        } else if (param === 'genre'){
            from += `, MOVIE_GENRE MG, GENRE G `;
            where = `WHERE (M.MOVIE_ID = MG.MOVIE_ID AND G.GENRE_ID = MG.GENRE_ID) AND (LOWER(G.NAME) LIKE LOWER(:kw)) `;
        } else if (param === 'title'){
            where = `WHERE LOWER(TITLE) LIKE LOWER(:kw) OR LOWER(DESCRIPTION) LIKE (:kw) `;
        } else if (param === 'year'){
            where = `WHERE EXTRACT(YEAR FROM M.RELEASE_DATE) = :kw `
        }
        movieQuery = select + from + where + order;

        try {
            const movies = await database.simpleExecute(movieQuery, {
                kw : (param !== 'year' ? '%' + kw + '%' : kw)
            });

            result.push({
                title: 'Search Result from Movies',
                data: movies.rows
            });

        } catch(err){
            console.log(err);
            res.status(400).json({message: 'Query failed'});
        }
    }

    if (ss === 'all' & param != 'all') space = 'show';
    //If search space is show

    if (space === 'show') {
        select = `SELECT S.SHOW_ID, S.TITLE, S.DESCRIPTION, S.RATING, S.IMAGE_URL, (EXTRACT(YEAR FROM S.START_DATE) || ' - ' || EXTRACT(YEAR FROM S.END_DATE)) RELEASE_DATE `;
        from = `FROM SHOW S `;
        order = `ORDER BY S.RATING DESC`

        if (param === 'celeb'){
            from += `, SHOW_CELEB MC, CELEB C `;
            where = `WHERE (S.SHOW_ID = SC.SHOW_ID AND C.CELEB_ID = SC.CELEB_ID) AND (LOWER(C.NAME) LIKE LOWER(:kw)) `;
        } else if (param === 'genre'){
            from += `, SHOW_GENRE SG, GENRE G `;
            where = `WHERE (S.SHOW_ID = SG.SHOW_ID AND G.GENRE_ID = SG.GENRE_ID) AND (LOWER(G.NAME) LIKE LOWER(:kw)) `;
        } else if (param === 'title'){
            where = `WHERE LOWER(TITLE) LIKE LOWER(:kw) OR LOWER(DESCRIPTION) LIKE (:kw) `;
        } else if (param === 'year'){
            where = `WHERE EXTRACT(YEAR FROM S.START_DATE) = :kw `
        }
        showQuery = select + from + where + order;
        try {
            const shows = await database.simpleExecute(showQuery, {
                kw : (param !== 'year' ? '%' + kw + '%' : kw)
            });
            
            result.push({
                title: 'Search Result from Shows',
                data: shows.rows
            });
        } catch(err){
            console.log(err);
            res.status(400).json({message: 'Query failed'});
        }
    } 


    //Static Query
    //In case no parameter and search space defined, assume all

    if(param === 'all' && ss === 'all') {
        movieQuery = `
        (
            SELECT M.MOVIE_ID, M.TITLE, M.DESCRIPTION, M.RATING, M.IMAGE_URL, EXTRACT(YEAR FROM M.RELEASE_DATE) AS RELEASE_DATE
            FROM MOVIE M
            WHERE LOWER(TITLE) LIKE LOWER(:kw) OR LOWER(DESCRIPTION) LIKE (:kw)
        )
        UNION
        (
            SELECT M.MOVIE_ID, M.TITLE, M.DESCRIPTION, M.RATING, M.IMAGE_URL, EXTRACT(YEAR FROM M.RELEASE_DATE) AS RELEASE_DATE
            FROM MOVIE M, MOVIE_CELEB MC, CELEB C
            WHERE (M.MOVIE_ID = MC.MOVIE_ID AND C.CELEB_ID = MC.CELEB_ID) AND (LOWER(C.NAME) LIKE LOWER(:kw))
        )
        UNION 
        (
            SELECT M.MOVIE_ID, M.TITLE, M.DESCRIPTION, M.RATING, M.IMAGE_URL, EXTRACT(YEAR FROM M.RELEASE_DATE) AS RELEASE_DATE
            FROM MOVIE M, MOVIE_GENRE MG, GENRE G
            WHERE (M.MOVIE_ID = MG.MOVIE_ID AND G.GENRE_ID = MG.GENRE_ID) AND (LOWER(G.NAME) LIKE LOWER(:kw))
        )`

        showQuery = `
        (
            SELECT S.SHOW_ID, S.TITLE, S.DESCRIPTION, S.RATING, S.IMAGE_URL, (EXTRACT(YEAR FROM S.START_DATE) || ' - ' || EXTRACT(YEAR FROM S.END_DATE)) RELEASE_DATE
            FROM SHOW S
            WHERE LOWER(TITLE) LIKE LOWER(:kw) OR LOWER(DESCRIPTION) LIKE (:kw)
        )
        UNION
        (
            SELECT S.SHOW_ID, S.TITLE, S.DESCRIPTION, S.RATING, S.IMAGE_URL, (EXTRACT(YEAR FROM S.START_DATE) || ' - ' || EXTRACT(YEAR FROM S.END_DATE)) RELEASE_DATE
            FROM SHOW S, SHOW_CELEB SC, CELEB C
            WHERE (S.SHOW_ID = SC.SHOW_ID AND C.CELEB_ID = SC.CELEB_ID) AND (LOWER(C.NAME) LIKE LOWER(:kw))
        )
        UNION
        (
            SELECT S.SHOW_ID, S.TITLE, S.DESCRIPTION, S.RATING, S.IMAGE_URL, (EXTRACT(YEAR FROM S.START_DATE) || ' - ' || EXTRACT(YEAR FROM S.END_DATE)) RELEASE_DATE
            FROM SHOW S, SHOW_GENRE SG, GENRE G
            WHERE (S.SHOW_ID = SG.SHOW_ID AND G.GENRE_ID = SG.GENRE_ID) AND (LOWER(G.NAME) LIKE LOWER(:kw))
        )
        `

        try {
            const movies = await database.simpleExecute(movieQuery, {
                kw : '%' + kw + '%'
            });
    
            const shows = await database.simpleExecute(showQuery, {
                kw : '%' + kw + '%'
            });
            
            result = [
                {
                    title: 'Search Result from Movies',
                    data : movies.rows
                },
                {
                    title: 'Search Result from Shows',
                    data : shows.rows
                }
            ]
        } catch(err){
            console.log(err);
            res.status(401).json({message: 'Query failed'});
        }
    }
    res.status(200).json(result);
}

const getEpisodes = async(req, res, next) => {
    const show_id = req.params.show_id;

    const result = await database.simpleExecute(`SELECT SEASONS
        FROM SHOW
        WHERE SHOW_ID = :show_id`, {
            show_id : show_id
    });

    const seasons = result.rows[0].SEASONS;

    const result1 = await database.simpleExecute(`
        SELECT *
        FROM EPISODE
        WHERE SHOW_ID = :show_id
        ORDER BY SEASON_NO, EPISODE_NO`, {
            show_id : show_id
    });

    // res.status(200).json(result1.rows);

    const response = [];

    for(s = 1; s <= seasons; ++s){
        const title = 'Season ' + s;
        const data = [];

        for(e = 0; e < result1.rows.length; ++e){
            if (result1.rows[e].SEASON_NO === s){
                data.push(result1.rows[e]);
            }
        }

        response.push({
            title : title,
            data : data
        });
    }

    res.status(200).json(response);



}

const getSuggestions = async(req, res, next) => {
    try{
        let suggestions;
        
        const mostWatched = await database.simpleExecute(`
            SELECT W.MOVIE_ID, M.TITLE, M.RATING, M.IMAGE_URL, M.DESCRIPTION
            FROM MOVIE_WATCH W, MOVIE M
            WHERE W.MOVIE_ID = M.MOVIE_ID AND ROWNUM <= 50
            GROUP BY W.MOVIE_ID, M.TITLE, M.RATING, M.IMAGE_URL, M.DESCRIPTION
            ORDER BY COUNT(*) DESC`);

        const topRated = await database.simpleExecute(`
            SELECT MOVIE_ID, TITLE, DESCRIPTION, IMAGE_URL, RELEASE_DATE, EXTRACT (YEAR FROM RELEASE_DATE) as RELEASE_DATE, 
            ROUND((TOTAL_VOTES*RATING/(TOTAL_VOTES+10000)) + (10000*(SELECT AVG(RATING) 
            FROM MOVIE)/(TOTAL_VOTES+10000)), 2) as "RATING"
            FROM MOVIE
            WHERE ROWNUM <= 50
            ORDER BY "RATING" DESC
        `);

        const topRatedShows = await database.simpleExecute(
            `SELECT SHOW_ID, TITLE, DESCRIPTION, IMAGE_URL, EXTRACT (YEAR FROM START_DATE) as START_DATE, 
            ROUND((TOTAL_VOTES*RATING/(TOTAL_VOTES+10000)) + (10000*(SELECT AVG(RATING) 
            FROM SHOW)/(TOTAL_VOTES+10000)), 2) as "RATING"
            FROM SHOW
            WHERE ROWNUM <= 50
            ORDER BY "RATING" DESC`
        );

        const mostWatchedShows = await database.simpleExecute(
            `SELECT W.SHOW_ID, S.TITLE, S.RATING, S.IMAGE_URL, S.DESCRIPTION
            FROM SHOW_WATCH W, SHOW S
            WHERE W.SHOW_ID = S.SHOW_ID AND ROWNUM <= 50
            GROUP BY W.SHOW_ID, S.TITLE, S.RATING, S.IMAGE_URL, S.DESCRIPTION
            ORDER BY COUNT(*) DESC`
        );
        
        const newMovies = await database.simpleExecute(
            `SELECT MOVIE_ID, TITLE, DESCRIPTION, IMAGE_URL, EXTRACT (YEAR FROM RELEASE_DATE) as RELEASE_YEAR, 
            ROUND((TOTAL_VOTES*RATING/(TOTAL_VOTES+10000)) + (10000*(SELECT AVG(RATING) 
            FROM MOVIE)/(TOTAL_VOTES+10000)), 2) as "RATING"
            FROM MOVIE
            WHERE ROWNUM <= 50
            ORDER BY RELEASE_DATE DESC`
        );

        const newShows = await database.simpleExecute(
            `SELECT SHOW_ID, TITLE, DESCRIPTION, IMAGE_URL, EXTRACT (YEAR FROM START_DATE) as START_YEAR, 
            ROUND((TOTAL_VOTES*RATING/(TOTAL_VOTES+10000)) + (10000*(SELECT AVG(RATING) 
                      FROM SHOW)/(TOTAL_VOTES+10000)), 2) as "RATING"
                       FROM SHOW
                       WHERE ROWNUM <= 50
                       ORDER BY START_DATE DESC`
        );

        suggestions = [
            {
                title : 'Top Rated Movies',
                data : topRated.rows
            },
            {
                title: 'Most Watched Movies',
                data : mostWatched.rows
            },
            {
                title : 'Top Rated Shows',
                data : topRatedShows.rows
            },
            {
                title : 'Most Watched Shows',
                data : mostWatchedShows.rows
            },
            {
                title : 'New Movies',
                data: newMovies.rows
            },
            {
                title : 'New Shows',
                data : newShows.rows
            }
        ];

        res.status(200).json(suggestions);
    } catch(err){
        console.log(err);
        res.status(400).json(err);
    }
}

const similarity = async(req, res, next) => {
    try {
        const result = await database.simpleExecute(`
            SELECT MOVIE_ID, DESCRIPTION
            FROM MOVIE
            WHERE DESCRIPTION IS NOT NULL
        `);

        // main(arr);
        cosine_similarity.main(result.rows);
        res.status(200).json({message : 'Similarity Calculation successful'});
    } catch(err){
        console.log(err);
        res.status(401).json({message: 'Similarity error'});
    }
}



exports.getMovieByGenre = getMovieByGenre;
exports.getShowByGenre = getShowByGenre;
exports.search = search;
exports.getEpisodes = getEpisodes;
exports.getSuggestions = getSuggestions;
exports.similarity = similarity;