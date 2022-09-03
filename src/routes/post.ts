import { Router } from 'express';
import {
	getAllPosts,
	getPost,
	createPost,
	updatePost,
	deletePost,
	getAllPostsByUser,
	getFeed,
} from '../controllers/post';
import { authenticateToken } from '../middleware/auth';
import { createPostValidator, updatePostValidator } from '../validators/post';

export const router = Router();

router.get('/', authenticateToken, getAllPosts);

router.get('/:id', authenticateToken, getPost);

router.post('/', authenticateToken, createPostValidator, createPost);

router.patch('/:id', authenticateToken, updatePostValidator, updatePost);

router.delete('/:id', authenticateToken, deletePost);

router.get('/user/:id', getAllPostsByUser);

router.get('/feed', authenticateToken, getFeed);

export default router;
