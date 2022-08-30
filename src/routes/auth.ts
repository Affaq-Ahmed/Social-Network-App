import { Router } from 'express';

const router = Router();

router.post('/login');

router.post('/signup');

router.post('/logout');

router.post('/logoutAll');

export default router;