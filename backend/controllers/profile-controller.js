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
        query = `INSERT INTO MOVIE_WATCH 
        (MOVIE_ID, EMAIL, PROFILE_ID, RATING) 
        VALUES (:movie_id, :email, :profile_id, :rating)`
        
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

            query = `UPDATE MOVIE_WATCH
            SET RATING = :rating
            WHERE MOVIE_ID = :movie_id AND PROFILE_ID = :profile_id AND EMAIL = :email`

            try {
                const result = await database.simpleExecute(query, {
                    movie_id : MOVIE_ID,
                    email : EMAIL,
                    profile_id : PROFILE_ID,
                    rating : RATING
                });

                res.status(200).json({
                    message : 'Updated rating'
                });
            } catch (err1){  
                console.log(err1)
                res.status(400).json({message: 'couldnt add rating'});
            }
        }
    } else {
        query = `INSERT INTO SHOW_WATCH 
        (SHOW_ID, EMAIL, PROFILE_ID, RATING) 
        VALUES (:show_id, :email, :profile_id, :rating)`
        
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
            console.log(err);

            query = `UPDATE SHOW_WATCH
            SET RATING = :rating
            WHERE SHOW_ID = :show_id AND PROFILE_ID = :profile_id AND EMAIL = :email`

            try {
                const result = await database.simpleExecute(query, {
                    show_id : SHOW_ID,
                    email : EMAIL,
                    profile_id : PROFILE_ID,
                    rating : RATING
                });

                res.status(200).json({
                    message : 'Updated rating'
                });
            } catch (err1){  
                console.log(err1)
                res.status(400).json({message: 'couldnt add rating'});
            }
        }

    }
}

const findRating = async(req, res, next) => {
    const {EMAIL, PROFILE_ID, MOVIE_ID, SHOW_ID} = req.body;

    let func = `CREATE OR REPLACE FUNCTION GET_MOVIE_RATING
     (MID IN NUMBER, PID IN VARCHAR2, EML IN VARCHAR2)
    RETURN NUMBER IS
        R NUMBER DEFAULT -1;
    BEGIN
        SELECT RATING INTO R
        FROM MOVIE_WATCH
        WHERE MOVIE_ID = MID AND PROFILE_ID = PID AND EMAIL = EML;
        RETURN R;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN -1;

    END;
    `

    let func1 = `CREATE OR REPLACE FUNCTION GET_SHOW_RATING 
    (SID IN NUMBER, PID IN VARCHAR2, EML IN VARCHAR2)
    RETURN NUMBER IS
        R NUMBER DEFAULT -1;
    BEGIN
        SELECT RATING INTO R
        FROM SHOW_WATCH
        WHERE SHOW_ID = SID AND PROFILE_ID = PID AND EMAIL = EML;
        RETURN R;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN -1;
    END;`

    try {
        await database.simpleExecute(func);
        await database.simpleExecute(func1);

        // res.status(200).json({message : 'Okay'});
    } catch (err){
        console.log(err);
    }

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