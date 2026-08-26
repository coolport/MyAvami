import type { RequestHandler } from "express";
import bcrypt from "bcrypt";
import User, { toPublicUser } from "../models/user.model.js";
import { isValidObjectId } from "../utils/validation.js";

const SALT_ROUNDS = 10;

export const getUser: RequestHandler = async (_req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({ success: true, data: users.map(toPublicUser) });
  } catch (error) {
    console.error("Error fetching users:", (error as Error).message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const postUser: RequestHandler = async (req, res) => {
  const { userUsername, userPassword, userFullName, userRole } = req.body;

  if (!userUsername || !userPassword || !userFullName || !userRole) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all fields" });
  }

  try {
    const hashedPassword = await bcrypt.hash(userPassword, SALT_ROUNDS);

    const newUser = new User({
      userUsername,
      userPassword: hashedPassword,
      userFullName,
      userRole,
    });
    await newUser.save();

    res.status(201).json({ success: true, data: toPublicUser(newUser) });
  } catch (error) {
    console.error("Error in Create user:", (error as Error).message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const putUser: RequestHandler = async (req, res) => {
  const { id } = req.params as { id: string };
  const updateData = { ...req.body };

  if (!isValidObjectId(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid user ID format" });
  }

  try {
    if (updateData.userPassword) {
      updateData.userPassword = await bcrypt.hash(
        updateData.userPassword,
        SALT_ROUNDS
      );
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: toPublicUser(updatedUser) });
  } catch (error) {
    console.error("Error updating user:", (error as Error).message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteUser: RequestHandler = async (req, res) => {
  const { id } = req.params as { id: string };

  if (!isValidObjectId(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid user ID format" });
  }

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: toPublicUser(deletedUser),
    });
  } catch (error) {
    console.error("Error deleting user:", (error as Error).message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
