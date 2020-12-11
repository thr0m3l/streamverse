const {validationResult, Result} = require('express-validator');
const database = require('./../services/database');
const oracledb = require('oracledb');

const addSubscription = async (req, res, next) => {
    const {SUB_TYPE,EMAIL, END_DATE} = req.body;
    const TERMINATION_DATE =END_DATE;
    const RUNNING = 1;
    try {
        database.simpleExecute(
            `UPDATE SUBSCRIPTION
            SET RUNNING = 0, TERMINATION_DATE=SYSDATE, TOTAL_BILL = ROUND( ( MONTHS_BETWEEN(SYSDATE,START_DATE)) *BILL  ,2) 
            WHERE (EMAIL=:email AND RUNNING=1)`, {
                email: EMAIL
            }
        )
    } catch(err){
        console.log(err);
        res.status(400).json({message: 'Failed to add subscription to database'});
    }

    try {
        database.simpleExecute(
            `INSERT INTO SUBSCRIPTION (SUB_ID,SUB_TYPE,EMAIL,END_DATE , TERMINATION_DATE , RUNNING)
            VALUES (SUBSCRIPTION_SUB_ID_SEQ.NEXTVAL, :sub_type, :email, :end_date, :termination_date, :running)`, {
                sub_type : SUB_TYPE,
                email: EMAIL,
                end_date : END_DATE,
                termination_date : TERMINATION_DATE,
                running : RUNNING
            }
        )
        res.status(201).json({message: 'Successfully added subscription'});
    } catch(err){
        console.log(err);
        res.status(400).json({message: 'Failed to add subscription to database'});
    }

}

const getSubId = async (req, res, next) =>{
    const Email = req.params.email;
    const query = `
        BEGIN
            CHECK_VALIDATION( :email );
        END;
        `
    try {
        const result = await database.simpleExecute(query, {
            email : Email
        });
    } catch (err){
        console.log(err);
    }

    try {
        const result = await database.simpleExecute(
            `SELECT SUB_ID
            FROM SUBSCRIPTION
            WHERE EMAIL = :email AND RUNNING=1`, {
                email : Email
            } 
        );
        
        res.status(200).json({sub_id: result.rows[0]});
    } catch (err){
        console.log(err);
        console.log('Cannot get sub_id from database');
        res.status(400).json({message: 'Cannot get sub_id from database'});
    }
}


const getBill = async (req, res, next) =>{
    const subid = req.params.sub_id;

    try {
        const result = await database.simpleExecute(
            `SELECT BILL
            FROM SUBSCRIPTION
            WHERE SUB_ID = :sub_id`, {
                sub_id : subid
            } 
        );
        
        res.status(200).json({bill: result.rows[0]});
    } catch (err){
        console.log(err);
        console.log('Cannot get bill from database');
        res.status(400).json({message: 'Cannot get bill from database'});
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

const getHistory = async (req, res, next) => {
    const EMAIL = req.params.email;
    try {
        const result = await database.simpleExecute(`
            SELECT SUB_TYPE, TO_CHAR(START_DATE,'DD/MM//YYYY') S_DATE,TO_CHAR(TERMINATION_DATE,'DD/MM//YYYY') T_DATE,SUB_TYPE,TOTAL_BILL
            FROM SUBSCRIPTION
            WHERE RUNNING = 0 AND EMAIL = :email 
            ORDER BY TERMINATION_DATE`,{
                email : EMAIL
            });
        
        res.status(200).json({history : result.rows});
    } catch (err){
        console.log(err);
    }
    
}

const updateSubscription = async (req, res, next) => {
    const {SUB_ID, SUB_TYPE,END_DATE} = req.body;

    try {
        database.simpleExecute(
            `UPDATE SUBSCRIPTION 
            SET SUB_TYPE = :sub_type , END_DATE = :end_date
            WHERE SUB_ID = :sub_id`, {
                sub_type : SUB_TYPE,
                end_date : END_DATE,
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
    const {EMAIL} = req.body;

    try {
        database.simpleExecute(
            `UPDATE SUBSCRIPTION
            SET RUNNING =0, TERMINATION_DATE = SYSDATE,TOTAL_BILL = ROUND( ( MONTHS_BETWEEN(SYSDATE,START_DATE)) *BILL  ,2)
            WHERE EMAIL =: email AND RUNNING = 1`, {
                 email : EMAIL   
            }
        )
        database.simpleExecute(
            `DELETE FROM PROFILE
            WHERE EMAIL =: email `, {
                 email : EMAIL   
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
             WHERE SUB_ID = :sub_id AND RUNNING = 0`,{
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

const getplans = async (req, res, next) => {
    try {
        const result = await database.simpleExecute(`SELECT * FROM SUBSCRIPTION_TYPE`);
        
        res.status(200).json({plans: result.rows});
    } catch (err){
        console.log(err);
    }
    
}

const getEndDate = async (req, res, next) => {
    const EMAIL = req.params.email;
    try {
        const result = await database.simpleExecute(`
            SELECT TO_CHAR(END_DATE,'MONTH DD, YYYY') ED
            FROM SUBSCRIPTION
            WHERE RUNNING = 1 AND EMAIL = :email 
            `,{
                email : EMAIL
            });
        
        res.status(200).json({ed : result.rows[0]});
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
exports.getBill = getBill;
exports.getHistory = getHistory;
exports.getplans=getplans;
exports.getEndDate = getEndDate;