const {validationResult} = require('express-validator');
const HttpError = require('../models/http-error');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const database = require('./../services/database');

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
    const {PROFILE_ID, EMAIL, DOB} = req.body;

    try {
        database.simpleExecute(
            `INSERT INTO PROFILE (PROFILE_ID, EMAIL, DOB)
            VALUES (:pname, :email, :dob)`, {
                pname: PROFILE_ID,
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
    
}

const findRating = async(req, res, next) => {
    
}

const updateRating = async(req, res, next) => {
    
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
exports.updateRating = updateRating;