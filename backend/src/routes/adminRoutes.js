const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const communityController = require('../controllers/communityController');

// All admin routes require authentication + admin role
router.use(auth);
router.use(authorize('admin'));

// AI Models
router.post('/models', adminController.addModel);
router.get('/models', adminController.getModels);
router.put('/models/:id', adminController.updateModel);
router.delete('/models/:id', adminController.deleteModel);

// Community: Stats
router.get('/community/stats', communityController.adminGetStats);

// Community: Competitions
router.get('/community/competitions', communityController.getCompetitions);
router.post('/community/competitions', communityController.createCompetition);
router.patch('/community/competitions/:id', communityController.adminUpdateCompetition);
router.post('/community/competitions/:id/finalize', communityController.adminFinalizeCompetition);
router.delete('/community/competitions/:id', communityController.adminDeleteCompetition);

// Community: Badges
router.get('/community/badges', communityController.adminGetBadges);
router.post('/community/badges', communityController.adminCreateBadge);
router.put('/community/badges/:id', communityController.adminUpdateBadge);
// Award a badge manually to any user (admin only)
router.post('/community/badges/award', communityController.adminAwardBadge);

// Community: Reward Configs
router.get('/community/rewards', communityController.adminGetRewards);
router.put('/community/rewards/:key', communityController.adminUpdateReward);

// Community: Leaderboard (admin view)
router.get('/community/leaderboard', communityController.getLeaderboard);

// Community: Promotions (admin CRUD)
router.get('/community/promotions', communityController.adminGetPromotions);
router.post('/community/promotions', communityController.adminCreatePromotion);
router.put('/community/promotions/:id', communityController.adminUpdatePromotion);
router.delete('/community/promotions/:id', communityController.adminDeletePromotion);

module.exports = router;
