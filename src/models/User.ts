import mongoose, { Model, Schema } from "mongoose";

export type UserDocument = {
  employeeEmail: string;
  employeeCode: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const userSchema = new Schema<UserDocument>(
  {
    employeeEmail: { type: String, required: true, unique: true, lowercase: true },
    employeeCode: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const UserModel: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>("User", userSchema);
