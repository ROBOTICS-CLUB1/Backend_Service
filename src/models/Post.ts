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

// Pre-save hook: set a default imageUrl based on the mainTag name
postSchema.pre<PostDocument>("save", async function () {
  if (!this.imageUrl || this.imageUrl.trim() === "") {
    const mainTagDoc = await Tag.findById(this.mainTag);
    if (mainTagDoc) {
      const seed = encodeURIComponent(mainTagDoc.name.trim());
      this.imageUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${seed}`;
    }
  }
});

export default model<PostDocument>("Post", postSchema);
