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

const DUMMY_USERS = [
    {
        id : 'u1',
        name: 'Tanzim Hossain Romel',
        email: 'test@test.com',
        password: 'testers'
    }
]

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
    
    res.json({message: "inside the sign up route"});
    
    const {USER_ID, NAME, EMAIL, DOB, COUNTRY_ID, CREDIT_CARD, PASSWORD} = req.body;

    const users = await connection.execute(
        `SELECT * FROM USER_NETFLIX`,
    ).rows;

    //Finds whether the user already exists
    // const hasUser = users.find( u=> u.EMAIL === EMAIL && u.USER_ID === USER_ID);
    
    // if (hasUser) {
    //     throw new HttpError('User exists', 422); //invalid user input
    // }

    const createdUser = {
        USER_ID, NAME, EMAIL, DOB, COUNTRY_ID, CREDIT_CARD, PASSWORD
    }

    //Inserts into the database

    connection.execute(
        `INSERT INTO USER_NETFLIX (USER_ID, NAME, PASSWORD, EMAIL, DOB, COUNTRY_ID, CREDIT_CARD)
        VALUE (:uid, :name, :pw, :email, :dob, :cid, :cred)`, {
            uid : USER_ID,
            name : NAME,
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
    const {email, password} = req.body;

    const identifiedUser = DUMMY_USERS.find( u => u.email === email);

    if (!identifiedUser || identifiedUser.password !== password){
        throw new HttpError('Wrong credentials', 401) //401 auth failed
    }

    res.json({message: 'logged in!'});
}

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;