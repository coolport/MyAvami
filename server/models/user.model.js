// WIP - modeling documentation is in product model
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
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

