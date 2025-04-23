require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Vendor = require("./models/Vendor");
const Product = require("./models/Product");
const Booking = require("./models/Booking");
const auth = require("./middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require('fs');
const Category = require("./models/Category");

const app = express();

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5174',
      'http://192.168.160.1:5174',
      'http://192.168.88.1:5174',
      'http://192.168.42.26:5174'
    ];
    
    if(allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

// Add cookie-parser middleware
app.use(require('cookie-parser')());

app.use(express.json());

// Serve static files from uploads directory with proper CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Cache-Control', 'public, max-age=31557600'); // Cache for 1 year
  
  // Clean up the URL by removing any HTML attributes or query parameters
  const cleanPath = req.path.split('"')[0].split('?')[0];
  req.url = cleanPath;
  
  next();
}, express.static(path.join(__dirname, 'uploads'), {
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Set content type for images
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.set('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.png')) {
      res.set('Content-Type', 'image/png');
    } else if (path.endsWith('.gif')) {
      res.set('Content-Type', 'image/gif');
    }
  },
  fallthrough: false // Return 404 for missing files instead of falling through
}));

// Error handler for static files
app.use('/uploads', (err, req, res, next) => {
  console.error('Error serving static file:', err);
  res.status(404).json({ message: 'Image not found' });
});

// Add base URL to response
app.use((req, res, next) => {
  req.baseUrl = `${req.protocol}://${req.get('host')}`;
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Event Management System API is running' });
});

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
}

// User Registration
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role.toLowerCase()
    });

    // Save user to database
    await newUser.save();

    // If the user is registering as a vendor, create a vendor profile
    if (role.toLowerCase() === 'vendor') {
      const newVendor = new Vendor({
        userId: newUser._id,
        name: name,
        category: "Decoration", // Default category, can be updated later
        description: "New vendor offering services", // Default description
        price: 0, // Default price, can be updated later
        ownerName: name,
        email: email,
        phone: phone,
        address: "",
        website: "",
        profileImage: "Logo.jpg" // Set default profile image
      });
      
      await newVendor.save();
      console.log(`Created vendor profile for user ${newUser._id}`);
    }

    // Create JWT token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return success with token and user data
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error("Error in /register:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login endpoint
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Set cookie with proper options
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    
    // Send user data and token
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Validate token endpoint
app.get("/validate", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Token validation error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile
app.put("/users/profile", auth, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    // Find user by ID
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is being changed and if it's already in use
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    // Save the updated user
    await user.save();

    // Return updated user data
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
});

// Logout endpoint
app.post("/logout", auth, async (req, res) => {
  try {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add Vendor Service
app.post("/vendor/add", auth, async (req, res) => {
  try {
    if (req.user.role !== "vendor") return res.status(403).json({ message: "Access denied" });

    const { name, category, description, price, images } = req.body;
    const newVendor = new Vendor({
      userId: req.user.id,
      name,
      category,
      description,
      price,
      images,
    });

    await newVendor.save();
    res.status(201).json({ message: "Service added successfully" });
  } catch (error) {
    console.error("Error in /vendor/add:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get All Vendor Services
app.get("/vendor/all", async (req, res) => {
  try {
    const vendors = await Vendor.find();
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update Vendor Service
app.put("/vendor/:id", auth, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: "Service not found" });

    if (vendor.userId.toString() !== req.user.id) return res.status(403).json({ message: "Unauthorized" });

    await Vendor.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Service updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete Vendor Service
app.delete("/vendor/:id", auth, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: "Service not found" });

    if (vendor.userId.toString() !== req.user.id) return res.status(403).json({ message: "Unauthorized" });

    await Vendor.findByIdAndDelete(req.params.id);
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Vendor Routes
app.get('/vendors', async (req, res) => {
  try {
    const vendors = await Vendor.find();
    
    // Transform vendors to include full URLs for images
    const transformedVendors = vendors.map(vendor => {
      const vendorObj = vendor.toObject();
      
      console.log('Processing vendor:', {
        id: vendorObj._id,
        name: vendorObj.name,
        originalProfileImage: vendorObj.profileImage
      });
      
      // Add full URL for profile image if it exists
      if (vendorObj.profileImage) {
        // Clean up the URL by removing any HTML attributes or query parameters
        const cleanPath = vendorObj.profileImage.split('"')[0].split('?')[0];
        // Ensure the path starts with /uploads/
        vendorObj.profileImage = cleanPath.startsWith('/uploads/') ? cleanPath : `/uploads/${cleanPath}`;
        
        console.log('Processed profile image:', {
          vendorId: vendorObj._id,
          originalPath: cleanPath,
          finalUrl: vendorObj.profileImage
        });
      } else {
        // Set default profile image
        vendorObj.profileImage = '/uploads/Logo.jpg';
      }
      
      // Add full URLs for other images if they exist
      if (vendorObj.images && vendorObj.images.length > 0) {
        vendorObj.images = vendorObj.images.map(image => {
          if (typeof image === 'string') {
            const cleanPath = image.split('"')[0].split('?')[0];
            return `/uploads/${cleanPath}`;
          }
          if (image.url) {
            const cleanPath = image.url.split('"')[0].split('?')[0];
            return {
              ...image,
              url: `/uploads/${cleanPath}`
            };
          }
          return image;
        });
      }
      
      return vendorObj;
    });
    
    // Log the vendors for debugging
    console.log("Found vendors with transformed images:", 
      transformedVendors.map(v => ({
        id: v._id,
        name: v.name,
        profileImage: v.profileImage
      }))
    );
    
    res.json(transformedVendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ message: "Error fetching vendors", error: error.message });
  }
});

// Get vendor profile
app.get('/vendors/profile', auth, async (req, res) => {
  try {
    let vendor = await Vendor.findOne({ userId: req.user.id });
    
    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    // Convert vendor to a plain object so we can modify it
    const vendorData = vendor.toObject();
    
    // Add full URL for profile image if it exists
    if (vendorData.profileImage) {
      vendorData.profileImage = `${req.protocol}://${req.get('host')}/uploads/${vendorData.profileImage}`;
    }
    
    res.json(vendorData);
  } catch (error) {
    console.error("Error fetching vendor profile:", error);
    res.status(500).json({ message: "Error fetching vendor profile", error: error.message });
  }
});

// Get vendor by ID
app.get('/vendors/:id', async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid vendor ID format:', req.params.id);
      return res.status(400).json({ message: "Invalid vendor ID format" });
    }

    console.log('Fetching vendor with ID:', req.params.id);
    const vendor = await Vendor.findById(req.params.id);
    
    if (!vendor) {
      console.log('Vendor not found for ID:', req.params.id);
      return res.status(404).json({ message: "Vendor not found" });
    }
    
    console.log('Found vendor:', vendor);
    
    // Get products associated with this vendor
    console.log('Fetching products for vendor:', vendor._id);
    const products = await Product.find({ vendorId: vendor._id });
    console.log('Found products:', products);
    
    // Create a response object with vendor details and products
    const vendorWithProducts = {
      ...vendor.toObject(),
      products: products
    };
    
    // Log for debugging
    console.log(`Found ${products.length} products for vendor ${vendor._id}`);
    
    res.json(vendorWithProducts);
  } catch (error) {
    console.error("Error fetching vendor:", error);
    res.status(500).json({ message: "Error fetching vendor", error: error.message });
  }
});

app.put('/vendors/profile', auth, async (req, res) => {
  try {
    const { name, ownerName, email, phone, address, description, website, category } = req.body;
    
    let vendor = await Vendor.findOne({ userId: req.user.id });
    
    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }
    
    vendor.name = name || vendor.name;
    vendor.ownerName = ownerName || vendor.ownerName;
    vendor.email = email || vendor.email;
    vendor.phone = phone || vendor.phone;
    vendor.address = address || vendor.address;
    vendor.description = description || vendor.description;
    vendor.website = website || vendor.website;
    if (category) vendor.category = category;
    
    await vendor.save();
    
    res.json(vendor);
  } catch (error) {
    console.error("Error updating vendor profile:", error);
    res.status(500).json({ message: "Error updating vendor profile", error: error.message });
  }
});

// Update vendor profile image
app.put('/vendors/profile/image', auth, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    console.log('Processing profile image upload:', {
      userId: req.user.id,
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });

    let vendor = await Vendor.findOne({ userId: req.user.id });
    
    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    console.log('Found vendor:', {
      vendorId: vendor._id,
      currentProfileImage: vendor.profileImage
    });

    // Delete old profile image if it exists
    if (vendor.profileImage) {
      const oldImagePath = path.join(__dirname, 'uploads', vendor.profileImage);
      console.log('Attempting to delete old profile image:', oldImagePath);
      
      if (fs.existsSync(oldImagePath)) {
        try {
          fs.unlinkSync(oldImagePath);
          console.log('Successfully deleted old profile image');
        } catch (err) {
          console.error('Error deleting old profile image:', err);
        }
      } else {
        console.log('Old profile image file not found');
      }
    }

    // Update the profile image with just the filename
    vendor.profileImage = req.file.filename;
    await vendor.save();
    
    // Construct the image URL
    const imageUrl = `/uploads/${req.file.filename}`;
    
    console.log('Updated vendor profile:', {
      vendorId: vendor._id,
      newFilename: req.file.filename,
      imageUrl: imageUrl
    });
    
    res.json({ 
      message: "Profile image updated successfully",
      profileImage: req.file.filename,
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error("Error updating profile image:", error);
    res.status(500).json({ message: "Error updating profile image", error: error.message });
  }
});

// Product Routes
app.post("/products", auth, upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, category, features, isAvailable } = req.body;
    
    // Log received data for debugging
    console.log("Received product data:", {
      name,
      description,
      price,
      category,
      features: features || '[]',
      isAvailable,
      files: req.files ? req.files.length : 0
    });
    
    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({ 
        message: "Missing required fields", 
        details: {
          name: !name ? "Name is required" : null,
          description: !description ? "Description is required" : null,
          price: !price ? "Price is required" : null,
          category: !category ? "Category is required" : null
        }
      });
    }

    // Get category details
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({ message: "Invalid category" });
    }

    // Process images if any
    const images = req.files && req.files.length > 0 
      ? req.files.map(file => ({
          url: `/uploads/${file.filename}`,
          name: file.originalname,
          size: file.size
        }))
      : [];

    // Find the vendor associated with this user
    const vendor = await Vendor.findOne({ userId: req.user.id });
    
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const product = new Product({
      vendorId: vendor._id,
      name,
      description,
      price: Number(price),
      category: categoryDoc.name, // Use the category name from the document
      features: features ? JSON.parse(features) : [],
      images,
      isAvailable: isAvailable === 'true'
    });

    await product.save();
    
    // Log for debugging
    console.log(`Created product with ID ${product._id} for vendor ${vendor._id}`);
    
    res.status(201).json(product);
  } catch (error) {
    console.error("Error in /products:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/products", async (req, res) => {
  try {
    const { 
      vendorId, 
      category, 
      search, 
      minPrice, 
      maxPrice, 
      sort = 'rating',
      page = 1,
      limit = 9
    } = req.query;
    
    const query = {};
    
    // Vendor filter - handle both userId and vendorId
    if (vendorId) {
      console.log('Looking for vendor with ID:', vendorId);
      
      // First try to find vendor by userId
      const vendor = await Vendor.findOne({ userId: vendorId });
      if (vendor) {
        console.log('Found vendor by userId:', vendor._id);
        query.vendorId = vendor._id;
      } else {
        // If not found by userId, try direct vendorId
        const vendorById = await Vendor.findById(vendorId);
        if (vendorById) {
          console.log('Found vendor by vendorId:', vendorById._id);
          query.vendorId = vendorById._id;
        } else {
          console.log('No vendor found with ID:', vendorId);
          // If no vendor found, return empty result
          return res.json({
            products: [],
            total: 0,
            totalPages: 0,
            currentPage: 1,
            hasMore: false
          });
        }
      }
    }
    
    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Build sort options
    let sortOptions = {};
    switch (sort) {
      case 'price_asc':
        sortOptions.price = 1;
        break;
      case 'price_desc':
        sortOptions.price = -1;
        break;
      case 'newest':
        sortOptions.createdAt = -1;
        break;
      case 'rating':
      default:
        sortOptions.rating = -1;
        break;
    }
    
    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Execute query with pagination and sorting
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit))
        .populate('vendorId', 'name location')
        .lean(),
      Product.countDocuments(query)
    ]);
    
    // Calculate total pages
    const totalPages = Math.ceil(total / Number(limit));
    
    // Log for debugging
    console.log('Products query:', {
      query,
      productsFound: products.length,
      total,
      totalPages
    });
    
    // Send response
    res.json({
      products,
      total,
      totalPages,
      currentPage: Number(page),
      hasMore: page < totalPages
    });
    
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.put("/products/:id", auth, upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, category, features, isAvailable, existingImages } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });
    
    // Find the vendor associated with the current user
    const vendor = await Vendor.findOne({ userId: req.user.id });
    
    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }
    
    // Log for debugging
    console.log('Auth check:', { 
      vendorId: vendor._id.toString(),
      productVendorId: product.vendorId.toString(),
      userId: req.user.id
    });
    
    // Check if the product belongs to this vendor
    if (product.vendorId.toString() !== vendor._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const images = [
      ...JSON.parse(existingImages || '[]'),
      ...req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        name: file.originalname,
        size: file.size
      }))
    ];

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price,
        category,
        features: JSON.parse(features || '[]'),
        images,
        isAvailable: isAvailable === 'true'
      },
      { new: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    console.error('Product update error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.delete("/products/:id", auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    
    // Find the vendor associated with the current user
    const vendor = await Vendor.findOne({ userId: req.user.id });
    
    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }
    
    // Log for debugging
    console.log('Delete auth check:', { 
      vendorId: vendor._id.toString(),
      productVendorId: product.vendorId.toString(),
      userId: req.user.id
    });
    
    // Check if the product belongs to this vendor
    if (product.vendorId.toString() !== vendor._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Delete associated images
    product.images.forEach(image => {
      const filePath = path.join(__dirname, image.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error('Product delete error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Booking Routes
app.post("/bookings", auth, async (req, res) => {
  try {
    console.log("Received booking request:", JSON.stringify(req.body, null, 2));
    console.log("User ID from auth:", req.user.id);
    
    // Validate required fields
    if (!req.body.productId) {
      console.log("Missing productId in request");
      return res.status(400).json({ message: "Product ID is required" });
    }
    
    // Find the product to get its vendor
    console.log("Looking for product with ID:", req.body.productId);
    const product = await Product.findById(req.body.productId);
    if (!product) {
      console.log("Product not found for ID:", req.body.productId);
      return res.status(404).json({ message: "Product not found" });
    }
    
    console.log("Found product:", product._id, "with vendor:", product.vendorId);

    // Parse date if it's a string
    let bookingDate = req.body.date;
    if (typeof bookingDate === 'string') {
      bookingDate = new Date(bookingDate);
      if (isNaN(bookingDate.getTime())) {
        console.log("Invalid date format:", req.body.date);
        return res.status(400).json({ message: "Invalid date format" });
      }
    }

    // Map frontend fields to backend model fields
    const bookingData = {
      userId: req.user.id,
      vendorId: req.body.vendorId || product.vendorId, // Use vendorId from request or from product
      productId: req.body.productId,
      date: bookingDate,
      time: req.body.time || new Date(bookingDate).toLocaleTimeString(),
      eventType: req.body.eventType || "Other",
      guestCount: req.body.guestCount || 1,
      specialRequests: req.body.specialRequests || '',
      amount: req.body.amount || product.price || 0,
      status: "pending"
    };

    console.log("Creating booking with data:", JSON.stringify(bookingData, null, 2));

    // Validate the booking data against the model
    const booking = new Booking(bookingData);
    const validationError = booking.validateSync();
    if (validationError) {
      console.error("Validation error:", validationError);
      return res.status(400).json({ 
        message: "Validation error", 
        errors: Object.values(validationError.errors).map(err => err.message)
      });
    }

    await booking.save();
    console.log("Booking created successfully:", booking._id);

    res.status(201).json(booking);
  } catch (error) {
    console.error("Error creating booking:", error);
    console.error("Error stack:", error.stack);
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      return res.status(400).json({ message: "Validation error", errors: validationErrors });
    }
    
    // Check for MongoDB errors
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      if (error.code === 11000) {
        return res.status(400).json({ message: "Duplicate entry", field: Object.keys(error.keyPattern)[0] });
      }
    }
    
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/bookings", auth, async (req, res) => {
  try {
    console.log("Fetching bookings for user:", {
      userId: req.user.id,
      role: req.user.role
    });
    
    let query = {};
    
    if (req.user.role === 'vendor') {
      // For vendors, find their vendor record first
      const vendor = await Vendor.findOne({ userId: req.user.id });
      
      if (!vendor) {
        console.log("Vendor profile not found for user:", req.user.id);
        return res.status(404).json({ message: "Vendor profile not found" });
      }
      
      // Find all products belonging to this vendor
      const vendorProducts = await Product.find({ vendorId: vendor._id });
      const productIds = vendorProducts.map(product => product._id);
      
      // Find bookings for these products OR where vendorId matches
      query = { 
        $or: [
          { productId: { $in: productIds } },
          { vendorId: vendor._id }
        ]
      };
      
      console.log(`Finding bookings for vendor ${vendor._id} with ${productIds.length} products`);
    } else {
      // For regular users, find bookings they've made
      query = { userId: req.user.id };
      console.log("Finding bookings for user with query:", query);
    }

    console.log("Bookings query:", query);
    
    const bookings = await Booking.find(query)
      .populate('productId')
      .populate('userId', 'name email')
      .populate('vendorId', 'name');
      
    console.log(`Found ${bookings.length} bookings for ${req.user.role} ${req.user.id}`);
    console.log("Bookings:", bookings);
    
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.put("/bookings/:id/status", auth, async (req, res) => {
  try {
    console.log("Updating booking status. User:", req.user.id, "Role:", req.user.role);
    
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id).populate('productId');
    
    if (!booking) {
      console.log("Booking not found:", req.params.id);
      return res.status(404).json({ message: "Booking not found" });
    }
    
    console.log("Found booking:", {
      id: booking._id,
      vendorId: booking.vendorId,
      productId: booking.productId?._id,
      productVendorId: booking.productId?.vendorId
    });
    
    // Check authorization based on user role
    if (req.user.role === 'vendor') {
      // For vendors, check if they own the booking
      const vendor = await Vendor.findOne({ userId: req.user.id });
      if (!vendor) {
        console.log("Vendor profile not found for user:", req.user.id);
        return res.status(403).json({ message: "Vendor profile not found" });
      }
      
      console.log("Found vendor:", {
        id: vendor._id,
        userId: vendor.userId,
        name: vendor.name
      });
      
      // Check if the booking belongs to this vendor through either:
      // 1. Direct vendorId match
      // 2. Product's vendorId match
      const isAuthorized = 
        booking.vendorId?.toString() === vendor._id.toString() ||
        booking.productId?.vendorId?.toString() === vendor._id.toString();
      
      console.log("Authorization check:", {
        bookingVendorId: booking.vendorId?.toString(),
        productVendorId: booking.productId?.vendorId?.toString(),
        vendorId: vendor._id.toString(),
        isAuthorized
      });
      
      if (!isAuthorized) {
        console.log("Not authorized: Booking doesn't belong to this vendor");
        return res.status(403).json({ message: "Not authorized to update this booking" });
      }
    } else if (req.user.role === 'user' || req.user.role === 'customer') {
      // For users, check if they own the booking
      if (booking.userId.toString() !== req.user.id) {
        console.log("Not authorized: Booking doesn't belong to this user");
        return res.status(403).json({ message: "Not authorized to update this booking" });
      }
    } else if (req.user.role !== 'admin') {
      // Only vendors, users, and admins can update booking status
      console.log("Not authorized: User is not a vendor, user, or admin");
      return res.status(403).json({ message: "Not authorized to update booking status" });
    }

    booking.status = status;
    if (status === 'cancelled') {
      booking.cancellationReason = req.body.reason;
    }

    await booking.save();
    console.log(`Booking ${booking._id} status updated to ${status}`);
    res.json(booking);
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/bookings/:id/review", auth, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    booking.rating = rating;
    booking.review = review;
    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all categories (public endpoint)
app.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Admin category management endpoints
app.post("/admin/categories", auth, async (req, res) => {
  try {
    console.log('Category creation request:', {
      body: req.body,
      user: req.user
    });

    // Check admin role
    if (req.user.role !== 'admin') {
      console.log('Non-admin user attempted to create category:', req.user);
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }

    // Validate required fields
    const { name, description, icon } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ message: "Category description is required" });
    }

    // Check if category already exists (case-insensitive)
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });

    if (existingCategory) {
      console.log('Category name already exists:', name);
      return res.status(400).json({ message: "Category name already exists" });
    }

    // Create new category
    const category = new Category({
      name: name.trim(),
      description: description.trim(),
      icon: icon?.trim() || '🎪',
      isActive: true
    });

    console.log('Creating new category:', category);
    await category.save();
    
    console.log('Category created successfully:', category);
    res.status(201).json(category);
  } catch (error) {
    console.error("Error creating category:", {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Invalid category data", 
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ 
      message: "Server error while creating category", 
      error: error.message 
    });
  }
});

app.get("/admin/categories", auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      console.log('Non-admin user attempted to fetch categories:', req.user);
      return res.status(403).json({ message: "Access denied" });
    }

    console.log('Fetching categories for admin');
    const categories = await Category.find();
    
    // Get vendor count for each category
    const categoriesWithStats = await Promise.all(categories.map(async (category) => {
      console.log('Processing category:', category);
      const vendorCount = await Vendor.countDocuments({ 
        category: category.name,
        status: 'active'
      });
      
      // Ensure we have all required fields
      const categoryData = {
        _id: category._id,
        name: category.name,
        description: category.description,
        icon: category.icon,
        isActive: category.isActive,
        vendorCount,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      };

      console.log('Category with stats:', categoryData);
      return categoryData;
    }));

    console.log('Sending categories response:', categoriesWithStats);
    res.json(categoriesWithStats);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.put("/admin/categories/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      console.log('Non-admin user attempted to update category:', req.user);
      return res.status(403).json({ message: "Access denied" });
    }

    console.log('Category update request:', {
      categoryId: req.params.id,
      updateData: req.body,
      user: req.user.id
    });

    const { name, description, icon, isActive } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      console.log('Category not found:', req.params.id);
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        _id: { $ne: category._id },
        name: { $regex: new RegExp(`^${name}$`, 'i') }
      });
      
      if (existingCategory) {
        console.log('Category name conflict:', {
          newName: name,
          existingCategory: existingCategory.name
        });
        return res.status(400).json({ message: "Category name already exists" });
      }
    }

    // Update only the fields that are provided
    if (name) category.name = name;
    if (description) category.description = description;
    if (icon) category.icon = icon;
    if (isActive !== undefined) category.isActive = isActive;

    console.log('Updating category with data:', {
      id: category._id,
      updates: {
        name: category.name,
        description: category.description,
        icon: category.icon,
        isActive: category.isActive
      }
    });

    await category.save();
    
    console.log('Category updated successfully:', category);
    res.json(category);
  } catch (error) {
    console.error("Error updating category:", {
      error: error.message,
      stack: error.stack,
      categoryId: req.params.id,
      requestBody: req.body
    });
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.delete("/admin/categories/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if category is in use
    const vendorsUsingCategory = await Vendor.countDocuments({ category: category.name });
    if (vendorsUsingCategory > 0) {
      // Instead of deleting, just mark as inactive
      category.isActive = false;
      await category.save();
      return res.json({ 
        message: "Category marked as inactive as it is being used by vendors",
        category
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Admin Routes
app.get('/admin/users', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
    
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get('/admin/vendors', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
    
    const vendors = await Vendor.find();
    res.json(vendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get('/admin/bookings', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
    
    const bookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('vendorId', 'name')
      .populate('productId', 'name price');
      
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get('/admin/stats', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
    
    const userCount = await User.countDocuments();
    const vendorCount = await Vendor.countDocuments();
    const bookingCount = await Booking.countDocuments();
    
    // Get booking status counts
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    
    res.json({
      userCount,
      vendorCount,
      bookingCount,
      bookingStatus: {
        pending: pendingBookings,
        confirmed: confirmedBookings,
        completed: completedBookings,
        cancelled: cancelledBookings
      }
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete vendor (admin only)
app.delete("/admin/vendors/:id", auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      console.log('Delete vendor attempt by non-admin user:', req.user);
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }

    console.log('Attempting to delete vendor with ID:', req.params.id);

    // Find the vendor
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      console.log('Vendor not found with ID:', req.params.id);
      return res.status(404).json({ message: "Vendor not found" });
    }

    console.log('Found vendor:', vendor);

    // Delete all products associated with this vendor
    const productsDeleted = await Product.deleteMany({ vendorId: vendor._id });
    console.log('Deleted associated products:', productsDeleted);

    // Delete all bookings associated with this vendor
    const bookingsDeleted = await Booking.deleteMany({ vendorId: vendor._id });
    console.log('Deleted associated bookings:', bookingsDeleted);

    // Delete the vendor's user account
    const userDeleted = await User.findByIdAndDelete(vendor.userId);
    console.log('Deleted user account:', userDeleted);

    // Finally, delete the vendor
    const vendorDeleted = await Vendor.findByIdAndDelete(req.params.id);
    console.log('Deleted vendor:', vendorDeleted);

    res.json({ 
      message: "Vendor and all associated data deleted successfully",
      details: {
        productsDeleted: productsDeleted.deletedCount,
        bookingsDeleted: bookingsDeleted.deletedCount,
        userDeleted: userDeleted ? true : false,
        vendorDeleted: vendorDeleted ? true : false
      }
    });
  } catch (error) {
    console.error("Error deleting vendor:", error);
    res.status(500).json({ 
      message: "Server error while deleting vendor", 
      error: error.message,
      stack: error.stack 
    });
  }
});

// Update vendor status (admin only)
app.put("/admin/vendors/:id/status", auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      console.log('Status update attempt by non-admin user:', req.user);
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }

    const { status } = req.body;
    const vendorId = req.params.id;

    // Validate vendor ID
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      console.log('Invalid vendor ID format:', vendorId);
      return res.status(400).json({ message: "Invalid vendor ID format" });
    }

    console.log('Attempting to update vendor status:', {
      vendorId,
      newStatus: status,
      user: req.user.id
    });
    
    // Validate status
    if (!status || !['active', 'pending', 'suspended'].includes(status)) {
      console.log('Invalid status value:', status);
      return res.status(400).json({ message: "Invalid status value. Must be 'active', 'pending', or 'suspended'." });
    }

    // Find and update the vendor
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      console.log('Vendor not found with ID:', vendorId);
      return res.status(404).json({ message: "Vendor not found" });
    }

    console.log('Found vendor:', {
      id: vendor._id,
      currentStatus: vendor.status,
      newStatus: status
    });

    // Update the vendor status
    vendor.status = status;
    const updatedVendor = await vendor.save();

    console.log('Successfully updated vendor status:', {
      id: updatedVendor._id,
      newStatus: updatedVendor.status
    });

    res.json({ 
      message: "Vendor status updated successfully", 
      vendor: {
        id: updatedVendor._id,
        name: updatedVendor.name,
        status: updatedVendor.status
      }
    });
  } catch (error) {
    console.error("Error updating vendor status:", error);
    res.status(500).json({ 
      message: "Server error while updating vendor status", 
      error: error.message 
    });
  }
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Start server only after successful MongoDB connection
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
