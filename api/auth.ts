import express, { type Request, type Response } from 'express';
import type { CreateUserPayload } from './TYPES';
import bcrypt from 'bcrypt';
import { User } from '../database/models/User.ts';
import { generateFindCode, sendVerificationLink } from './helper.ts';
import jwt from 'jsonwebtoken';
const router = express.Router();

const SALT = bcrypt.genSaltSync(10);

// Create User (Signup)
router.post('/create', async function (request: Request, response: Response) {
  const { email, name, password } = request.body as CreateUserPayload;
  const validationErrors: Partial<CreateUserPayload> = {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    validationErrors['email'] = 'Invalid or No Email Provided !!';
  }
  if (!name || !name.trim() || name.trim().length < 3) {
    validationErrors['name'] = 'Name must be at least of length 3';
  }
  if (!password || password.trim().length < 8) {
    validationErrors['password'] = 'Password must be at least of 8';
  }
  if (Object.keys(validationErrors).length) {
    response.status(400).json({ success: false, message: 'Validation Failed', error: validationErrors });
    return;
  }

  const isUserExist = await User.findOne({ email: email });
  if (isUserExist) {
    response.status(400).json({
      success: false,
      message: 'User account create failed!',
      error: 'An account with this email already exist. Please login to continue.'
    });
    return;
  }

  const encryptedPassword = bcrypt.hashSync(password, SALT);
  const findCode = await generateFindCode();

  User.create({
    name,
    email,
    password: encryptedPassword,
    findCode
  })
    .then((user) => {
      sendVerificationLink(user._id, email);
      response.status(200).json({ success: true, message: 'Signup success', data: { email: user.email } });
    })
    .catch((error) => {
      console.error('User Create failed: ', error);
      response.status(500).json({ success: false, message: 'User account create failed!', error: error });
    });
});

// Verify email
router.get('/verify', function (request: Request, response: Response) {
  const { token } = request.query;
  const data = jwt.decode(String(token), { json: true });
  if (!data || !data.userId) {
    response.status(400).json({ success: false, message: 'Email Verification failed', error: 'Invalid Token Provided' });
    return;
  }

  User.findByIdAndUpdate(data.userId, { isVerified: true })
    .then(function (user) {
      console.log('User Verified', user?.email);
      response.status(200).json({ success: true, message: 'User Verified Successfully' });
    })
    .catch(function (error) {
      console.error('Verification Failed', error);
      response.status(500).json({ success: false, message: 'User Verification Failed!' });
    });
});

export default router;
