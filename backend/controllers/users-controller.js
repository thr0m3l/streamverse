const {validationResult} = require('express-validator');
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

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
exports.getMaxProfiles = getMaxProfiles; 