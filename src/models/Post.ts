import { Schema, model, Document, Types } from "mongoose";

interface IPost {
  title: string;
  content: string;
  author: string;

  tags: Types.ObjectId[];
  mainTag: Types.ObjectId;

  imageUrl?: string;
  imagePublicId?: string;
}

type PostDocument = Document & IPost;

const postSchema = new Schema<PostDocument>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },

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

postSchema.pre("validate", async function (next) {
  if (!this.tags.some((tagId) => tagId.equals(this.mainTag))) {
    return;
  }

  const Tag = model("Tag");
  const mainTag = await Tag.findById(this.mainTag);

  if (!mainTag || mainTag.type !== "SYSTEM") {
    return;
  }
});

export default model<PostDocument>("Post", postSchema);
