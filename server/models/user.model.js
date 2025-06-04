// WIP - modeling documentation is in product model
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      // no native enums in js but mongoose recogs it anyways
      enum: ['admin', 'employee'],
      default: 'employee',
      required: true,
    },
  }, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;

