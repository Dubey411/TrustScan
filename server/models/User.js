import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: false
  },
  displayName: {
    type: String,
    required: false
  },
  plan: {
    type: String,
    enum: ["free", "pro"],
    default: "free"
  },
  credits: {
    type: Number,
    default: 0 // Set to 0 until Deep Scan APIs (Layer 2) are active
  },
  totalScans: {
    type: Number,
    default: 0
  },
  totalThreats: {
    type: Number,
    default: 0
  },
  overallSafetyScore: {

    type: Number,
    default: 100
  },
  lastKnownLocation: {
    city: String,
    state: String,
    country: { type: String, default: "India" }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model("User", userSchema);
export default User;
