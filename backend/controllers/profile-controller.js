const {validationResult} = require('express-validator');
const HttpError = require('../models/http-error');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const database = require('./../services/database');
const { query } = require('express');
const oracledb = require('oracledb');

const getProfile = async (req, res, next) => {
    const email = req.params.email;

    try {
        const result = await database.simpleExecute(
            `SELECT *
            FROM PROFILE
            WHERE EMAIL = :email`, {
                email : email
            } 
        );
        
        res.status(200).json({profile: result.rows});
    } catch (err){
        console.log(err);
        console.log('Cannot get profile from database');
        res.status(400).json({message: 'Cannot get profile from database'});
    }
}

const addProfile = async (req, res, next) => {
    const { EMAIL,PROFILE_ID, DOB} = req.body;

    try {
        database.simpleExecute(
            `INSERT INTO PROFILE (PROFILE_ID, EMAIL, DOB)
            VALUES (:pid, :email, :dob)`, {
                pid: PROFILE_ID,
                email: EMAIL,
                dob : DOB
            }
        )
        res.status(201).json({message: 'Successfully created profile'});
    } catch(err){
        console.log(err);
        res.status(400).json({message: 'Failed to add profile to database'});
    }

}

const updateProfile = async (req, res, next) => {
    const {EMAIL, NAME, DOB} = req.body;

    try {
        database.simpleExecute(
            `UPDATE PROFILE
            SET NAME = :pname, DOB = :dob
            WHERE EMAIL = :email`, {
                pname : EMAIL,
                dob : DOB,
                email : EMAIL   
            }
        )
    } catch(err){
        console.log(err);
        res.status(400).json({message: 'Failed to update profile'});
    }
}

const deleteProfile = async (req, res, next) => {
    const {EMAIL, PROFILE_ID} = req.body;

    try {
        database.simpleExecute(
            `DELETE PROFILE
            WHERE PROFILE_ID = :pid AND EMAIL = :email`, {
                pid : PROFILE_ID,
                email : EMAIL   
            }
        )
    } catch(err){
        console.log(err);
        res.status(400).json({message: 'Failed to delete profile'});
    }
}

const hasWatchListed = async (req, res, next) => {
    let {EMAIL, PROFILE_ID, MOVIE_ID, SHOW_ID} = req.body;
    if (!MOVIE_ID) MOVIE_ID = '';
    if (!SHOW_ID) SHOW_ID = '';

    console.log(EMAIL, PROFILE_ID, MOVIE_ID, SHOW_ID);

    const query = `
        (SELECT MOVIE_ID, EMAIL, PROFILE_ID
        FROM MOVIE_WATCHLIST
        WHERE EMAIL = :email AND PROFILE_ID = :profile_id 
        AND MOVIE_ID = :movie_id
        )
        UNION
        (
            SELECT SHOW_ID, EMAIL, PROFILE_ID
            FROM SHOW_WATCHLIST
            WHERE EMAIL = :email AND PROFILE_ID = :profile_id 
            AND SHOW_ID = :show_id  
        )
    `
    try {
        const result = await database.simpleExecute(query, {
            email : EMAIL,
            profile_id : PROFILE_ID,
            movie_id : MOVIE_ID,
            show_id : SHOW_ID
        });

        // console.log(result);

        if (result.rows.length > 0) message = 'YES';
        else message = 'NO';

        res.status(200).json({message : message});
    } catch(err){
        console.log(err);
        res.status(400).json({message: 'Couldnt get watchlist info'});
    }

}

const addToWatchList = async (req, res, next) => {
    let {EMAIL, PROFILE_ID, MOVIE_ID, SHOW_ID} = req.body;
    let query;
    
    if (!MOVIE_ID) {
        MOVIE_ID = '';
        query = `INSERT INTO SHOW_WATCHLIST (SHOW_ID, PROFILE_ID, EMAIL)
                    VALUES (:show_id, :profile_id, :email)`
        try {
            const result = await database.simpleExecute(query, {
                email : EMAIL,
                profile_id : PROFILE_ID,
                show_id : SHOW_ID
            });
            res.status(200).json({message : 'added'});
        } catch(err){
            console.log(err);
            res.status(400).json(err);
        }

    } else {
        SHOW_ID = '';
        query = `INSERT INTO MOVIE_WATCHLIST (MOVIE_ID, PROFILE_ID, EMAIL)
                    VALUES (:movie_id, :profile_id, :email)`
        try {
            const result = await database.simpleExecute(query, {
                email : EMAIL,
                profile_id : PROFILE_ID,
                movie_id : MOVIE_ID
            });
            res.status(200).json({message : 'added'});
        } catch(err){
            console.log(err);
            res.status(400).json(err);
        }
    }

    console.log('adding', EMAIL, PROFILE_ID, MOVIE_ID, SHOW_ID);

}

const deleteWatchList = async(req, res, next) => {
    const {EMAIL, PROFILE_ID, MOVIE_ID, SHOW_ID} = req.body;
    let query;

    if (MOVIE_ID){
        query = `
        DELETE FROM MOVIE_WATCHLIST
        WHERE EMAIL = :email AND PROFILE_ID = :profile_id AND MOVIE_ID = :movie_id
        `;
        try {
            const result = await database.simpleExecute(query, {
                email : EMAIL,
                profile_id : PROFILE_ID,
                movie_id : MOVIE_ID
            });
            res.status(200).json({message : 'deleted'});
        } catch(err){
            console.log(err);
            res.status(400).json(err);
        }
    } else {
        query = `
        DELETE FROM SHOW_WATCHLIST
        WHERE EMAIL = :email AND PROFILE_ID = :profile_id AND SHOW_ID = :show_id
        `;
        try {
            const result = await database.simpleExecute(query, {
                email : EMAIL,
                profile_id : PROFILE_ID,
                show_id : SHOW_ID
            });
            res.status(200).json({message : 'deleted'});
        } catch(err){
            console.log(err);
            res.status(400).json(err);
        }
    }
}

const getWatchList = async(req, res, next) => {
    let query, query1;
    
    const {PROFILE_ID, EMAIL} = req.body;

    query = `SELECT MW.MOVIE_ID, M.TITLE, M.DESCRIPTION, M.RATING, M.MATURITY_RATING, M.IMAGE_URL
    FROM MOVIE_WATCHLIST MW, MOVIE M
    WHERE MW.MOVIE_ID = M.MOVIE_ID AND
    EMAIL = :email AND PROFILE_ID = :profile_id`;

    query1 = `SELECT SW.SHOW_ID, S.TITLE, S.DESCRIPTION, S.RATING, S.MATURITY_RATING, S.IMAGE_URL
    FROM SHOW_WATCHLIST SW, SHOW S
    WHERE SW.SHOW_ID = S.SHOW_ID AND
    EMAIL = :email AND PROFILE_ID = :profile_id
    `
    try {
        const result = await database.simpleExecute(query, {
            email : EMAIL,
            profile_id : PROFILE_ID
        });
        
        const result1 = await database.simpleExecute(query1, {
            email : EMAIL,
            profile_id : PROFILE_ID
        });

        const shows = {
            title : 'Shows',
            data : result1.rows
        };

        const movies = {
            title: 'Movies',
            data : result.rows
        }

        const arr = [shows, movies];

        console.log('getting watchlist for', EMAIL, PROFILE_ID);
        console.log(arr);

        res.status(200).json({arr});

    } catch(err){
        console.log(err);
        res.status(400).json(err);
    }
}

const addRating = async(req, res, next) => {
    const {EMAIL, PROFILE_ID, MOVIE_ID, SHOW_ID, RATING} = req.body;
    let query;
    if (MOVIE_ID){
        query = `
        BEGIN
            SET_MOVIE_RATING(:movie_id, :email, :profile_id, :rating);
        END;
        `
        try {
            const result = await database.simpleExecute(query, {
                movie_id : MOVIE_ID,
                email : EMAIL,
                profile_id : PROFILE_ID,
                rating : RATING
            });

            res.status(200).json({
                message : 'Inserted rating'
            });

        } catch (err){
            console.log(err);
        }
    } else {
        query = `
        BEGIN
            SET_SHOW_RATING(:show_id, :email, :profile_id, :rating);
        END;
        `
        
        try {
            const result = await database.simpleExecute(query, {
                show_id : SHOW_ID,
                email : EMAIL,
                profile_id : PROFILE_ID,
                rating : RATING
            });

            res.status(200).json({
                message : 'Inserted rating'
            });

        } catch (err){
            console.log(err, 'hello');
        }

    }
}

const findRating = async(req, res, next) => {
    const {EMAIL, PROFILE_ID, MOVIE_ID, SHOW_ID} = req.body;

    if (MOVIE_ID){
        try {
            const result = await database.simpleExecute(`
                BEGIN
                    :rating := GET_MOVIE_RATING (:movie_id, :profile_id, :email);
                END;
            `, {
                rating : {dir : oracledb.BIND_OUT, type : oracledb.NUMBER},
                movie_id : MOVIE_ID,
                profile_id : PROFILE_ID,
                email : EMAIL
            });
            res.status(200).json(result.outBinds);
        } catch(err){
            console.log(err);
            res.status(400).json({err});
        }
    } else {
        try {
            const result = await database.simpleExecute(`
                BEGIN
                    :rating := GET_SHOW_RATING (:show_id, :profile_id, :email);
                END;
            `, {
                rating : {dir : oracledb.BIND_OUT, type : oracledb.NUMBER},
                show_id : SHOW_ID,
                profile_id : PROFILE_ID,
                email : EMAIL
            });
    
            console.log(result.outBinds);
    
            res.status(200).json(result.outBinds);
        } catch(err){
            console.log(err);
            res.status(400).json({err});
        }
    }
}

const getTime = async (req, res, next) => {
    const {movie_id, profile_id, email, show_id, episode_no, season_no} = req.query;

    if (movie_id){
        try {
            const result = await database.simpleExecute(`
                BEGIN
                    GET_MOVIE_TIMESTAMP(:movie_id, :profile_id, :email, :tm);
                END;
            `, {
                movie_id : movie_id,
                profile_id, profile_id,
                email :email,
                tm : {dir : oracledb.BIND_OUT, type : oracledb.NUMBER}
            });
    
            res.status(200).json({WATCHED_UPTO : result.outBinds.tm});
        } catch(err){
            console.log(err);
        }
    } else if (show_id){
        try {
            const result = await database.simpleExecute(`
                BEGIN
                    GET_EPISODE_TIMESTAMP(:show_id, :season_no, :episode_no, :profile_id, :email, :tm);
                END;
            `, {
                show_id : show_id,
                season_no : season_no,
                episode_no : episode_no,
                profile_id, profile_id,
                email :email,
                tm : {dir : oracledb.BIND_OUT, type : oracledb.NUMBER}
            });
    
            res.status(200).json({WATCHED_UPTO : result.outBinds.tm});
        } catch(err){
            console.log(err);
        }
    }   
    

}

const setTime = async (req, res, next) => {
    const {movie_id, show_id, season_no, episode_no, profile_id, email, watched_upto} = req.body;

    if (movie_id){
        try {
            const result = await database.simpleExecute(`
                BEGIN
                    SET_MOVIE_TIMESTAMP(:movie_id, :profile_id, :email, :tm);
                END;
            `, {
                movie_id : movie_id,
                profile_id, profile_id,
                email :email,
                tm : watched_upto
            });
    
    
            res.status(200).json({message: 'Time saved for movie'});
        } catch(err){
            console.log(err);
        }
    } else if (show_id && episode_no && season_no){
        try {
            const result = await database.simpleExecute(`
                BEGIN
                    SET_EPISODE_TIMESTAMP(:show_id, :season_no, :episode_no, :profile_id, :email, :tm);
                END;
            `, {
                show_id : show_id,
                season_no : season_no,
                episode_no : episode_no,
                profile_id, profile_id,
                email :email,
                tm : watched_upto
            });
    
    
            res.status(200).json({message: 'Time saved for the episode'});
        } catch(err){
            console.log(err);
        }
    }
    
}

const movieContinueWatching = async (req, res, next) => {
    const query = `
    SELECT M.MOVIE_ID, M.TITLE, M.DESCRIPTION, M.IMAGE_URL, M.VIDEO_URL,  
    M.RATING, EXTRACT(YEAR FROM M.RELEASE_DATE) as RELEASE_DATE, W.TIME
    FROM MOVIE_WATCH W, MOVIE M
    WHERE M.MOVIE_ID = W.MOVIE_ID AND W.EMAIL = :email 
    AND W.PROFILE_ID = :profile_id AND W.WATCHED_UPTO > 0
    ORDER BY W.TIME DESC 
     `
    const {profile_id, email} = req.query;

    console.log('Continue Watching ', profile_id, email);
    
    try {
        const result = await database.simpleExecute(query, {
            profile_id : profile_id,
            email : email
        });

        res.status(200).json({
            title: 'Continue Watching',
            data : result.rows
        });

    } catch(err){
        console.log(err);
        res.status(400).json(err);
    }

}

const showContinueWatching = async (req, res, next) => {
    const query = `
    SELECT S.SHOW_ID, S.TITLE, S.IMAGE_URL, S.DESCRIPTION, ROUND(S.RATING, 2) as RATING, EXTRACT (YEAR FROM S.START_DATE) as RELEASE_DATE
    FROM SHOW S, EPISODE_WATCH EW
    WHERE S.SHOW_ID = EW.SHOW_ID AND EW.EMAIL = :email AND EW.PROFILE_ID = :profile_id
    GROUP BY S.SHOW_ID, S.TITLE, S.IMAGE_URL, S.DESCRIPTION, ROUND(S.RATING, 2), EXTRACT (YEAR FROM S.START_DATE)
    ORDER BY MAX(EW.TIME) DESC
     `
    const {profile_id, email, season_no, episode_no} = req.query;

    console.log('Continue Watching ', profile_id, email);
    
    try {
        const result = await database.simpleExecute(query, {
            profile_id : profile_id,
            email : email
        });

        res.status(200).json({
            title: 'Continue Watching',
            data : result.rows
        });

    } catch(err){
        console.log(err);
        res.status(400).json(err);
    }
}

const episodeContinueWatching = async (req, res, next) => {

}


exports.getProfile = getProfile;
exports.addProfile = addProfile;
exports.updateProfile = updateProfile;
exports.deleteProfile = deleteProfile;
exports.hasWatchListed = hasWatchListed;
exports.addToWatchList = addToWatchList;
exports.deleteWatchList = deleteWatchList;
exports.addRating = addRating;
exports.getWatchList = getWatchList;
exports.findRating = findRating;
exports.getTime = getTime;
exports.setTime = setTime;
exports.movieContinueWatching = movieContinueWatching;
exports.showContinueWatching = showContinueWatching;
exports.episodeContinueWatching = episodeContinueWatching;