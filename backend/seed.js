require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Vendor = require("./models/Vendor");
const Product = require("./models/Product");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample data
const users = [
  {
    name: "Admin User",
    email: "admin@gmail.com",
    password: "eventplanner",
    phone: "1234567890",
    role: "admin"
  },
  {
    name: "Vendor User",
    email: "vendor@example.com",
    password: "password123",
    phone: "2345678901",
    role: "vendor"
  },
  {
    name: "Customer User",
    email: "customer@example.com",
    password: "password123",
    phone: "3456789012",
    role: "customer"
  }
];

const vendors = [
  {
    name: "Elegant Events",
    category: "Decoration",
    description: "Premium event decoration services for all occasions",
    price: 1500,
    images: ["decoration1.jpg", "decoration2.jpg"]
  },
  {
    name: "Gourmet Catering",
    category: "Catering",
    description: "Exquisite catering services with a wide range of cuisines",
    price: 2500,
    images: ["catering1.jpg", "catering2.jpg"]
  },
  {
    name: "Sound Masters",
    category: "Lighting",
    description: "Professional sound and lighting services for events",
    price: 1200,
    images: ["lighting1.jpg", "lighting2.jpg"]
  }
];

const products = [
  {
    name: "Basic Decoration Package",
    description: "Simple and elegant decoration for small events",
    price: 500,
    category: "Decoration",
    images: [
      { url: "basic_decoration.jpg", name: "Basic Decoration", size: 1024 }
    ],
    features: ["Basic setup", "Standard decorations", "Setup and cleanup included"]
  },
  {
    name: "Premium Decoration Package",
    description: "Luxurious decoration for medium to large events",
    price: 1200,
    category: "Decoration",
    images: [
      { url: "premium_decoration.jpg", name: "Premium Decoration", size: 1024 }
    ],
    features: ["Premium setup", "Luxury decorations", "Custom themes", "Setup and cleanup included"]
  },
  {
    name: "Standard Catering Package",
    description: "Catering service for up to 50 people",
    price: 1500,
    category: "Catering",
    images: [
      { url: "standard_catering.jpg", name: "Standard Catering", size: 1024 }
    ],
    features: ["Up to 50 people", "3-course meal", "Vegetarian options"]
  },
  {
    name: "Deluxe Catering Package",
    description: "Premium catering service for up to 100 people",
    price: 3000,
    category: "Catering",
    images: [
      { url: "deluxe_catering.jpg", name: "Deluxe Catering", size: 1024 }
    ],
    features: ["Up to 100 people", "5-course meal", "Multiple cuisine options", "Bar service"]
  },
  {
    name: "Basic Lighting Package",
    description: "Professional lighting services for 4 hours",
    price: 800,
    category: "Lighting",
    images: [
      { url: "basic_lighting.jpg", name: "Basic Lighting", size: 1024 }
    ],
    features: ["4 hours service", "Standard lighting setup", "Basic effects"]
  },
  {
    name: "Premium Lighting Package",
    description: "Advanced lighting setup for 3 hours",
    price: 1500,
    category: "Lighting",
    images: [
      { url: "premium_lighting.jpg", name: "Premium Lighting", size: 1024 }
    ],
    features: ["6 hours service", "Advanced lighting setup", "Custom effects", "DJ coordination"]
  }
];

// Seed function
async function seedDatabase() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Vendor.deleteMany({});
    await Product.deleteMany({});

    console.log('Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`Created user: ${savedUser.name}`);
    }

    // Create vendors
    const createdVendors = [];
    for (let i = 0; i < vendors.length; i++) {
      const vendorData = vendors[i];
      const vendor = new Vendor({
        ...vendorData,
        userId: createdUsers[1]._id // Assign to vendor user
      });
      const savedVendor = await vendor.save();
      createdVendors.push(savedVendor);
      console.log(`Created vendor: ${savedVendor.name}`);
    }

    // Create products and assign to vendors
    for (let i = 0; i < products.length; i++) {
      const productData = products[i];
      const vendorIndex = Math.floor(i / 2); // Assign 2 products per vendor
      const product = new Product({
        ...productData,
        vendorId: createdVendors[vendorIndex]._id // Assign to vendor
      });
      const savedProduct = await product.save();
      
      console.log(`Created product: ${savedProduct.name}`);
    }

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
