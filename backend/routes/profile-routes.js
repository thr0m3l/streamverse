const express = require('express');
const {check} = require('express-validator');
const profileController = require('../controllers/profile-controller');
const checkAuth = require('../middleware/check-auth');


const router = express.Router();

//TODO: Add authorization
//router.use(checkAuth);

router.get('/:email', profileController.getProfile);
router.post('/add', profileController.addProfile);
router.patch('/update', profileController.updateProfile);
router.delete('/delete', profileController.deleteProfile);

router.post('/watchlist/find', profileController.hasWatchListed);
router.post('/watchlist/add', profileController.addToWatchList);
router.delete('/watchlist/delete', profileController.deleteWatchList);
router.post('/watchlist/get/', profileController.getWatchList);


router.post('/rating/add', profileController.addRating);
router.post('/rating/find', profileController.findRating);

router.get('/time/get', profileController.getTime);
router.post('/time/set', profileController.setTime);

router.get('/movie/continue', profileController.movieContinueWatching);
router.get('/show/continue', profileController.showContinueWatching);
router.get('/episode/continue', profileController.episodeContinueWatching);
module.exports = router;