const HttpError = require('../models/http-error');
const database = require('./../services/database');
const cosine_similarity = require('../services/cosine_similarity');
const axios = require('axios');
const { query, response } = require('express');

const getMovieByGenre = async (req, res, next) => {
   const genre = req.params.genre;
   
   let query;
   
   if (genre === 'all'){
       query = `SELECT M.MOVIE_ID, M.TITLE, M.IMAGE_URL, M.DESCRIPTION, M.VIDEO_URL, EXTRACT (YEAR FROM M.RELEASE_DATE) as RELEASE_DATE, M.RATING, G.NAME
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
    let {ss, key} = req.body; //keyword, search parameter and search space
    if (!key) kw = ' ';

    let movieQuery, showQuery, select, from, where, order, space = ss;
    let result = [];
    let movieQueries = [], showQueries = [];

    if (ss === 'all') space = 'movie';
    //Dynamic Query
    //If search space is movie

    
    if (space === 'movie') {
        
        for(i = 0; i < key.length; i = i + 2){
            param = key[i];
            kw = key[i+1];

            if (key === '') key = ' ';
            
            select = `SELECT M.MOVIE_ID, M.TITLE, M.DESCRIPTION, M.RATING, M.VIDEO_URL, M.IMAGE_URL, M.VIDEO_URL, EXTRACT(YEAR FROM M.RELEASE_DATE) AS RELEASE_DATE `;
            from = `FROM MOVIE M `;
            order = `ORDER BY M.RATING DESC `;
            if (param === 'celeb'){
                from += `, MOVIE_CELEB MC, CELEB C `;
                where = `WHERE (M.MOVIE_ID = MC.MOVIE_ID AND C.CELEB_ID = MC.CELEB_ID) AND (LOWER(C.NAME) LIKE LOWER('%${kw}%')) `;
            } else if (param === 'genre'){
                from += `, MOVIE_GENRE MG, GENRE G `;
                where = `WHERE (M.MOVIE_ID = MG.MOVIE_ID AND G.GENRE_ID = MG.GENRE_ID) AND (LOWER(G.NAME) LIKE LOWER('%${kw}%')) `;
            } else if (param === 'title'){
                where = `WHERE LOWER(M.TITLE) LIKE LOWER('%${kw}%') OR LOWER(M.DESCRIPTION) LIKE LOWER('%${kw}%') `;
            } else if (param === 'year'){
                where = `WHERE EXTRACT(YEAR FROM M.RELEASE_DATE) = ${kw} `
            } else if (param === 'lang'){
                where = `WHERE LOWER(M.LANGUAGE) LIKE LOWER('%${kw}%') `
            }

            if (param !== 'sim') movieQuery = select + from + where;
            else movieQuery = `SELECT *
            FROM (SELECT M2.MOVIE_ID, MS.SCORE, M2.TITLE, M2.DESCRIPTION, M2.IMAGE_URL, M2.VIDEO_URL, M2.RATING, EXTRACT(YEAR FROM M2.RELEASE_DATE) as RELEASE_DATE
                FROM MOVIE M1, MOVIE M2, MOVIE_SIMILARITY MS
                WHERE M1.MOVIE_ID = MS.MOVIE_ID1 AND M2.MOVIE_ID = MS.MOVIE_ID2 
                AND MS.SCORE < 1 AND MS.SCORE > 0.05 AND ${typeof kw === 'number' ? ` M1.MOVIE_ID = ${kw}` : `LOWER(M1.TITLE) LIKE LOWER('%${kw}%') `}
                ORDER BY MS.SCORE DESC)
            WHERE ROWNUM <= 5
            `
            movieQueries.push(movieQuery);
        }

        if (movieQueries.length > 1) movieQuery = `(` + movieQueries[0] + `)`;
        else movieQuery = movieQueries[0];

        for(i = 1; i < movieQueries.length; ++i){
            movieQuery += ` INTERSECT ` + `(` + movieQueries[i] + `)`;
        }

        console.log(movieQuery);
        
        try {
            const movies = await database.simpleExecute(movieQuery);

        result.push({
            title: 'Search Result from Movies',
            data: movies.rows
        });

        } catch(err){
            console.log(err);
            res.status(400).json({message: 'Dynamic Query 1 failed'});
        }
        
        
        
    }

    if (ss === 'all') space = 'show';
    //If search space is show

    if (space === 'show') {
        
        for(i = 0; i < key.length; i = i + 2){

            param = key[i];
            kw = key[i+1];
            
            select = `SELECT S.SHOW_ID, S.TITLE, S.DESCRIPTION, S.RATING, S.IMAGE_URL, (EXTRACT(YEAR FROM S.START_DATE) || ' - ' || EXTRACT(YEAR FROM S.END_DATE)) AS RELEASE_DATE `;
            from = `FROM SHOW S `;
            order = `ORDER BY S.RATING DESC`

            if (param === 'celeb'){
                from += `, SHOW_CELEB SC, CELEB C `;
                where = `WHERE (S.SHOW_ID = SC.SHOW_ID AND C.CELEB_ID = SC.CELEB_ID) AND (LOWER(C.NAME) LIKE LOWER('%${kw}%')) `;
            } else if (param === 'genre'){
                from += `, SHOW_GENRE SG, GENRE G `;
                where = `WHERE (S.SHOW_ID = SG.SHOW_ID AND G.GENRE_ID = SG.GENRE_ID) AND (LOWER(G.NAME) LIKE LOWER('%${kw}%')) `;
            } else if (param === 'title'){
                where = `WHERE LOWER(TITLE) LIKE LOWER('%${kw}%') OR LOWER(DESCRIPTION) LIKE ('%${kw}%') `;
            } else if (param === 'year'){
                where = `WHERE EXTRACT(YEAR FROM S.START_DATE) = ${kw} `
            } else if (param === 'lang'){
                where = `WHERE LOWER(S.LANGUAGE) LIKE LOWER('%${kw}%') `
            }

            if (param !== 'sim') showQuery = select + from + where;
            else showQuery = `SELECT *
            FROM (SELECT S2.SHOW_ID, SS.SCORE, S2.TITLE, S2.DESCRIPTION, S2.IMAGE_URL, S2.RATING, 
                    (EXTRACT(YEAR FROM S2.START_DATE) || ' - ' || EXTRACT(YEAR FROM S2.END_DATE)) as RELEASE_DATE
                FROM SHOW S1, SHOW S2, SHOW_SIMILARITY SS
                WHERE S1.SHOW_ID = SS.SHOW_ID1 AND S2.SHOW_ID = SS.SHOW_ID2 
                AND SS.SCORE < 1 AND SS.SCORE > 0.05 AND ${typeof kw === 'number' ? ` S1.SHOW_ID = ${kw}` : `LOWER(S1.TITLE) LIKE LOWER('%${kw}%') `}
                ORDER BY SS.SCORE DESC)
            WHERE ROWNUM <= 5
            `
            showQueries.push(showQuery);
            
        }

        if (showQueries.length > 1) showQuery = `(` + showQueries[0] + `)`;
        else showQuery = showQueries[0];

        for(i = 1; i < showQueries.length; ++i){
            showQuery += ` INTERSECT ` + `(` + showQueries[i] + `)`;
        }

        console.log(showQuery)

        try {
            const shows = await database.simpleExecute(showQuery);
        
        result.push({
            title: 'Search Result from Shows',
            data: shows.rows
        });
        } catch(err){
            console.log(err);
            res.status(400).json({message: 'Dynamic Query 2 failed'});
        }
        
        
    } 


    //Static Query
    //In case no parameter and search space defined, assume all

    if(ss === 'static') {
        movieQuery = `
        (
            SELECT M.MOVIE_ID, M.TITLE, M.DESCRIPTION, M.RATING, M.IMAGE_URL, M.VIDEO_URL,  EXTRACT(YEAR FROM M.RELEASE_DATE) AS RELEASE_DATE
            FROM MOVIE M
            WHERE LOWER(TITLE) LIKE LOWER(:kw) OR LOWER(DESCRIPTION) LIKE (:kw)
        )
        UNION
        (
            SELECT M.MOVIE_ID, M.TITLE, M.DESCRIPTION, M.RATING, M.IMAGE_URL, M.VIDEO_URL, EXTRACT(YEAR FROM M.RELEASE_DATE) AS RELEASE_DATE
            FROM MOVIE M, MOVIE_CELEB MC, CELEB C
            WHERE (M.MOVIE_ID = MC.MOVIE_ID AND C.CELEB_ID = MC.CELEB_ID) AND (LOWER(C.NAME) LIKE LOWER(:kw))
        )
        UNION 
        (
            SELECT M.MOVIE_ID, M.TITLE, M.DESCRIPTION, M.RATING, M.IMAGE_URL, M.VIDEO_URL, EXTRACT(YEAR FROM M.RELEASE_DATE) AS RELEASE_DATE
            FROM MOVIE M, MOVIE_GENRE MG, GENRE G
            WHERE (M.MOVIE_ID = MG.MOVIE_ID AND G.GENRE_ID = MG.GENRE_ID) AND (LOWER(G.NAME) LIKE LOWER(:kw))
        )`

        showQuery = `
        (
            SELECT S.SHOW_ID, S.TITLE, S.DESCRIPTION, S.RATING, S.IMAGE_URL,  (EXTRACT(YEAR FROM S.START_DATE) || ' - ' || EXTRACT(YEAR FROM S.END_DATE)) RELEASE_DATE
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
                kw : '%' + key + '%'
            });
    
            const shows = await database.simpleExecute(showQuery, {
                kw : '%' + key + '%'
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
            res.status(401).json({message: 'Static Query failed'});
        }
    }
    res.status(200).json(result);
}

const getEpisodes = async(req, res, next) => {
    const {show_id, email, profile_id} = req.query;
    let response = [];
    console.log('Hello', req.query);
    const lastWatched = await database.simpleExecute(`
        SELECT *
        FROM EPISODE_WATCH EW, EPISODE E
        WHERE EW.SHOW_ID = E.SHOW_ID AND E.SEASON_NO = EW.SEASON_NO AND 
        E.EPISODE_NO = EW.EPISODE_NO AND E.SHOW_ID = :show_id AND EW.PROFILE_ID = :profile_id AND EW.EMAIL = :email
        ORDER BY EW.TIME DESC
        `, {
            profile_id : profile_id,
            show_id : show_id,
            email : email
        }
    );
    
    if (lastWatched.rows.length > 0){
        response.push({
            title : 'Continue Watching', 
            data : lastWatched.rows
        });
    }
        

    const result = await database.simpleExecute(`
        SELECT SEASONS
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
    const {email, profile_id} = req.query;
    
    try{
        let suggestions;

        const favoriteGenre = await database.simpleExecute(`
        SELECT NAME
        FROM (SELECT G.NAME
        FROM MOVIE M, MOVIE_GENRE MG, GENRE G, MOVIE_WATCH MW
        WHERE M.MOVIE_ID = MG.MOVIE_ID AND MG.GENRE_ID = G.GENRE_ID 
                    AND MW.MOVIE_ID = M.MOVIE_ID AND MW.RATING = 10 AND MW.EMAIL = :email AND MW.PROFILE_ID = :profile_id
        GROUP BY G.NAME
        ORDER BY COUNT(*) DESC)
        WHERE ROWNUM = 1
        `, {
            profile_id : profile_id,
            email : email
        });

        const lastWatchedMovie = await database.simpleExecute(
            `
            SELECT *
			FROM (
				SELECT M.TITLE
				FROM MOVIE_WATCH MW, MOVIE M
				WHERE M.MOVIE_ID = MW.MOVIE_ID AND MW.PROFILE_ID = :profile_id AND MW.EMAIL = :email
				ORDER BY TIME DESC
			)
			WHERE ROWNUM = 1`, {
                email : email, 
                profile_id : profile_id
            }
        );

        const lastWatchedRecommendation = await database.simpleExecute(
            `SELECT *
            FROM (SELECT M2.MOVIE_ID, MS.SCORE, M2.TITLE, M2.DESCRIPTION, M2.IMAGE_URL, M2.VIDEO_URL, M2.RATING, EXTRACT(YEAR FROM M2.RELEASE_DATE) as RELEASE_DATE
            FROM MOVIE M1, MOVIE M2, MOVIE_SIMILARITY MS
            WHERE M1.MOVIE_ID = MS.MOVIE_ID1 AND M2.MOVIE_ID = MS.MOVIE_ID2 
                        AND MS.SCORE < 1 AND MS.SCORE > 0.05 AND M1.MOVIE_ID = (SELECT *
                        FROM (
                            SELECT MOVIE_ID
                            FROM MOVIE_WATCH
                            WHERE PROFILE_ID = :profile_id AND EMAIL = :email
                            ORDER BY TIME DESC
                        )
                        WHERE ROWNUM = 1)
            ORDER BY MS.SCORE DESC)
            WHERE ROWNUM <= 5`, {
                profile_id : profile_id,
                email : email
            }
        );

        const similarityRecommendation = await database.simpleExecute(`
        SELECT *
        FROM (SELECT M2.MOVIE_ID, MS.SCORE, M2.TITLE, M2.DESCRIPTION, M2.IMAGE_URL, M2.VIDEO_URL, M2.RATING, EXTRACT(YEAR FROM M2.RELEASE_DATE) as RELEASE_DATE
            FROM MOVIE M1, MOVIE M2, MOVIE_SIMILARITY MS
            WHERE M1.MOVIE_ID = MS.MOVIE_ID1 AND M2.MOVIE_ID = MS.MOVIE_ID2 
			AND MS.SCORE < 1 AND MS.SCORE > 0.05 AND M1.MOVIE_ID IN (SELECT *
			    FROM (
				    SELECT MOVIE_ID
                    FROM MOVIE_WATCH
                    WHERE PROFILE_ID = :profile_id AND EMAIL = :email
				    ORDER BY TIME DESC
			    )
			WHERE ROWNUM <= 10)
            ORDER BY MS.SCORE DESC)
        WHERE ROWNUM <= 20`, {
            profile_id : profile_id,
            email : email
        });

        const showSimilarityRecommendation = await database.simpleExecute(`
        SELECT *
        FROM (SELECT S2.SHOW_ID, SS.SCORE, S2.TITLE, S2.DESCRIPTION, S2.IMAGE_URL, S2.RATING, 
				(EXTRACT(YEAR FROM S2.START_DATE) || ' - ' || EXTRACT(YEAR FROM S2.END_DATE)) as RELEASE_DATE
            FROM SHOW S1, SHOW S2, SHOW_SIMILARITY SS
            WHERE S1.SHOW_ID = SS.SHOW_ID1 AND S2.SHOW_ID = SS.SHOW_ID2 
			AND SS.SCORE < 1 AND SS.SCORE > 0.05 AND S1.SHOW_ID IN (SELECT *
			    FROM (
				    SELECT SHOW_ID
            FROM EPISODE_WATCH
            WHERE PROFILE_ID = :profile_id AND EMAIL = :email
						GROUP BY SHOW_ID
			    )
			WHERE ROWNUM <= 10)
            ORDER BY SS.SCORE DESC)
        WHERE ROWNUM <= 20
        `, {
            email : email,
            profile_id : profile_id
        });

        const genreRecommendation = await database.simpleExecute(`
        SELECT *
        FROM (SELECT *
        FROM (SELECT M.MOVIE_ID, M.TITLE, M.IMAGE_URL, M.DESCRIPTION, ROUND((TOTAL_VOTES*RATING/(TOTAL_VOTES+10000)) + (10000*(SELECT AVG(RATING) 
                    FROM MOVIE)/(TOTAL_VOTES+10000)), 2) as "RATING", EXTRACT (YEAR FROM M.RELEASE_DATE) as RELEASE_DATE
        FROM MOVIE M, MOVIE_GENRE MG
        WHERE M.MOVIE_ID = MG.MOVIE_ID AND MG.GENRE_ID = (SELECT GENRE_ID
        FROM (SELECT G.GENRE_ID
        FROM MOVIE M, MOVIE_GENRE MG, GENRE G, MOVIE_WATCH MW
        WHERE M.MOVIE_ID = MG.MOVIE_ID AND MG.GENRE_ID = G.GENRE_ID 
                    AND MW.MOVIE_ID = M.MOVIE_ID AND MW.RATING = 10 AND MW.EMAIL = :email AND MW.PROFILE_ID = :profile_id
        GROUP BY G.GENRE_ID
        ORDER BY COUNT(*) DESC)
        WHERE ROWNUM = 1 )
        
        MINUS
        
        SELECT M.MOVIE_ID, M.TITLE, M.IMAGE_URL, M.DESCRIPTION, ROUND((M.TOTAL_VOTES*M.RATING/(M.TOTAL_VOTES+10000)) + (10000*(SELECT AVG(RATING) 
                    FROM MOVIE)/(TOTAL_VOTES+10000)), 2) as "RATING", EXTRACT (YEAR FROM M.RELEASE_DATE) as RELEASE_DATE
        FROM MOVIE M, MOVIE_GENRE MG, MOVIE_WATCH MW
        WHERE M.MOVIE_ID = MG.MOVIE_ID AND MW.MOVIE_ID = M.MOVIE_ID AND MW.PROFILE_ID = :profile_id AND MW.EMAIL = :email AND MG.GENRE_ID = (SELECT GENRE_ID
        FROM (SELECT G.GENRE_ID
        FROM MOVIE M, MOVIE_GENRE MG, GENRE G, MOVIE_WATCH MW
        WHERE M.MOVIE_ID = MG.MOVIE_ID AND MG.GENRE_ID = G.GENRE_ID 
                    AND MW.MOVIE_ID = M.MOVIE_ID AND MW.RATING = 10
        GROUP BY G.GENRE_ID
        ORDER BY COUNT(*) DESC)
        WHERE ROWNUM = 1 ))
        ORDER BY RATING DESC)
        WHERE ROWNUM <= 10
        `, {
            profile_id : profile_id,
            email : email
        });

        const favoriteShowGenre = await database.simpleExecute(`
        SELECT GENRE_ID, NAME
        FROM (SELECT SG.GENRE_ID, G.NAME
                FROM EPISODE_WATCH EW, SHOW_GENRE SG, SHOW S, GENRE G
                WHERE EW.SHOW_ID = S.SHOW_ID AND SG.SHOW_ID = S.SHOW_ID AND 
                SG.GENRE_ID = G.GENRE_ID AND EW.PROFILE_ID = :profile_id AND EW.EMAIL = :email
                GROUP BY SG.GENRE_ID, G.NAME
                ORDER BY COUNT(*) DESC)
        WHERE ROWNUM = 1
        `, {
            profile_id : profile_id,
            email : email
        });

        const showGenreRecommendation = await database.simpleExecute(`
        SELECT *
        FROM (SELECT *
        FROM (SELECT S.SHOW_ID, S.TITLE, S.IMAGE_URL, S.DESCRIPTION, ROUND((S.TOTAL_VOTES*S.RATING/(S.TOTAL_VOTES+10000)) + (10000*(SELECT AVG(RATING) 
                            FROM SHOW)/(TOTAL_VOTES+10000)), 2) as "RATING", (EXTRACT(YEAR FROM S.START_DATE) || ' - ' || EXTRACT(YEAR FROM S.END_DATE)) as RELEASE_DATE
        FROM SHOW S, SHOW_GENRE SG
        WHERE S.SHOW_ID = SG.SHOW_ID AND SG.GENRE_ID = (SELECT GENRE_ID
        FROM (SELECT SG.GENRE_ID, G.NAME
                    FROM EPISODE_WATCH EW, SHOW_GENRE SG, SHOW S, GENRE G
                    WHERE EW.SHOW_ID = S.SHOW_ID AND SG.SHOW_ID = S.SHOW_ID AND 
                        SG.GENRE_ID = G.GENRE_ID AND EW.PROFILE_ID = :profile_id AND EW.EMAIL = :email
                    GROUP BY SG.GENRE_ID, G.NAME
                    ORDER BY COUNT(*) DESC)
        WHERE ROWNUM = 1)
        )
        ORDER BY RATING DESC)
        WHERE ROWNUM <=10
        `, {
            email : email,
            profile_id : profile_id
        });

        const lastWatchedShow = await database.simpleExecute(`
            SELECT TITLE
            FROM (SELECT S.SHOW_ID, S.TITLE
                FROM SHOW S, EPISODE_WATCH EW
                WHERE S.SHOW_ID = EW.SHOW_ID AND EW.EMAIL = :email AND EW.PROFILE_ID = :profile_id
                GROUP BY S.SHOW_ID, S.TITLE
                ORDER BY MAX(EW.TIME) DESC)
            WHERE ROWNUM = 1
        `, {
            email : email,
            profile_id : profile_id
        });


        const lastWatchedShowRecommendation = await database.simpleExecute(`
            SELECT *
            FROM (SELECT S2.SHOW_ID, SS.SCORE, S2.TITLE, S2.IMAGE_URL, S2.DESCRIPTION, ROUND((S2.TOTAL_VOTES*S2.RATING/(S2.TOTAL_VOTES+10000)) + (10000*(SELECT AVG(RATING) 
                                        FROM SHOW)/(S2.TOTAL_VOTES+10000)), 2) as "RATING"
            FROM SHOW S1, SHOW S2, SHOW_SIMILARITY SS
            WHERE SS.SHOW_ID1 = S1.SHOW_ID AND SS.SHOW_ID2 = S2.SHOW_ID AND SS.SCORE < 1 AND SS.SCORE > 0.05 AND S1.SHOW_ID = (SELECT SHOW_ID
            FROM (SELECT S.SHOW_ID, S.TITLE, S.IMAGE_URL, S.DESCRIPTION, ROUND(S.RATING, 2) as RATING, EXTRACT (YEAR FROM S.START_DATE) as RELEASE_DATE
                FROM SHOW S, EPISODE_WATCH EW
                WHERE S.SHOW_ID = EW.SHOW_ID AND EW.EMAIL = :email AND EW.PROFILE_ID = :profile_id
                GROUP BY S.SHOW_ID, S.TITLE, S.IMAGE_URL, S.DESCRIPTION, ROUND(S.RATING, 2), EXTRACT (YEAR FROM S.START_DATE)
                ORDER BY MAX(EW.TIME) DESC )
                WHERE ROWNUM = 1)
            ORDER BY SS.SCORE DESC )
            WHERE ROWNUM <= 5
        `, {
            email : email,
            profile_id : profile_id
        });
        
        const mostWatched = await database.simpleExecute(`
            SELECT W.MOVIE_ID, M.TITLE, M.RATING, M.IMAGE_URL, M.DESCRIPTION, M.VIDEO_URL
            FROM MOVIE_WATCH W, MOVIE M
            WHERE W.MOVIE_ID = M.MOVIE_ID AND ROWNUM <= 50
            GROUP BY W.MOVIE_ID, M.TITLE, M.RATING, M.IMAGE_URL, M.DESCRIPTION, M.VIDEO_URL
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
        
        

        suggestions = [
            {
                title: 'Recommended Movies for you',
                data : similarityRecommendation.rows
            },
            {
                title : 'Recommended Shows for you',
                data : showSimilarityRecommendation.rows
            },

            {
                title : 'Because you like ' + favoriteGenre.rows[0].NAME + ' movies',
                data : genreRecommendation.rows
            },

            {
                title : 'Because you watched ' + lastWatchedMovie.rows[0].TITLE,
                data : lastWatchedRecommendation.rows
            },
            {
                title: 'Because you like ' + favoriteShowGenre.rows[0].NAME + ' shows',
                data : showGenreRecommendation.rows
            },
            {
                title: 'Because you watched ' + lastWatchedShow.rows[0].TITLE,
                data : lastWatchedShowRecommendation.rows
            }
            ,
            {
                title : 'Top Rated Movies',
                data : topRated.rows
            },
            {
                title: 'Most Watched Movies',
                data : mostWatched.rows
            }
            ,
            {
                title : 'Top Rated Shows',
                data : topRatedShows.rows
            }
            ,
            {
                title : 'Most Watched Shows',
                data : mostWatchedShows.rows
            }
        ];

        res.status(200).json(suggestions);
    } catch(err){
        console.log(err);
        res.status(400).json(err);
    }
}

const newAndPopular = async (req, res, next) => {
    const {email} = req.query;
    
    try {
        const newMovies = await database.simpleExecute(
            `SELECT MOVIE_ID, TITLE, DESCRIPTION, VIDEO_URL, IMAGE_URL, EXTRACT (YEAR FROM RELEASE_DATE) as RELEASE_DATE, 
            ROUND((TOTAL_VOTES*RATING/(TOTAL_VOTES+10000)) + (10000*(SELECT AVG(RATING) 
            FROM MOVIE)/(TOTAL_VOTES+10000)), 2) as "RATING"
            FROM MOVIE
            WHERE ROWNUM <= 50 AND RELEASE_DATE <= SYSDATE
            ORDER BY RELEASE_DATE DESC`
        );
    
        const newShows = await database.simpleExecute(
            `SELECT SHOW_ID, TITLE, DESCRIPTION, IMAGE_URL, VIDEO_URL, EXTRACT (YEAR FROM START_DATE) as START_YEAR, 
            ROUND((TOTAL_VOTES*RATING/(TOTAL_VOTES+10000)) + (10000*(SELECT AVG(RATING) 
                      FROM SHOW)/(TOTAL_VOTES+10000)), 2) as "RATING"
                       FROM SHOW
                       WHERE ROWNUM <= 50 AND START_DATE <= SYSDATE
                       ORDER BY START_DATE DESC`
        );
    
    
        const upcomingMovies = await database.simpleExecute(`
            SELECT MOVIE_ID, TITLE, DESCRIPTION, IMAGE_URL,  EXTRACT (YEAR FROM RELEASE_DATE) as RELEASE_DATE, 
            ROUND((TOTAL_VOTES*RATING/(TOTAL_VOTES+10000)) + (10000*(SELECT AVG(RATING) 
            FROM MOVIE)/(TOTAL_VOTES+10000)), 2) as "RATING"
            FROM MOVIE
            WHERE ROWNUM <= 50 AND RELEASE_DATE > SYSDATE
            ORDER BY RELEASE_DATE DESC
        `);
    
        const upcomingShows = await database.simpleExecute(`
        SELECT SHOW_ID, TITLE, DESCRIPTION, IMAGE_URL, EXTRACT (YEAR FROM START_DATE) as RELEASE_DATE, 
        ROUND((TOTAL_VOTES*RATING/(TOTAL_VOTES+10000)) + (10000*(SELECT AVG(RATING) 
                  FROM SHOW)/(TOTAL_VOTES+10000)), 2) as "RATING"
                   FROM SHOW
                   WHERE ROWNUM <= 50 AND START_DATE > SYSDATE
                   ORDER BY START_DATE DESC
        `);
    
        const userCountry = await database.simpleExecute(`
            SELECT U.COUNTRY
            FROM USER_NETFLIX U
            WHERE EMAIL = :email
        `, {
            email : email
        });
    
        const regionMovie = await database.simpleExecute(`
            SELECT *
            FROM (SELECT M.MOVIE_ID, M.TITLE, M.RATING, M.IMAGE_URL, M.DESCRIPTION, EXTRACT(YEAR FROM M.RELEASE_DATE) as RELEASE_DATE
                FROM MOVIE M, MOVIE_WATCH MW, USER_NETFLIX U
                WHERE M.MOVIE_ID = MW.MOVIE_ID AND MW.EMAIL = U.EMAIL AND (SYSDATE - MW.TIME) < 7 AND U.COUNTRY = (SELECT U.COUNTRY
                    FROM USER_NETFLIX U
                    WHERE EMAIL = :email)
                GROUP BY M.MOVIE_ID, M.TITLE, M.RATING, M.IMAGE_URL, M.DESCRIPTION, EXTRACT(YEAR FROM M.RELEASE_DATE)
                ORDER BY COUNT(*) DESC)
            WHERE ROWNUM <= 10
        `, {
            email : email
        })
    
        const regionShow = await database.simpleExecute(`
        SELECT S.SHOW_ID, S.TITLE, S.DESCRIPTION, S.RATING, S.IMAGE_URL, (EXTRACT(YEAR FROM S.START_DATE) || ' - ' || EXTRACT(YEAR FROM S.END_DATE)) RELEASE_DATE
        FROM SHOW S
        WHERE SHOW_ID IN (SELECT S.SHOW_ID
        FROM SHOW S, EPISODE_WATCH EW, USER_NETFLIX U
        WHERE S.SHOW_ID = EW.SHOW_ID AND  EW.EMAIL = U.EMAIL AND U.COUNTRY = (SELECT U.COUNTRY
                FROM USER_NETFLIX U
                WHERE EMAIL = :email) AND (SYSDATE - EW.TIME) < 7 
        GROUP BY S.SHOW_ID
        )
        
        `, {
            email : email
        });

        const globalMovie = await database.simpleExecute(`
            SELECT *
            FROM (SELECT M.MOVIE_ID, M.TITLE, M.RATING, M.IMAGE_URL, M.DESCRIPTION, EXTRACT(YEAR FROM M.RELEASE_DATE) as RELEASE_DATE
                FROM MOVIE M, MOVIE_WATCH MW, USER_NETFLIX U
                WHERE M.MOVIE_ID = MW.MOVIE_ID AND MW.EMAIL = U.EMAIL AND (SYSDATE - MW.TIME) < 7
                GROUP BY M.MOVIE_ID, M.TITLE, M.RATING, M.IMAGE_URL, M.DESCRIPTION, EXTRACT(YEAR FROM M.RELEASE_DATE)
                ORDER BY COUNT(*) DESC)
            WHERE ROWNUM <= 10
        `)
    
        const globalShow = await database.simpleExecute(`
        SELECT S.SHOW_ID, S.TITLE, S.DESCRIPTION, S.RATING, S.IMAGE_URL, (EXTRACT(YEAR FROM S.START_DATE) || ' - ' || EXTRACT(YEAR FROM S.END_DATE)) RELEASE_DATE
        FROM SHOW S
        WHERE SHOW_ID IN (SELECT S.SHOW_ID
        FROM SHOW S, EPISODE_WATCH EW, USER_NETFLIX U
        WHERE S.SHOW_ID = EW.SHOW_ID AND  EW.EMAIL = U.EMAIL AND (SYSDATE - EW.TIME) < 7 
        GROUP BY S.SHOW_ID
        )
        `);

        

    
        const response = [
            {
                title: 'Top 10 Movies in ' + userCountry.rows[0].COUNTRY,
                data: regionMovie.rows
            }
            ,
            {
                title: 'Top 10 Shows in ' + userCountry.rows[0].COUNTRY,
                data : regionShow.rows
            }
            ,
            {
                title : 'Trending Movies ',
                data : globalMovie.rows
            }
            ,
            {
                title: 'Trending Shows ',
                data : globalShow.rows
            }
            ,
            {
                title : 'New Movies',
                data: newMovies.rows
            }
            ,
            {
                title : 'New Shows',
                data : newShows.rows
            }
            ,
            {
                title : 'Upcoming Movies',
                data : upcomingMovies.rows
            }
            ,
            {
                title : 'Upcoming Shows',
                data : upcomingShows.rows
            }   
        ];
    
        res.status(200).json(response);
    } catch (err){
        console.log(err);
        res.status(400).json(err);
    }
    

}

const similarity = async(req, res, next) => {
    const {type} = req.query;
    if (type === 'movie'){
        try {
            const result = await database.simpleExecute(`
                SELECT MOVIE_ID, DESCRIPTION
                FROM MOVIE
                WHERE DESCRIPTION IS NOT NULL
            `);
    
            // main(arr);
            cosine_similarity.main(result.rows, type);
            res.status(200).json({message : 'Similarity Calculation successful for movies'});
        } catch(err){
            console.log(err);
            res.status(401).json({message: 'Similarity error'});
        }
    } else if (type === 'show'){
        try {
            const result = await database.simpleExecute(`
                SELECT SHOW_ID, DESCRIPTION
                FROM SHOW
                WHERE DESCRIPTION IS NOT NULL
            `);
    
            // main(arr);
            cosine_similarity.main(result.rows, type);
            res.status(200).json({message : 'Similarity Calculation successful for shows'});
        } catch(err){
            console.log(err);
            res.status(401).json({message: 'Similarity error'});
        }
    }
    
}

const getGenres = async (req, res, next) => {
    const {movie_id, show_id} = req.query;
    let query, result;
    
    try {
        if (movie_id) {
            query = `
            SELECT G.NAME, M.TOTAL_VIEWS, M.TOTAL_VOTES
            FROM MOVIE M, MOVIE_GENRE MG, GENRE G
            WHERE M.MOVIE_ID = MG.MOVIE_ID AND G.GENRE_ID = MG.GENRE_ID AND M.MOVIE_ID = :movie_id
            `
            const movies = await database.simpleExecute(query, {
                movie_id : movie_id
            });
            result = movies.rows;
    
        } else {
            query = `
            SELECT G.NAME, S.TOTAL_VIEWS, S.TOTAL_VOTES
            FROM SHOW S, SHOW_GENRE SG, GENRE G
            WHERE S.SHOW_ID = SG.SHOW_ID AND G.GENRE_ID = SG.GENRE_ID AND S.SHOW_ID = :show_id
            `
    
            const shows = await database.simpleExecute(query, {
                show_id : show_id
            });
            result = shows.rows;
        }

        res.status(200).json(result);
        console.log(result);
    } catch (err){
        console.log(err);
        res.status(400).json({message: 'Getting genre failed'});
    }

}

const getCelebs = async (req, res, next) => {
    let query;
    const {movie_id, show_id} = req.query;

    if (movie_id){
        query = `
        SELECT M.TITLE, C.NAME
        FROM MOVIE M, MOVIE_CELEB MC, CELEB C
        WHERE M.MOVIE_ID = MC.MOVIE_ID AND C.CELEB_ID = MC.CELEB_ID AND M.MOVIE_ID = :movie_id AND ROWNUM <= 5
        `

        try {
            const celebs = await database.simpleExecute(query, {
                movie_id : movie_id
            });
            console.log(celebs.rows);
            res.status(200).json(celebs.rows);
        } catch(err){
            console.log(err);
            res.status(400).json({message : 'Celeb error'});
        }


    } else {
        query = `
        SELECT S.TITLE, C.NAME
        FROM SHOW S, SHOW_CELEB SC, CELEB C
        WHERE S.SHOW_ID = SC.SHOW_ID AND C.CELEB_ID = SC.CELEB_ID AND S.SHOW_ID = :show_id AND ROWNUM <= 5
        `

        try {
            const celebs = await database.simpleExecute(query, {
                show_id : show_id
            });
            console.log(celebs.rows);
            res.status(200).json(celebs.rows);
        } catch(err){
            console.log(err);
            res.status(400).json({message : 'Celeb error'});
        }
    }

}

const getSimilar = async (req, res, next) => {
    let query;
    const {movie_id, show_id} = req.query;

    if (movie_id){
        query = `
        SELECT *
        FROM (SELECT M2.MOVIE_ID, MS.SCORE, M2.TITLE, M2.DESCRIPTION, M2.IMAGE_URL, M2.VIDEO_URL, M2.RATING, EXTRACT(YEAR FROM M2.RELEASE_DATE) as RELEASE_DATE
            FROM MOVIE M1, MOVIE M2, MOVIE_SIMILARITY MS
            WHERE M1.MOVIE_ID = MS.MOVIE_ID1 AND M2.MOVIE_ID = MS.MOVIE_ID2 
			AND MS.SCORE < 1 AND MS.SCORE > 0.05 AND M1.MOVIE_ID = :movie_id
            ORDER BY MS.SCORE DESC)
        WHERE ROWNUM <= 5
        `

        try {
            const movies = await database.simpleExecute(query, {
                movie_id : movie_id
            });
            console.log(movies.rows);
            res.status(200).json(movies.rows);
        } catch(err){
            console.log(err);
            res.status(400).json({message : 'Couldnt find similar movies'});
        }


    } else {
        query = `
        SELECT S.TITLE, C.NAME
        FROM MOVIE S, SHOW_CELEB SC, CELEB C
        WHERE S.SHOW_ID = SC.SHOW_ID AND C.CELEB_ID = SC.CELEB_ID AND S.SHOW_ID = :show_id AND ROWNUM <= 5
        `

        try {
            const celebs = await database.simpleExecute(query, {
                show_id : show_id
            });
            console.log(celebs.rows);
            res.status(200).json(celebs.rows);
        } catch(err){
            console.log(err);
            res.status(400).json({message : 'Celeb error'});
        }
    }
}



exports.getMovieByGenre = getMovieByGenre;
exports.getShowByGenre = getShowByGenre;
exports.search = search;
exports.getEpisodes = getEpisodes;
exports.getSuggestions = getSuggestions;
exports.similarity = similarity;
exports.newAndPopular = newAndPopular;
exports.getGenres = getGenres;
exports.getCelebs = getCelebs;
exports.getSimilar = getSimilar;