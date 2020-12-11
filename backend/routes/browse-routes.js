const express = require('express');
const browseController = require('../controllers/browse-controller');
const checkAuth = require('../middleware/check-auth');


const router = express.Router();

//TODO: Add authorization
//router.use(checkAuth);

router.get('/movies/:genre', browseController.getMovieByGenre);
router.get('/shows/:genre', browseController.getShowByGenre);
router.get('/search', browseController.search);
router.get('/show/episodes', browseController.getEpisodes);
router.get('/suggestions', browseController.getSuggestions);

router.get('/similarity', browseController.similarity);
router.get('/new',browseController.newAndPopular);
module.exports = router;