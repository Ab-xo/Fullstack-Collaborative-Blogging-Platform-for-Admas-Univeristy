import express from 'express';
import { googleLogin, googleRegister } from '../controllers/firebaseAuthController.js';

const router = express.Router();

// Google authentication routes
router.post('/google-login', googleLogin);
router.post('/google-register', googleRegister);

export default router;
