/**
 * models/Facility.ts
 *
 * Mongoose model for a hospital or clinic facility.
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFacility extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  type: "hospital" | "clinic" | "diagnostic_centre" | "pharmacy" | "other";
  address?: string;
  phone?: string;
  email?: string;
  registrationNumber?: string;
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FacilitySchema = new Schema<IFacility>(
  {
    name: { type: String, required: true, trim: true, maxlength: 300 },
    type: {
      type: String,
      enum: ["hospital", "clinic", "diagnostic_centre", "pharmacy", "other"],
      required: true,
      default: "hospital",
    },
    address: { type: String, trim: true },
    phone:   { type: String, trim: true },
    email:   { type: String, lowercase: true, trim: true },
    registrationNumber: { type: String, trim: true },
    /** true = synthetic demo facility, not a real institution */
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Facility: Model<IFacility> =
  mongoose.models.Facility ?? mongoose.model<IFacility>("Facility", FacilitySchema);

export default Facility;
