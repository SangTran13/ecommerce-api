import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// User schema definition
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name is required"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    refreshToken: String,
    refreshTokenExpires: Date,
    phone: {
      type: String,
      trim: true,
    },
    profileImg: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "manager", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password if modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  // Hash the password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // Add 10 second buffer to handle timing edge cases
    return changedTimestamp > JWTTimestamp + 10;
  }
  // If no passwordChangedAt, password was never changed
  return false;
};

// Create and export User model

const User = mongoose.model("User", userSchema);

export default User;
