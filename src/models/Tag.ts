import { Schema, model, Document } from "mongoose";

export type TagType = "SYSTEM" | "USER";

export interface ITag {
  name: string;
  type: TagType;
}

export type TagDocument = Document & ITag;

const tagSchema = new Schema<TagDocument>(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["SYSTEM", "USER"],
      required: true,
    },
  },
  { timestamps: true }
);

tagSchema.index({ name: 1, type: 1 }, { unique: true });

export default model<TagDocument>("Tag", tagSchema);
