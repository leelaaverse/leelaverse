const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { auth, optionalAuth, authorize } = require('../middleware/auth');

// ============================================
// PUBLIC / OPTIONAL AUTH ROUTES
// ============================================

// Leaderboard
router.get('/leaderboard', communityController.getLeaderboard);
router.get('/leaderboard/me', auth, communityController.getMyRank);

// Competitions
router.get('/competitions', communityController.getCompetitions);
router.get('/competitions/:id', optionalAuth, communityController.getCompetitionDetails);
router.get('/competitions/:id/submissions', communityController.getSubmissions);

// Templates
router.get('/templates', communityController.getTemplates);
router.get('/templates/:id', communityController.getTemplateDetails);

// Badges
router.get('/badges', communityController.getAllBadges);
router.get('/badges/my', auth, communityController.getMyBadges);
router.post('/badges/sync', auth, communityController.syncMyBadges);

// Promotions (public — returns only active, scheduled promos)
router.get('/promotions', communityController.getActivePromotions);

// ============================================
// AUTHENTICATED ROUTES
// ============================================

// Competitions (user actions)
router.post('/competitions', auth, communityController.createCompetition);
router.post('/competitions/:id/join', auth, communityController.joinCompetition);
router.post('/competitions/:id/submit', auth, communityController.submitEntry);
router.post('/competitions/:id/vote/:submissionId', auth, communityController.voteSubmission);

// Templates (user actions)
router.post('/templates', auth, communityController.createTemplate);
router.post('/templates/:id/use', auth, communityController.useTemplate);
router.post('/templates/:id/rate', auth, communityController.rateTemplate);

module.exports = router;
