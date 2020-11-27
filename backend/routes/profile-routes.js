const express = require('express');
const {check} = require('express-validator');
const profileController = require('../controllers/profile-controller');
const checkAuth = require('../middleware/check-auth');


const router = express.Router();

//TODO: Add authorization
//router.use(checkAuth);

router.get('/:email', profileController.getProfile);

router.post('/watchlist/find', profileController.hasWatchListed);

router.post('/watchlist/add', profileController.addToWatchList);

router.post('/add', profileController.addProfile);

router.patch('/update', profileController.updateProfile);

router.delete('/delete', profileController.deleteProfile);

module.exports = router;