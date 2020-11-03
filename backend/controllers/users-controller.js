const {validationResult} = require('express-validator');
const HttpError = require('../models/http-error');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


//Establishes connection with database

let connection = null;

const oracledb = require('oracledb');

async function connect_db(){
    
    oracledb.autoCommit=true;

    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
    
    
    try {
        connection = await oracledb.getConnection( {
            user          : "netflix",
            password      : "123",
            connectString : "localhost/orcl"
          });

        return connection;
    } catch (err) {
        console.log(err);
    }

    
};

connect_db();


const getUsers = async (req, res, next) => {
    
    try {
        const result = await connection.execute(
            `SELECT * FROM USER_NETFLIX`,
        );
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
        throw new HttpError('Invalid Input', 422);
    }
    
    
    try {
        let {USER_ID, NAME, EMAIL, DOB, COUNTRY_ID, CREDIT_CARD, PASSWORD, PHONE} = req.body;

        const hasUser = await connection.execute(
            `SELECT * 
            FROM USER_NETFLIX
            WHERE EMAIL = :email OR USER_ID = :user_id`, {
            email : EMAIL,
            user_id : USER_ID
        }
        );

        if (hasUser.rows.length !== 0) {
            const error = new HttpError(
                'User exists already, please login instead.',
                422
            );
            return next (error);
        }

        //Hashes the password
        PASSWORD = await bcrypt.hash(PASSWORD, 12);


        //Inserts the newUser to database
        connection.execute(
            `INSERT INTO USER_NETFLIX (USER_ID, NAME, PASSWORD, EMAIL, DOB, COUNTRY_ID, CREDIT_CARD, PHONE)
            VALUES (:user_id, :uname, :pw, :email, :dob, :cid, :cred, :phone)`, {
                user_id : USER_ID,
                uname : NAME,
                pw : PASSWORD,
                email : EMAIL,
                dob : DOB, 
                cid: COUNTRY_ID, 
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
        
        res.status(201).json({USER_ID, EMAIL, token});

    } catch (err) {
        console.log(err);
    }

    
}

const login = async (req, res, next) => {
    let {EMAIL, PASSWORD} = req.body;

    const identifiedUser = await connection.execute(
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



exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;