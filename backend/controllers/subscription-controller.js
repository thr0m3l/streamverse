const {validationResult} = require('express-validator');
const database = require('./../services/database');

const addSubscription = async (req, res, next) => {
    const {SUB_ID,SUB_TYPE,EMAIL, END_DATE} = req.body;

    try {
        database.simpleExecute(
            `INSERT INTO SUBSCRIPTION (SUB_ID,SUB_TYPE,EMAIL,END_DATE)
            VALUES (:sub_id, :sub_type, :email, :end_date)`, {
                sub_id: SUB_ID,
                sub_type : SUB_TYPE,
                email: EMAIL,
                end_date : END_DATE
            }
        )
        res.status(201).json({message: 'Successfully added subscription'});
    } catch(err){
        console.log(err);
        res.status(400).json({message: 'Failed to add subscription to database'});
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


exports.getSubscriptions = getSubscriptions;
exports.addSubscription = addSubscription;
//exports.updateProfile = updateProfile;
//exports.deleteProfile = deleteProfile;