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

        res.status(200).json({result: result.rows});
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




exports.getProfile = getProfile;
exports.addProfile = addProfile;
exports.updateProfile = updateProfile;
exports.deleteProfile = deleteProfile;
exports.hasWatchListed = hasWatchListed;
exports.addToWatchList = addToWatchList;