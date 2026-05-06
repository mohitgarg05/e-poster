import mongoose, { Model, Schema } from "mongoose";

export type PosterLayout = {
  namePosition: { x: number; y: number };
  credentialsPosition: { x: number; y: number };
  hospitalPosition: { x: number; y: number };
  cityPosition: { x: number; y: number };
  doctorImagePosition: { x: number; y: number; width: number; height: number };
};

export type PosterDocument = {
  name: string;
  templateImageUrl: string;
  textColorHex: string;
  isActive: boolean;
  layout: PosterLayout;
  createdAt: Date;
  updatedAt: Date;
};

const posterSchema = new Schema<PosterDocument>(
  {
    name: { type: String, required: true },
    templateImageUrl: { type: String, required: true },
    textColorHex: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    layout: {
      namePosition: { x: Number, y: Number },
      credentialsPosition: { x: Number, y: Number },
      hospitalPosition: { x: Number, y: Number },
      cityPosition: { x: Number, y: Number },
      doctorImagePosition: { x: Number, y: Number, width: Number, height: Number },
    },
  },
  { timestamps: true },
);

export const PosterModel: Model<PosterDocument> =
  mongoose.models.Poster || mongoose.model<PosterDocument>("Poster", posterSchema);
