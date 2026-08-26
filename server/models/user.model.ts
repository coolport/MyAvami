import mongoose, { type HydratedDocument } from "mongoose";

export interface IUser {
  userUsername: string;
  userFullName: string;
  userPassword: string;
  userRole: "admin" | "employee";
}

export interface PublicUser {
  _id: mongoose.Types.ObjectId;
  userUsername: string;
  userFullName: string;
  userRole: "admin" | "employee";
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    userUsername: {
      type: String,
      unique: true,
      required: true,
    },
    userFullName: {
      type: String,
      unique: false,
      required: true,
    },
    userPassword: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee",
      required: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);

/** Strips the password hash before a user document is sent to any client. */
export const toPublicUser = (
  user: HydratedDocument<IUser> & { createdAt?: Date; updatedAt?: Date }
): PublicUser => ({
  _id: user._id,
  userUsername: user.userUsername,
  userFullName: user.userFullName,
  userRole: user.userRole,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export default User;
