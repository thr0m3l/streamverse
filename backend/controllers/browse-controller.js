const HttpError = require('../models/http-error');
const database = require('./../services/database');

const getMovieByGenre = async (req, res, next) => {
   const genre = req.params.genre;
   
   let query;
   
   if (genre === 'all'){
       query = `SELECT *
       FROM MOVIE M, MOVIE_GENRE MG, GENRE G
       WHERE M.MOVIE_ID = MG.MOVIE_ID AND MG.GENRE_ID = G.GENRE_ID AND ROWNUM <= 100
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
        query = `SELECT *
            FROM SHOW S, SHOW_GENRE SG, GENRE G
            WHERE S.SHOW_ID = SG.SHOW_ID AND SG.GENRE_ID = G.GENRE_ID
            ORDER BY DBMS_RANDOM.RANDOM`
 
        try {
         const result = await database.simpleExecute(query);
         res.status(200).json({shows : result.rows});
         } catch (err){
             console.log(err);
             res.status(400).json({message: 'Cant fetch show data from backend'});
         }
    }
     else {query = `SELECT *
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
    const kw = req.params.kw;

    const query = `(SELECT M.MOVIE_ID, M.TITLE, M.DESCRIPTION, M.RATING, M.IMAGE_URL
        FROM MOVIE M
        WHERE LOWER(TITLE) LIKE LOWER(:kw) OR LOWER(DESCRIPTION) LIKE (:kw)) 
        UNION
        (SELECT S.SHOW_ID, S.TITLE, S.DESCRIPTION, S.RATING, S.IMAGE_URL
        FROM SHOW S
        WHERE LOWER(TITLE) LIKE LOWER(:kw) OR LOWER(DESCRIPTION) LIKE (:kw))`;

    try {
        const result = await database.simpleExecute(query, {
            kw : '%' + kw + '%'
        });
        res.status(200).json({results: result.rows});
    } catch(err){
        console.log(err);
        res.status(401).json({message: 'Search failed'});
    }
}


exports.getMovieByGenre = getMovieByGenre;
exports.getShowByGenre = getShowByGenre;
exports.search = search;