import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  Divider,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import axios from 'axios';
import VendorLayout from '../../components/vendor/VendorLayout';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import ImageUpload from '../../components/common/ImageUpload';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalBookings: 0,
    pendingBookings: 0
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    features: '',
    images: [],
    isAvailable: true
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
        return;
      }
      if (user.role !== 'vendor') {
        navigate('/');
        return;
      }
      fetchProducts();
      fetchRecentBookings();
    }
  }, [authLoading, user, navigate]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      console.log('Fetching products for user:', user);
      
      if (!user || !user.id) {
        console.error('User or user.id is undefined');
        setError('User information is missing. Please log in again.');
        setProducts([]);
        return;
      }

      // First get the vendor details
      const vendorResponse = await api.get(`/vendors/profile`);
      const vendorId = vendorResponse.data._id;
      
      const response = await api.get(`/products?vendorId=${vendorId}`);
      console.log('Products response:', response.data); // Debug log
      
      // Ensure we always set an array, even if empty
      setProducts(response.data.products || []);
      
      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        totalProducts: response.data.total || 0,
        totalBookings: prevStats.totalBookings || 0
      }));
      
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
      setProducts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentBookings = async () => {
    try {
      setBookingsLoading(true);
      
      // Fetch bookings from API
      const response = await api.get('/bookings');
      const bookings = response.data || [];
      console.log('API bookings for vendor dashboard:', bookings);
      
      // Set bookings state
      setRecentBookings(bookings.slice(0, 5)); // Only show the 5 most recent bookings
      setBookingsLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookingsError('Failed to load bookings. Please try again later.');
      setBookingsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleAddProduct = async () => {
    try {
      setSubmitting(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('price', productForm.price);
      formData.append('category', productForm.category);
      formData.append('isAvailable', productForm.isAvailable);
      
      // Handle features - convert comma-separated string to array
      if (productForm.features) {
        const featuresArray = productForm.features.split(',').map(f => f.trim());
        formData.append('features', JSON.stringify(featuresArray));
      }
      
      // Add images if any
      if (productForm.images && productForm.images.length > 0) {
        productForm.images.forEach(img => {
          if (img.file) {
            formData.append('images', img.file);
          }
        });
      }
      
      await api.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setOpenDialog(false);
      setProductForm({
        name: '',
        description: '',
        price: '',
        category: '',
        features: '',
        images: [],
        isAvailable: true
      });
      
      setSnackbar({
        open: true,
        message: 'Product added successfully!',
        severity: 'success'
      });
      
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      setSnackbar({
        open: true,
        message: 'Failed to add product: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <VendorLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Vendor Dashboard</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Add Product
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {/* Products Section */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Your Products</Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={() => {
                      setProductForm({
                        name: '',
                        description: '',
                        price: '',
                        category: '',
                        features: '',
                        images: [],
                        isAvailable: true
                      });
                      setOpenDialog(true);
                    }}
                  >
                    Add Product
                  </Button>
                </Box>
                
                {loading ? (
                  <Box sx={{ width: '100%', mt: 2 }}>
                    <LinearProgress />
                  </Box>
                ) : products.length === 0 ? (
                  <Typography variant="body1" color="text.secondary" sx={{ my: 4, textAlign: 'center' }}>
                    You haven't added any products yet. Click "Add Product" to get started.
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Price</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product._id}>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>₹{product.price}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell>
                              <Chip 
                                label={product.isAvailable ? 'Available' : 'Unavailable'} 
                                color={product.isAvailable ? 'success' : 'error'} 
                                size="small" 
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton size="small" color="primary">
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="error">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
            
            {/* Recent Bookings Section */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Recent Bookings</Typography>
                  <Button 
                    component={Link}
                    to="/vendor/bookings"
                    variant="outlined"
                  >
                    View All
                  </Button>
                </Box>
                
                {bookingsLoading ? (
                  <Box sx={{ width: '100%', mt: 2 }}>
                    <LinearProgress />
                  </Box>
                ) : bookingsError ? (
                  <Alert severity="error" sx={{ mt: 2 }}>{bookingsError}</Alert>
                ) : recentBookings.length === 0 ? (
                  <Typography variant="body1" color="text.secondary" sx={{ my: 4, textAlign: 'center' }}>
                    No bookings found.
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Customer</TableCell>
                          <TableCell>Product</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentBookings.map((booking) => (
                          <TableRow key={booking._id}>
                            <TableCell>{booking.userName || booking.userId?.name || 'Unknown'}</TableCell>
                            <TableCell>{booking.productName || booking.productId?.name || 'Unknown Product'}</TableCell>
                            <TableCell>{formatDate(booking.date)}</TableCell>
                            <TableCell>
                              <Chip 
                                label={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                color={getStatusColor(booking.status)}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            {/* Stats Cards */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Dashboard Summary</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                    <CardContent>
                      <Typography variant="h5">{products.length}</Typography>
                      <Typography variant="body2">Total Products</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
                    <CardContent>
                      <Typography variant="h5">{stats.totalBookings}</Typography>
                      <Typography variant="body2">Total Bookings</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                    <CardContent>
                      <Typography variant="h5">{stats.pendingBookings}</Typography>
                      <Typography variant="body2">Pending Approvals</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
            
            {/* Quick Links */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Quick Links</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Button 
                component={Link} 
                to="/vendor/bookings"
                variant="contained" 
                fullWidth 
                sx={{ mb: 2 }}
              >
                Manage Bookings
              </Button>
              
              <Button 
                component={Link} 
                to="/vendor/products"
                variant="outlined" 
                fullWidth 
                sx={{ mb: 2 }}
              >
                Manage Products
              </Button>
              
              <Button 
                component={Link} 
                to="/vendor/profile"
                variant="outlined" 
                fullWidth
              >
                Update Profile
              </Button>
            </Paper>
          </Grid>
        </Grid>

        {/* Add Product Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => !submitting && setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Add New Product</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Product Name"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                sx={{ mb: 2 }}
                disabled={submitting}
                required
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                sx={{ mb: 2 }}
                disabled={submitting}
                required
              />
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                sx={{ mb: 2 }}
                disabled={submitting}
                required
              />
              <FormControl fullWidth sx={{ mb: 2 }} disabled={submitting} required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={productForm.category}
                  label="Category"
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                >
                  <MenuItem value="Venue">Venue</MenuItem>
                  <MenuItem value="Catering">Catering</MenuItem>
                  <MenuItem value="Decoration">Decoration</MenuItem>
                  <MenuItem value="Photography">Photography</MenuItem>
                  <MenuItem value="Entertainment">Entertainment</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Features (comma-separated)"
                value={productForm.features}
                onChange={(e) => setProductForm({ ...productForm, features: e.target.value })}
                sx={{ mb: 2 }}
                disabled={submitting}
              />
              <Box sx={{ mb: 2 }}>
                <ImageUpload 
                  images={productForm.images}
                  onChange={(images) => setProductForm({ ...productForm, images })}
                  disabled={submitting}
                  title="Product Images"
                  maxImages={5}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setOpenDialog(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddProduct} 
              variant="contained"
              disabled={submitting || !productForm.name || !productForm.description || !productForm.price || !productForm.category}
              startIcon={submitting ? <CircularProgress size={20} /> : null}
            >
              {submitting ? 'Adding...' : 'Add Product'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </VendorLayout>
  );
};

export default Dashboard;
