const {validationResult, Result} = require('express-validator');
const database = require('./../services/database');
const oracledb = require('oracledb');

const addSubscription = async (req, res, next) => {
    const {SUB_TYPE,EMAIL, END_DATE} = req.body;

    try {
        database.simpleExecute(
            `INSERT INTO SUBSCRIPTION (SUB_ID,SUB_TYPE,EMAIL,END_DATE)
            VALUES (SUBSCRIPTION_SUB_ID_SEQ.NEXTVAL, :sub_type, :email, :end_date)`, {
                sub_type : SUB_TYPE,
                email: EMAIL,
                end_date : END_DATE,
            }
        )
        res.status(201).json({message: 'Successfully added subscription'});
    } catch(err){
        console.log(err);
        res.status(400).json({message: 'Failed to add subscription to database'});
    }

}

const getSubId = async (req, res, next) =>{
    const email = req.params.email;

    try {
        const result = await database.simpleExecute(
            `SELECT SUB_ID
            FROM SUBSCRIPTION
            WHERE EMAIL = :email`, {
                email : email
            } 
        );
        
        res.status(200).json({sub_id: result.rows[0]});
    } catch (err){
        console.log(err);
        console.log('Cannot get sub_id from database');
        res.status(400).json({message: 'Cannot get sub_id from database'});
    }
}

const getSubscriptions = async (req, res, next) => {
    try {
        const result = await database.simpleExecute(`SELECT * FROM SUBSCRIPTION`);
        
        res.status(200).json({users: result.rows});
    } catch (err){
        console.log(err);
    }
    
}

const updateSubscription = async (req, res, next) => {
    const {SUB_ID, SUB_TYPE} = req.body;

    try {
        database.simpleExecute(
            `UPDATE SUBSCRIPTION 
            SET SUB_TYPE = :sub_type 
            WHERE SUB_ID = :sub_id`, {
                sub_type : SUB_TYPE,
                sub_id : SUB_ID   
            }
        )
        res.status(201).json({message: 'Successfully updated subscription'});
    } catch(err){
        console.log(err);
        res.status(400).json({message: 'Failed to update subscription'});
    }
}

const deleteSubscription = async (req, res, next) => {
    const {SUB_ID} = req.body;

    try {
        database.simpleExecute(
            `DELETE SUBSCRIPTION
            WHERE SUB_ID =:sub_id`, {
                sub_id : SUB_ID   
            }
        )
        res.status(201).json({message: 'Successfully deleted subscription'});
    } catch(err){
        console.log(err);
        res.status(400).json({message: 'Failed to delete subscription'});
    }
}

const isValidSubscription = async (req, res, next) => {
    const sub_id = req.params.sub_id;
    var valid =0;
    try {
        const result = await database.simpleExecute(
            `SELECT * FROM SUBSCRIPTION
             WHERE SUB_ID = :sub_id AND END_DATE < SYSDATE `,{
                 sub_id : sub_id
             });
        
        if(result.rows.length === 0){
            valid=1;
        }else{
            valid=0;
        }

        res.status(200).json({VALID: valid});
    } catch (err){
        console.log(err);
    }
}

exports.getSubscriptions = getSubscriptions;
exports.addSubscription = addSubscription;
exports.updateSubscription = updateSubscription;
exports.deleteSubscription = deleteSubscription;
exports.getSubId = getSubId;
exports.isValidSubscription = isValidSubscription;