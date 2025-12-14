import express, { type Request, type Response } from "express";
import type { CreateUserPayload } from "./TYPES";
import bcrypt from "bcrypt";
import { User } from "../database/models/User.ts";
import { generateFindCode, sendVerificationLink } from "./helper.ts";
import jwt from 'jsonwebtoken';
const router = express.Router();

const SALT = bcrypt.genSaltSync(10);

// Create User (Signup)
router.post("/create", async function (request: Request, response: Response) {
  const { email, name, password } = request.body as CreateUserPayload;
  const validationErrors: Partial<CreateUserPayload> = {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    validationErrors["email"] = "Invalid or No Email Provided !!";
  }
  if (!name || !name.trim() || name.trim().length < 3) {
    validationErrors["name"] = "Name must be at least of length 3";
  }
  if (!password || password.trim().length < 8) {
    validationErrors["password"] = "Password must be at least of 8";
  }
  if (Object.keys(validationErrors).length) {
    response.status(400).json({ error: validationErrors });
    return;
  }

  const isUserExist = await User.findOne({email: email});
  if(isUserExist){
    response.status(400).json({error: "An account with this email already exist. Please login to continue."});
    return;
  }

  const encryptedPassword = bcrypt.hashSync(password, SALT);
  const findCode = await generateFindCode();


  User.create({
    name,
    email,
    password: encryptedPassword,
    findCode,
  })
    .then((q) => {
      console.log("success", q);
      sendVerificationLink(email)
      response.status(200).json({message: 'Signup success', data: q})
    })
    .catch((e) => {
      console.error("f");
      console.log(e);
    });
});


// Verify email
router.get('/verify', function(request:Request, response:Response){
  const {token} = request.query;
  if(!token){
    response.status(400).json({error: "Invalid Token Provided"});
    return;
  }
  console.log(token);
  const data = jwt.decode(token as string)
  console.log(data);
  
  response.send("ok")
  
})


export default router;
