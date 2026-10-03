/**
 * models/User.ts
 *
 * Mongoose model for authentication identity.
 * Stores hashed passwords ONLY — no plaintext ever.
 * Roles: "patient" | "doctor" | "facility_admin"
 *
 * Patient Unique ID (HS-PT-XXXXXX) and internal UUIDs are the authoritative identifiers.
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole = "patient" | "doctor" | "facility_admin";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: {
      type: String,
      required: true,
      // Never send this to the client — select:false prevents accidental exposure
      select: false,
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "facility_admin"],
      required: true,
      default: "patient",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    // Omit passwordHash from all JSON/toObject output by default
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

export default User;
