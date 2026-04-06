const express = require('express');
const router = express.Router();
const SearchController = require('../controllers/searchController');

// Define search routes
router.get('/suggestions', SearchController.getSuggestions);
router.get('/', SearchController.searchAll);
router.get('/trending', SearchController.getTrending);

module.exports = router;
