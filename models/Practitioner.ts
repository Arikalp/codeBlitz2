/**
 * models/Practitioner.ts
 *
 * Mongoose model for a doctor or clinical practitioner.
 * Linked to a User (for login) and optionally to a Facility.
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPractitioner extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  facilityId?: mongoose.Types.ObjectId;
  name: string;
  specialty?: string;
  registrationNumber?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PractitionerSchema = new Schema<IPractitioner>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    facilityId: {
      type: Schema.Types.ObjectId,
      ref: "Facility",
    },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    specialty: { type: String, trim: true, maxlength: 100 },
    registrationNumber: { type: String, trim: true },
    phone: { type: String, trim: true },
  },
  { timestamps: true }
);

const Practitioner: Model<IPractitioner> =
  mongoose.models.Practitioner ??
  mongoose.model<IPractitioner>("Practitioner", PractitionerSchema);

export default Practitioner;
