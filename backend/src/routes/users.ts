import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import {
  updateProfileSchema,
  changePasswordSchema,
  paginationSchema,
} from '../middleware/schemas';

const router = Router();

// @route   GET /api/users/profile/:id
// @desc    Get user profile
// @access  Public
router.get('/profile/:id', (_req, res) => {
  res.json({ message: 'Get user profile - not implemented yet' });
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, validateRequest(updateProfileSchema), (_req, res) => {
  res.json({ message: 'Update profile - not implemented yet' });
});

// @route   POST /api/users/change-password
// @desc    Change password
// @access  Private
router.post('/change-password', authenticate, validateRequest(changePasswordSchema), (_req, res) => {
  res.json({ message: 'Change password - not implemented yet' });
});

// @route   POST /api/users/follow/:id
// @desc    Follow user
// @access  Private
router.post('/follow/:id', authenticate, (_req, res) => {
  res.json({ message: 'Follow user - not implemented yet' });
});

// @route   DELETE /api/users/follow/:id
// @desc    Unfollow user
// @access  Private
router.delete('/follow/:id', authenticate, (_req, res) => {
  res.json({ message: 'Unfollow user - not implemented yet' });
});

// @route   GET /api/users/:id/followers
// @desc    Get user followers
// @access  Public
router.get('/:id/followers', validateRequest(paginationSchema), (_req, res) => {
  res.json({ message: 'Get followers - not implemented yet' });
});

// @route   GET /api/users/:id/following
// @desc    Get user following
// @access  Public
router.get('/:id/following', validateRequest(paginationSchema), (_req, res) => {
  res.json({ message: 'Get following - not implemented yet' });
});

export default router;
