const express = require('express');
const {check} = require('express-validator');
const subscriptionController = require('../controllers/subscription-controller');
const checkAuth = require('../middleware/check-auth');


const router = express.Router();

//TODO: Add authorization
//router.use(checkAuth);

router.get('/', subscriptionController.getSubscriptions);

router.post('/add', subscriptionController.addSubscription);

//router.patch('/update', profileController.updateProfile);

//router.delete('/delete', profileController.deleteProfile);

module.exports = router;