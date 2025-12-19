import { User } from "../../database/models/User.ts";
import nodemailer from "nodemailer";
import fs from "node:fs";
import jwt from "jsonwebtoken";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import {Types} from "mongoose";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateFindCode() {
  const corpus = "abcdefghijklmnopqrstuvwxyz0123456789";
  let findCode = "";
  let i = 0;
  while (i < 6) {
    findCode += corpus[Math.floor(Math.random() * 36)];
    i++;
  }
  const isCodeExist = await User.findOne({ findCode: findCode });
  if (isCodeExist) {
    return await generateFindCode();
  }
  return findCode.toUpperCase();
}

const mailSender = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GOOGLE_USER,
    pass: process.env.GOOGLE_PASSWORD,
  },
});

export async function sendVerificationLink(userId: Types.ObjectId, email: string) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || "");
  const verificationLink = process.env.VERIFICATION_URL + "?token=" + token;

  const emailBody = fs.readFileSync(
    path.join(
      __dirname,
      "../",
      "../",
      "resources",
      "templates",
      "email-verification.html"
    ),
    "utf-8"
  );
  const htmlBody = emailBody
    .replace(/\[\[VERIFICATION_LINK\]\]/g, verificationLink)
    .replace(/\[\[CURRENT_YEAR\]\]/g, new Date().getFullYear().toString())
    .replace(/\[\[USER_EMAIL\]\]/g, email)
    .replace(/\[Chatify\]/g, "Chatify");

  return mailSender.sendMail({
    from: `"Chatify Authenticator" <${process.env.GOOGLE_USER}>`,
    to: email,
    subject: "Verify your email to activate your account",
    html: htmlBody,
  });
}
