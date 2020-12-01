const express = require('express');
const browseController = require('../controllers/browse-controller');
const checkAuth = require('../middleware/check-auth');


const router = express.Router();

//TODO: Add authorization
//router.use(checkAuth);

router.get('/movies/:genre', browseController.getMovieByGenre);
router.get('/shows/:genre', browseController.getShowByGenre);
router.get('/search/:kw', browseController.search);
router.get('/shows/episodes/:show_id', browseController.getEpisodes);
router.get('/suggestions', browseController.getSuggestions);

module.exports = router;