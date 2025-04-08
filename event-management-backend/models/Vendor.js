const mongoose = require("mongoose");

const VendorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  category: { type: String, enum: ["Decoration", "Catering", "Lighting", "Event Hall"], required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String }], // Array of image URLs
  status: { type: String, enum: ['pending', 'active', 'suspended'], default: 'pending' },
  
  // Additional profile fields
  ownerName: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  website: { type: String },
  rating: { type: Number, default: 0 },
  reviews: [{ 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rating: Number,
    comment: String,
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Vendor", VendorSchema);
