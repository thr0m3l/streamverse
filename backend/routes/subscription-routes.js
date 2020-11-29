const express = require('express');
const {check} = require('express-validator');
const subscriptionController = require('../controllers/subscription-controller');
const checkAuth = require('../middleware/check-auth');


const router = express.Router();

//TODO: Add authorization
//router.use(checkAuth);

router.get('/', subscriptionController.getSubscriptions);

router.get('/subid/:email', subscriptionController.getSubId);

router.post('/add', subscriptionController.addSubscription);

router.patch('/update', subscriptionController.updateSubscription);

router.delete('/delete', subscriptionController.deleteSubscription);

module.exports = router;