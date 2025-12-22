import { Schema, model, Types, Document } from "mongoose";

export interface IComment extends Document {
  parent: Types.ObjectId;
  parentModel: "Post" | "Project";
  author: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    parent: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "parentModel",
    },
    parentModel: {
      type: String,
      required: true,
      enum: ["Post", "Project"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

commentSchema.index({ parent: 1, parentModel: 1 });

export default model<IComment>("Comment", commentSchema);
