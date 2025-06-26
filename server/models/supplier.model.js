import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema(
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
      match: [/.+\@.+\..+/, 'Please enter a valid email address']
    },
    supplierAddress: {
      type: String,
      required: true,
    },
    supplierNumber: {
      type: String,
      required: true,
      maxLength: 12,
      match: [/^\d+$/, 'Phone number must contain only digits']
    },
  }, {
  timestamps: true
});

const Supplier = mongoose.model('Supplier', supplierSchema);
export default Supplier;

