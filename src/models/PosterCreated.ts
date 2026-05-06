import mongoose, { Model, Schema } from "mongoose";

export type PosterCreatedDocument = {
  posterId: string;
  employeeId: string;
  employeeEmail: string;
  doctorName: string;
  doctorCredentials: string;
  doctorHospital: string;
  doctorCity: string;
  doctorImageUrl: string;
  finalPosterUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

const posterCreatedSchema = new Schema<PosterCreatedDocument>(
  {
    posterId: { type: String, required: true },
    employeeId: { type: String, required: true },
    employeeEmail: { type: String, required: true },
    doctorName: { type: String, required: true },
    doctorCredentials: { type: String, required: true },
    doctorHospital: { type: String, required: true },
    doctorCity: { type: String, required: true },
    doctorImageUrl: { type: String, required: true },
    finalPosterUrl: { type: String },
  },
  { timestamps: true },
);

export const PosterCreatedModel: Model<PosterCreatedDocument> =
  mongoose.models.PosterCreated ||
  mongoose.model<PosterCreatedDocument>("PosterCreated", posterCreatedSchema);
