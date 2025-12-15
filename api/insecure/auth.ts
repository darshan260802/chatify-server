import express, { type Request, type Response } from 'express';
import type { CreateUserPayload } from '../helpers/TYPES.ts';
import bcrypt from 'bcrypt';
import { User } from '../../database/models/User.ts';
import { generateFindCode, sendVerificationLink } from '../helpers/helper.ts';
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
    .then(function (user) {
      sendVerificationLink(user._id, email);
      response.status(200).json({ success: true, message: 'Signup success', data: { email: user.email } });
    })
    .catch(function (error) {
      console.error('User Create failed: ', error);
      response.status(500).json({ success: false, message: 'User account create failed!', error: error });
    });
});

// Verify email
router.get('/verify', function (request: Request, response: Response) {
  const { token } = request.query;
  const data = jwt.decode(String(token), { json: true });
  const dayInMS = 86400000;

  if (!data || !data.userId || !data.iat) {
    response.status(400).json({ success: false, message: 'Email Verification failed', error: 'Invalid Token Provided' });
    return;
  }

  if (Date.now() - new Date(data.iat * 1000).getTime() > dayInMS) {
    response.status(400).json({ success: false, message: 'Email Verification Link has been expired!' });
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

// Authenticate User (Login)
router.post('/login', async function (request: Request, response: Response) {
  const { email, password } = request.body as Partial<CreateUserPayload>;

  if (!email || !password) {
    response.status(400).json({ success: false, message: 'Email and Password are required to login' });
    return;
  }
  const user = await User.findOne({ email: email });
  if (!user) {
    response.status(400).json({ success: false, message: 'Login Failed!', error: 'Invalid Email or Password' });
    return;
  }

  if (!user.isVerified) {
    response.status(400).json({ success: false, message: 'Login Failed!', error: 'Email not verified. Please verify your email before logging in.' });
    return;
  }

  const isPasswordMatch = bcrypt.compareSync(password, user.password);
  if (!isPasswordMatch) {
    response.status(400).json({ success: false, message: 'Login Failed!', error: 'Invalid Email or Password' });
    return;
  }

  const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '1d' });
  response.status(200).json({ success: true, message: 'Login Successful', data: { token, user } });
});

export default router;
