import { Router } from 'express';
import {
	getAllUsers,
	getUser,
	followUser,
	unfollowUser,
	getFollowedUsers,
	stripePay,
} from '../controllers/user';
import { authenticateToken } from '../middleware/auth';

export const router = Router();

router.get('/', getAllUsers);

router.post('/payment', authenticateToken, stripePay);

router.get('/:id', getUser);

router.post('/follow/:id', authenticateToken, followUser);

router.post('/unfollow/:id', authenticateToken, unfollowUser);

router.get('/followed/:id', authenticateToken, getFollowedUsers);

export default router;
