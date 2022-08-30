import { Router } from 'express';
import { login, signup, logout, logoutAll } from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';
import { signupValidator, loginValidator } from '../validators/user';

const router = Router();

router.post('/login', loginValidator, login);

router.post('/signup', signupValidator, signup);

router.post('/logout', authenticateToken, logout);

router.post('/logoutAll', authenticateToken, logoutAll);

export default router;
