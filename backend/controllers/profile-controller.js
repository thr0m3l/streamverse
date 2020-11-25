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


exports.getProfile = getProfile;
exports.addProfile = addProfile;
exports.updateProfile = updateProfile;
exports.deleteProfile = deleteProfile;