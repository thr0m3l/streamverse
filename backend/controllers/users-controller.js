const {validationResult} = require('express-validator');
const HttpError = require('../models/http-error');

//Database
const oracledb = require('oracledb');

oracledb.autoCommit=true;

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

let connection = null;

async function connect_db(){
    try {
        connection = await oracledb.getConnection( {
            user          : "netflix",
            password      : "123",
            connectString : "localhost/orcl"
          });
    } catch (err) {
        console.log(err);
    }
};

connect_db(); //connects to oracle database
//

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
    // const errors = validationResult(req);
    // if(!errors.isEmpty()){
    //     console.log(errors);
    //     res.status(422);
    //     throw new HttpError('Invalid Input', 422);
    // }
    
    
    try {
        const {USER_ID, NAME, EMAIL, DOB, COUNTRY_ID, CREDIT_CARD, PASSWORD} = req.body;

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
    } catch (err) {
        console.log(err);
    }
    
    

    const createdUser = {
        USER_ID, NAME, EMAIL, DOB, COUNTRY_ID, CREDIT_CARD, PASSWORD
    }

    //Inserts into the database

    connection.execute(
        `INSERT INTO USER_NETFLIX (USER_ID, NAME, PASSWORD, EMAIL, DOB, COUNTRY_ID, CREDIT_CARD)
        VALUES (:user_id, :uname, :pw, :email, :dob, :cid, :cred)`, {
            user_id : USER_ID,
            uname : NAME,
            pw : PASSWORD,
            email : EMAIL,
            dob : DOB, 
            cid: COUNTRY_ID, 
            cred: CREDIT_CARD
        }
    );
    res.status(200).json({user: createdUser});
}

const login = async (req, res, next) => {
    const {EMAIL, PASSWORD} = req.body;

    const identifiedUser = await connection.execute(
        `SELECT EMAIL, PASSWORD
        FROM USER_NETFLIX
        WHERE EMAIL = :email AND PASSWORD = :pw`, {
            email : EMAIL,
            pw : PASSWORD
        }
    );

    if (identifiedUser && identifiedUser.rows.length === 0) {
        const error = new HttpError(
            'Login failed',
            422
        );
        return next (error);
    }

    res.status(200).json({message: 'logged in!'});
}

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;