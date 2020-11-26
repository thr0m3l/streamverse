const HttpError = require('../models/http-error');
const database = require('./../services/database');

const getMovieByGenre = async (req, res, next) => {
   const genre = req.params.genre;
   
    const query = `SELECT *
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

exports.getMovieByGenre = getMovieByGenre;