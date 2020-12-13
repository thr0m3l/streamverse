const express = require('express');
const browseController = require('../controllers/browse-controller');
const checkAuth = require('../middleware/check-auth');


const router = express.Router();

//TODO: Add authorization
//router.use(checkAuth);

router.get('/movies/:genre', browseController.getMovieByGenre);
router.get('/shows/:genre', browseController.getShowByGenre);
router.post('/search', browseController.search);
router.get('/show/episodes', browseController.getEpisodes);
router.get('/suggestions', browseController.getSuggestions);

router.get('/similarity', browseController.similarity);
router.get('/new',browseController.newAndPopular);
router.get('/genre', browseController.getGenres);
router.get('/celeb', browseController.getCelebs);
router.get('/similar', browseController.getSimilar);
module.exports = router;