const {validationResult, Result} = require('express-validator');
const HttpError = require('../models/http-error');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const database = require('./../services/database');

const getUsers = async (req, res, next) => {
    
    try {
        const result = await database.simpleExecute(`SELECT * FROM USER_NETFLIX`);
        
        res.status(200).json({users: result.rows});
    } catch (err){
        console.log(err);
    }
}

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
        res.status(422);
        const error = new HttpError('Invalid Input', 422);
        return next(error);
    }
    
    let {NAME, EMAIL, DOB, COUNTRY, CREDIT_CARD, PASSWORD, PHONE} = req.body;
    
    try {
        

        const hasUser = await database.simpleExecute(
            `SELECT * 
            FROM USER_NETFLIX
            WHERE EMAIL = :email`, {
            email : EMAIL
            }
        );

        if (hasUser.rows.length !== 0) {
            const error = new HttpError(
                'User exists already, please login instead.',
                423
            );
            return next (error);
        }


    } catch (err) {
        console.log(err);
    }

    try {
        //Hashes the password
        PASSWORD = await bcrypt.hash(PASSWORD, 12);

        //Inserts the newUser to database
        
        await database.simpleExecute(
            `INSERT INTO USER_NETFLIX (NAME, PASSWORD, EMAIL, DOB, COUNTRY, CREDIT_CARD, PHONE)
            VALUES (:uname, :pw, :email, :dob, :cid, :cred, :phone)`, {
                uname : NAME,
                pw : PASSWORD,
                email : EMAIL,
                dob : DOB, 
                cid: COUNTRY, 
                cred: CREDIT_CARD,
                phone : PHONE
            }
        );
        
        
        //Generates token for successful user login
        //Which is used to authorize
        //Expires in 1hr

        let token;
        token = jwt.sign(
            {EMAIL}, 
            'supersecret_dont_share',
             {expiresIn : '1h'}
             );
        
        res.status(201).json({EMAIL, token});
    } catch(err){
        const error = new HttpError(err, 424);
        next(error);
        console.log(err);
    }

    
}

const login = async (req, res, next) => {
    let {EMAIL, PASSWORD} = req.body;

    const identifiedUser = await database.simpleExecute(
        `SELECT PASSWORD
        FROM USER_NETFLIX
        WHERE EMAIL = :email`, {
            email : EMAIL
        }
    );

    if (identifiedUser && identifiedUser.rows.length === 0) {
        const error = new HttpError(
            'User does not exist. Please sign up instead',
            422
        );
        return next (error);
    }
   
    const {PASSWORD : hashedPassword} = identifiedUser.rows[0];
    if (await bcrypt.compare(PASSWORD, hashedPassword)) {
        let token;
        token = jwt.sign(
            {EMAIL}, 
            'supersecret_dont_share',
             {expiresIn : '1h'}
             );
        
        res.status(201).json({EMAIL, token});
        
    } else {
        const error = new HttpError(
            'Incorrect Password',
            423
        );
        return next (error);
    } 
    
}

const getMaxProfiles = async (req, res, next) => {
    const EMAIL = req.params.email;
    try {
        const result = await database.simpleExecute(`
        SELECT MAX_PROFILES
         FROM USER_NETFLIX
         WHERE EMAIL = :email`,{
             email : EMAIL
         });
        
        res.status(200).json({mp: result.rows[0]});
    } catch (err){
        console.log(err);
    }
}

const updatePhone = async (req, res, next) => {
    const {EMAIL,Phone} = req.body;
    try {
        const result = await database.simpleExecute(`
        UPDATE USER_NETFLIX
        SET PHONE = :phone
        WHERE EMAIL = :email`,{
             email : EMAIL,
             phone : Phone
         });
        
         res.status(201).json({message: 'Successfully updated phone'});
    } catch (err){
        console.log(err);
    }
}

const getPhone = async (req, res, next) => {
    const EMAIL = req.params.email;
    try {
        const result = await database.simpleExecute(`
        SELECT PHONE FROM USER_NETFLIX
        WHERE EMAIL = :email`,{
             email : EMAIL
         });
        
         res.status(200).json({phone: result.rows[0]});
    } catch (err){
        console.log(err);
    }
}

const updatePassword = async (req, res, next) => {
    const {EMAIL,OLD_PASS,NEW_PASS,NEW_PASS_CON} = req.body;
    
    if(NEW_PASS!==NEW_PASS_CON){
        const error = new HttpError(
            'New passwords don\'t match',
            422
        );
        return next (error);
    }
    else{
        try {
            const result = await database.simpleExecute(`
            SELECT PASSWORD FROM USER_NETFLIX
            WHERE EMAIL = :email`,{
                 email : EMAIL
             });
             console.log("result here",result.rows[0]);
             const {PASSWORD : hashedPassword} = result.rows[0];
            if (await bcrypt.compare(OLD_PASS, hashedPassword)) {
                
                const PASSWORD2 = await bcrypt.hash(NEW_PASS, 12);
                const result2 = await database.simpleExecute(`
                UPDATE USER_NETFLIX
                SET PASSWORD = :pw
                WHERE EMAIL = :email`,{
                    email : EMAIL,
                    pw : PASSWORD2
                });

                res.status(201).json({message : 'password updated successfully'});
            } else {
                const error = new HttpError(
                    'Incorrect Password',
                    423
                );
                return next (error);
            }
        } catch (err){
            console.log(err);
        }
    }
}

const getMovieWatchHistory = async (req, res, next) => {
    const EMAIL = req.params.email;
    const PROF_ID = req.params.prof_id;
    try {
        const result = await database.simpleExecute(`
        SELECT MW.RATING,MW.WATCHED_UPTO,M.TITLE,MW.TIME,M.IMAGE_URL
        FROM MOVIE_WATCH MW
        JOIN MOVIE M ON M.MOVIE_ID=MW.MOVIE_ID
        WHERE MW.EMAIL = :email AND MW.PROFILE_ID = :prof_id
        ORDER BY MW.TIME DESC`,{
             email : EMAIL,
             prof_id : PROF_ID
         });
        
        res.status(200).json({history: result.rows});
    } catch (err){
        console.log(err);
    }
}

const getMovieWatchHistory2 = async (req, res, next) => {
    const EMAIL = req.params.email;
    try {
        const result = await database.simpleExecute(`
        SELECT MW.RATING,MW.WATCHED_UPTO,M.TITLE,MW.TIME,M.IMAGE_URL,MW.PROFILE_ID PID
        FROM MOVIE_WATCH MW
        JOIN MOVIE M ON M.MOVIE_ID=MW.MOVIE_ID
        WHERE MW.EMAIL = :email 
        ORDER BY MW.TIME DESC`,{
             email : EMAIL
         });
        
        res.status(200).json({history: result.rows});
    } catch (err){
        console.log(err);
    }
}

const getShowWatchHistory = async (req, res, next) => {
    const EMAIL = req.params.email;
    const PROF_ID = req.params.prof_id;
    try {
        const result = await database.simpleExecute(`
        SELECT S.TITLE,S.RATING,E.SEASON_NO,E.EPISODE_NO,E.WATCHED_UPTO
        FROM EPISODE_WATCH E
        JOIN SHOW S ON S.SHOW_ID = E.SHOW_ID 
        WHERE E.EMAIL =  :email AND E.PROFILE_ID = :prof_id`,{
             email : EMAIL,
             prof_id : PROF_ID
         });
        
        res.status(200).json({history: result.rows});
    } catch (err){
        console.log(err);
    }
}

const getShowWatchHistory2 = async (req, res, next) => {
    const EMAIL = req.params.email;
    try {
        const result = await database.simpleExecute(`
        SELECT S.TITLE,S.RATING,E.SEASON_NO,E.EPISODE_NO,E.WATCHED_UPTO,E.PROFILE_ID PID
        FROM EPISODE_WATCH E
        JOIN SHOW S ON S.SHOW_ID = E.SHOW_ID 
        WHERE E.EMAIL =  :email`,{
             email : EMAIL
         });
        
        res.status(200).json({history: result.rows});
    } catch (err){
        console.log(err);
    }
}

const getNumProfiles = async (req, res, next) => {
    const EMAIL = req.params.email;
    try {
        const result = await database.simpleExecute(`
        SELECT COUNT(*) C 
         FROM PROFILE
         WHERE EMAIL = :email`,{
             email : EMAIL
         });
        
        res.status(200).json({C: result.rows[0]});
    } catch (err){
        console.log(err);
    }
}

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
exports.getMaxProfiles = getMaxProfiles; 
exports.updatePhone = updatePhone;
exports.getPhone = getPhone;
exports.updatePassword = updatePassword;
exports.getMovieWatchHistory = getMovieWatchHistory;
exports.getMovieWatchHistory2 = getMovieWatchHistory2;
exports.getShowWatchHistory = getShowWatchHistory;
exports.getShowWatchHistory2 = getShowWatchHistory2;
exports.getNumProfiles = getNumProfiles;