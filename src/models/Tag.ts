import { Schema, model, Document, Types } from "mongoose";

export type TagType = "SYSTEM" | "USER";

interface ITag {
  name: string;
  type: TagType;
  createdBy: Types.ObjectId; //Must be either from a valid system user
}

type TagDocument = Document & ITag;

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
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate semantic tags
tagSchema.index({ name: 1, type: 1 }, { unique: true });

export default model<TagDocument>("Tag", tagSchema);
