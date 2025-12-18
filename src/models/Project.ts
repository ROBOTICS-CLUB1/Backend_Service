import { Schema, model, Document, Types } from "mongoose";
import Tag from "./Tag";

interface IProject {
  title: string;
  content: string;
  author: Types.ObjectId;

  tags: Types.ObjectId[];
  mainTag: Types.ObjectId;

  imageUrl?: string;
  imagePublicId?: string;
}

interface ProjectDocument extends Document, IProject {}

const projectSchema = new Schema<ProjectDocument>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },

    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
        required: true,
      },
    ],

    mainTag: {
      type: Schema.Types.ObjectId,
      ref: "Tag",
      required: true,
    },

    imageUrl: { type: String },
    imagePublicId: { type: String },
  },
  { timestamps: true }
);

projectSchema.pre<ProjectDocument>("validate", async function () {
  const mainTagInTags = this.tags.some((tagId) => tagId.equals(this.mainTag));
  if (!mainTagInTags) {
    throw new Error("mainTag must be included in the tags array");
  }

  const mainTagDoc = await Tag.findById(this.mainTag);

  if (!mainTagDoc) {
    throw new Error("mainTag references a non-existent tag");
  }

  if (mainTagDoc.type !== "SYSTEM") {
    throw new Error("mainTag must be a SYSTEM tag");
  }
});

export default model<ProjectDocument>("Project", projectSchema);
