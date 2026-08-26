import mongoose from "mongoose";

export interface ISupplier {
  supplierName: string;
  supplierEmail: string;
  supplierAddress: string;
  supplierNumber: string;
  supplierContactPersonName: string;
  supplierContactPersonNumber: string;
}

const supplierSchema = new mongoose.Schema<ISupplier>(
  {
    supplierName: {
      type: String,
      unique: true,
      required: true,
    },
    supplierEmail: {
      type: String,
      unique: false,
      required: true,
      match: [/.+\@.+\..+/, "Please enter a valid email address"],
    },
    supplierAddress: {
      type: String,
      required: true,
    },
    supplierNumber: {
      type: String,
      required: true,
      maxLength: 12,
      match: [/^\d+$/, "Phone number must contain only digits"],
    },
    supplierContactPersonName: {
      type: String,
      unique: true,
      required: true,
    },
    supplierContactPersonNumber: {
      type: String,
      required: true,
      maxLength: 12,
      match: [/^\d+$/, "Contact Person Phone number must contain only digits"],
    },
  },
  { timestamps: true }
);

const Supplier = mongoose.model<ISupplier>("Supplier", supplierSchema);

export default Supplier;
