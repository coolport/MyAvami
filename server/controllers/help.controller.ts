import type { RequestHandler } from "express";
import Help from "../models/help.model.js";
import { isValidObjectId } from "../utils/validation.js";

export const getHelp: RequestHandler = async (_req, res) => {
  try {
    const helpData = await Help.find({});
    res.status(200).json({ success: true, data: helpData });
  } catch (error) {
    console.error("Error fetching help entries:", (error as Error).message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const hasAllFields = (h: Record<string, unknown>): boolean =>
  Boolean(h.helpQuestion && h.helpAnswer);

export const postHelp: RequestHandler = async (req, res) => {
  const body = req.body;

  if (Array.isArray(body)) {
    if (!body.every((p) => hasAllFields(p))) {
      return res.status(400).json({
        success: false,
        message: "Please provide all fields for every entry",
      });
    }

    try {
      const newHelp = await Help.insertMany(body);
      res.status(201).json({ success: true, data: newHelp });
    } catch (error) {
      console.error("Error in Bulk Create Help:", (error as Error).message);
      res.status(500).json({ success: false, message: "Server error" });
    }
    return;
  }

  if (!hasAllFields(body)) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all fields" });
  }

  try {
    const newHelp = new Help(body);
    await newHelp.save();
    res.status(201).json({ success: true, data: newHelp });
  } catch (error) {
    console.error("Error in Create Help:", (error as Error).message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const putHelp: RequestHandler = async (req, res) => {
  const { id } = req.params as { id: string };
  const help = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "Invalid Help Id" });
  }

  try {
    const updatedHelp = await Help.findByIdAndUpdate(id, help, { new: true });

    if (!updatedHelp) {
      return res
        .status(404)
        .json({ success: false, message: "Help entry not found" });
    }

    res.status(200).json({ success: true, data: updatedHelp });
  } catch (error) {
    console.error("Error in PUTTING Help:", (error as Error).message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteHelp: RequestHandler = async (req, res) => {
  const { id } = req.params as { id: string };

  if (!isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "Invalid Help Id" });
  }

  try {
    const deletedHelp = await Help.findByIdAndDelete(id);

    if (!deletedHelp) {
      return res
        .status(404)
        .json({ success: false, message: "Help entry not found" });
    }

    res.status(200).json({ success: true, message: "Help entry Deleted" });
  } catch (error) {
    console.error("Error deleting help entry:", (error as Error).message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
