import { Schema, model, Document, Types } from "mongoose";
import Tag from "./Tag";

interface IPost {
  title: string;
  content: string;
  author: Types.ObjectId;

  tags: Types.ObjectId[];
  mainTag: Types.ObjectId;

  imageUrl?: string;
  imagePublicId?: string;
}

interface PostDocument extends Document, IPost {}

const postSchema = new Schema<PostDocument>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Fixed to ObjectId for consistency

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

postSchema.pre<PostDocument>("validate", async function () {
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

export default model<PostDocument>("Post", postSchema);
