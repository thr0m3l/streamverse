const express = require('express');
const {check} = require('express-validator');
const usersController = require ('./../controllers/users-controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/', usersController.getUsers);

router.post('/signup', [
    check('NAME').isLength({ min: 3 },
        check('EMAIL').normalizeEmail().isEmail())
  ], usersController.signup);

router.post('/login', usersController.login);

router.get('/maxprofiles/:email', usersController.getMaxProfiles);

router.get('/numprofiles/:email', usersController.getNumProfiles);

router.patch('/updatephone',usersController.updatePhone);

router.get('/getphone/:email', usersController.getPhone);

router.patch('/updatepassword', usersController.updatePassword);

router.get('/getmoviehistory/:email/:prof_id', usersController.getMovieWatchHistory);

router.get('/getmoviehistory/:email', usersController.getMovieWatchHistory2);

router.get('/getshowhistory/:email/:prof_id', usersController.getShowWatchHistory);

router.get('/getshowhistory/:email', usersController.getShowWatchHistory2);

router.use(checkAuth);

module.exports = router;