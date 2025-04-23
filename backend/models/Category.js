const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  description: { 
    type: String,
    required: true 
  },
  icon: { 
    type: String,
    default: '🎪'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Category", CategorySchema); 