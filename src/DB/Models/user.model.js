import mongoose, { Schema } from "mongoose";
export const RoleUser = {
  admin: "admin",
  user: "user",
};
export const GenderUser = {
  male: "male",
  female: "female",
};
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true,minLength: 3, maxLength: 20 },
    email: { type: String, required: true, unique: true,trim: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(RoleUser),
      default: RoleUser.user,
    },
    gender: {
      type: String,
      enum: Object.values(GenderUser),
      default: GenderUser.male,
    },
    conFirmed:{
      type: Boolean,
      default: false,
    },
    age: { type: Number, required: true, min: 1, max: 120 },
    image:  String , // Optional field for user image
    phone: { type: String, required: true, unique: true },
    otp:{
      type: String,
      default: null,
    }
  },
  {
    timestamps: true,
  }
);
const userModel = mongoose.model("Users", userSchema);
export default userModel;
