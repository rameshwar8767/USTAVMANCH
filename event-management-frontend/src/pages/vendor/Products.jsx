import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  InputAdornment,
  Chip,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Image as ImageIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import VendorLayout from '../../components/vendor/VendorLayout';
import ImageUpload from '../../components/common/ImageUpload';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const categories = [
  'Decoration',
  'Catering',
  'Lighting',
  'Event Halls',
];

const ProductCard = ({ product, onEdit, onDelete }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <Card>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={product.images[currentImageIndex]?.url || 'https://source.unsplash.com/random/400x300?event'}
          alt={product.name}
        />
        {product.images.length > 1 && (
          <>
            <IconButton
              size="small"
              sx={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
              }}
              onClick={handlePrevImage}
            >
              <NavigateBeforeIcon />
            </IconButton>
            <IconButton
              size="small"
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
              }}
              onClick={handleNextImage}
            >
              <NavigateNextIcon />
            </IconButton>
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                bgcolor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                px: 1,
                borderRadius: 1,
                fontSize: '0.75rem',
              }}
            >
              {currentImageIndex + 1}/{product.images.length}
            </Box>
          </>
        )}
      </Box>
      <CardContent>
        <Typography variant="h6" noWrap>
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {product.description}
        </Typography>
        <Typography variant="h6" color="primary">
          ₹{product.price.toLocaleString()}
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            size="small"
            label={product.category}
            color="secondary"
          />
          <Chip
            size="small"
            label={product.isAvailable ? 'Available' : 'Unavailable'}
            color={product.isAvailable ? 'success' : 'error'}
          />
        </Box>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          startIcon={<EditIcon />}
          onClick={() => onEdit(product)}
        >
          Edit
        </Button>
        <Button
          size="small"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => onDelete(product)}
        >
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

const Products = () => {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [productDialog, setProductDialog] = useState({
    open: false,
    mode: 'add', // 'add' or 'edit'
    data: {
      name: '',
      description: '',
      price: '',
      category: '',
      features: [],
      images: [], // Add images array
      isAvailable: true,
    },
    submitting: false
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    productId: null,
    deleting: false
  });

  // Fetch products on component mount
  useEffect(() => {
    if (!authLoading) {
      fetchProducts();
    }
  }, [authLoading]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
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
      
      const response = await api.get('/products', {
        params: { vendorId }
      });
      console.log('Products response:', response.data); // Debug log
      
      // Ensure we always set an array, even if empty
      setProducts(response.data.products || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
      setProducts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setProductDialog({
      open: true,
      mode: 'add',
      data: {
        name: '',
        description: '',
        price: '',
        category: '',
        features: [],
        images: [],
        isAvailable: true,
      },
      submitting: false
    });
  };

  const handleEditProduct = (product) => {
    setProductDialog({
      open: true,
      mode: 'edit',
      data: { ...product },
      submitting: false
    });
  };

  const handleDeleteProduct = (product) => {
    setDeleteDialog({
      open: true,
      productId: product.id || product._id,
      deleting: false
    });
  };

  const handleDialogClose = () => {
    setProductDialog({
      ...productDialog,
      open: false,
    });
  };

  const handleSaveProduct = async () => {
    try {
      setProductDialog({ ...productDialog, submitting: true });
      
      const formData = new FormData();
      formData.append('name', productDialog.data.name);
      formData.append('description', productDialog.data.description);
      formData.append('price', productDialog.data.price);
      formData.append('category', productDialog.data.category);
      formData.append('isAvailable', productDialog.data.isAvailable);
      
      // Handle features array
      if (productDialog.data.features && productDialog.data.features.length > 0) {
        formData.append('features', JSON.stringify(productDialog.data.features));
      }
      
      // Handle images
      if (productDialog.mode === 'edit' && productDialog.data.images) {
        // For existing images in edit mode
        const existingImages = productDialog.data.images.filter(img => img.url && !img.file);
        if (existingImages.length > 0) {
          formData.append('existingImages', JSON.stringify(existingImages));
        }
      }
      
      // Add new image files if any
      if (productDialog.data.images) {
        const newImages = productDialog.data.images.filter(img => img.file);
        newImages.forEach(img => {
          formData.append('images', img.file);
        });
      }
      
      let response;
      if (productDialog.mode === 'add') {
        response = await api.post('/products', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setSnackbar({
          open: true,
          message: 'Product added successfully!',
          severity: 'success'
        });
      } else {
        response = await api.put(`/products/${productDialog.data._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setSnackbar({
          open: true,
          message: 'Product updated successfully!',
          severity: 'success'
        });
      }
      
      // Refresh products list
      fetchProducts();
      
      // Close dialog
      setProductDialog({ ...productDialog, open: false });
    } catch (error) {
      console.error('Error saving product:', error);
      setSnackbar({
        open: true,
        message: `Failed to ${productDialog.mode === 'add' ? 'add' : 'update'} product: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    } finally {
      setProductDialog(prev => ({ ...prev, submitting: false }));
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteDialog({ ...deleteDialog, deleting: true });
      await api.delete(`/products/${deleteDialog.productId}`);
      
      // Refresh products list
      fetchProducts();
      
      setSnackbar({
        open: true,
        message: 'Product deleted successfully!',
        severity: 'success'
      });
      
      // Close dialog
      setDeleteDialog({ open: false, productId: null, deleting: false });
    } catch (error) {
      console.error('Error deleting product:', error);
      setSnackbar({
        open: true,
        message: `Failed to delete product: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
      setDeleteDialog(prev => ({ ...prev, deleting: false }));
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <VendorLayout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Products
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddProduct}
          >
            Add Product
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        ) : products.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            You haven't added any products yet. Click the "Add Product" button to get started.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product._id || product.id}>
                <ProductCard
                  product={product}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Add/Edit Dialog */}
        <Dialog
          open={productDialog.open}
          onClose={productDialog.submitting ? undefined : handleDialogClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {productDialog.mode === 'add' ? 'Add New Product' : 'Edit Product'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Product Name"
                    fullWidth
                    value={productDialog.data?.name || ''}
                    onChange={(e) => setProductDialog({
                      ...productDialog,
                      data: { ...productDialog.data, name: e.target.value }
                    })}
                    disabled={productDialog.submitting}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    value={productDialog.data?.description || ''}
                    onChange={(e) => setProductDialog({
                      ...productDialog,
                      data: { ...productDialog.data, description: e.target.value }
                    })}
                    disabled={productDialog.submitting}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Price"
                    fullWidth
                    type="number"
                    value={productDialog.data?.price || ''}
                    onChange={(e) => setProductDialog({
                      ...productDialog,
                      data: { ...productDialog.data, price: e.target.value }
                    })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    disabled={productDialog.submitting}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required disabled={productDialog.submitting}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={productDialog.data?.category || ''}
                      label="Category"
                      onChange={(e) => setProductDialog({
                        ...productDialog,
                        data: { ...productDialog.data, category: e.target.value }
                      })}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <ImageUpload
                    images={productDialog.data.images}
                    onChange={(images) => setProductDialog({
                      ...productDialog,
                      data: { ...productDialog.data, images }
                    })}
                    disabled={productDialog.submitting}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={productDialog.data?.isAvailable || false}
                        onChange={(e) => setProductDialog({
                          ...productDialog,
                          data: { ...productDialog.data, isAvailable: e.target.checked }
                        })}
                        disabled={productDialog.submitting}
                      />
                    }
                    label="Available for Booking"
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleDialogClose} 
              disabled={productDialog.submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProduct}
              variant="contained"
              disabled={
                productDialog.submitting || 
                !productDialog.data?.name || 
                !productDialog.data?.price || 
                !productDialog.data?.category
              }
              startIcon={productDialog.submitting ? <CircularProgress size={20} /> : null}
            >
              {productDialog.mode === 'add' ? 'Add' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={deleteDialog.deleting ? undefined : () => setDeleteDialog({ open: false, productId: null })}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this product? This action cannot be undone.
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDeleteDialog({ open: false, productId: null })}
              disabled={deleteDialog.deleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              color="error"
              disabled={deleteDialog.deleting}
              startIcon={deleteDialog.deleting ? <CircularProgress size={20} /> : null}
            >
              Delete
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

export default Products;
