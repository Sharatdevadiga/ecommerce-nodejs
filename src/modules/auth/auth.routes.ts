import { Router } from 'express';

import { validateRequest } from '../../middlewares/validateRequest';
import { login, logout, refresh, signup } from './auth.controller';
import {
  loginValidator,
  refreshTokenValidator,
  signupValidator,
} from './auth.validators';

const router = Router();

router.post('/signup', signupValidator, validateRequest, signup);
router.post('/login', loginValidator, validateRequest, login);
router.post('/refresh', refreshTokenValidator, validateRequest, refresh);
router.post('/logout', refreshTokenValidator, validateRequest, logout);

export default router;

