const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  vendorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Vendor", 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  images: [{ 
    url: { type: String },
    name: String,
    size: Number,
  }],
  features: [{ 
    type: String 
  }],
  isAvailable: { 
    type: Boolean, 
    default: true 
  },
}, { timestamps: true });

module.exports = mongoose.model("Product", ProductSchema);
