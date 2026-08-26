import mongoose from "mongoose";

export interface IHelp {
  helpQuestion: string;
  helpAnswer: string;
}

const helpSchema = new mongoose.Schema<IHelp>(
  {
    helpQuestion: {
      type: String,
      required: true,
    },
    helpAnswer: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Help = mongoose.model<IHelp>("Help", helpSchema);

export default Help;
