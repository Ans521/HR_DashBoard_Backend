import mongoose from 'mongoose';
import validator from 'validator';
import dotenv from "dotenv";
dotenv.config();

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Character should be at least 2"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Email is required"],
      unique: true,
      validate: [validator.isEmail, "Invalid email format"],
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Password is required"],
      minlength: [4, "Password must be at least 6 characters"],
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
