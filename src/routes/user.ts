import { Router } from 'express';
import {
	getAllUsers,
	getUser,
	followUser,
	unfollowUser,
	getFollowedUsers,
} from '../controllers/user';
import { authenticateToken } from '../middleware/auth';

export const router = Router();

router.get('/', getAllUsers);

router.get('/:id', getUser);

router.post('/:id/follow', authenticateToken, followUser);

router.post('/:id/unfollow', authenticateToken, unfollowUser);

router.get('/:id/followed', authenticateToken, getFollowedUsers);

export default router;