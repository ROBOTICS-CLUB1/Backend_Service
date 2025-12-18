import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";

export type UserRole = "user" | "member" | "admin";
export type MembershipStatus = "pending" | "approved" | "rejected" | "expired";

interface IUser {
  username: string;
  email: string;
  password: string;

  role: UserRole;
  membershipStatus: MembershipStatus;

  membershipRequestedAt?: Date;
  membershipReviewedAt?: Date;
}

interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

type UserDocument = Document & IUser & IUserMethods;

const userSchema = new Schema<UserDocument>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "member", "admin"],
      default: "user",
    },

    membershipStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "expired"],
      default: "pending",
    },

    membershipRequestedAt: {
      type: Date,
      default: Date.now,
    },

    membershipReviewedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (this: UserDocument) {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (
  this: UserDocument,
  candidatePassword: string
) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default model<UserDocument>("User", userSchema);
