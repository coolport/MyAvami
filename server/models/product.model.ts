import mongoose from "mongoose";

export interface IProduct {
  itemName: string;
  itemBrandName: string;
  itemDescription: string;
  itemPrice: number;
  itemExpiration?: Date;
  itemCount: number;
  itemImage: string;
  itemCategory: string;
  supplierIds: mongoose.Types.ObjectId[];
}

const productSchema = new mongoose.Schema<IProduct>(
  {
    itemName: {
      type: String,
      required: true,
    },
    itemBrandName: {
      type: String,
      required: true,
    },
    itemDescription: {
      type: String,
      required: true,
    },
    itemPrice: {
      type: Number,
      required: true,
    },
    itemExpiration: {
      type: Date,
      required: false,
    },
    itemCount: {
      type: Number,
      required: true,
    },
    itemImage: {
      type: String,
      required: true,
    },
    itemCategory: {
      type: String,
      required: true,
    },
    supplierIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;
