import mongoose, { type InferSchemaType } from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxLength: 20,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    index: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  findCode: {
    type: String,
    minLength: 6,
    maxLength: 6,
    trim: true,
    uppercase: true,
    unique: true,
    required: true,
    index: true,
  },
  publicProfile: {
    type: Boolean,
    required: false,
    default: true,
  },
  age: {
    type: Number,
    min: 13,
    max: 150,
    required: false,
  },
  gender: {
    type: String,
    required: false,
    enum: ["Male", "Female"],
  },
  aboutMe: {
    type: String,
    required: false,
    minLength: 6,
    default: "Hey ! I am using Chatify App.",
  },
  intrests: {
    type: String,
    required: false,
  },
});

export type UserType = InferSchemaType<typeof UserSchema>;

export const User = mongoose.model<UserType>("USER", UserSchema);
