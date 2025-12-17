import { Schema, model, Document } from "mongoose";

interface IPost {
  title: string;
  content: string;
  author: string;
}

type PostDocument = Document & IPost;

const postSchema = new Schema<PostDocument>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
  },
  { timestamps: true }
);


export default model<PostDocument>("Post" , postSchema);