import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Rating,
  Pagination,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const BrowseProducts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 9;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Fallback to default categories if API fails
        setCategories([
          { _id: 'all', name: 'All Categories' },
          { _id: 'decoration', name: 'Decoration' },
          { _id: 'catering', name: 'Catering' },
          { _id: 'lighting', name: 'Lighting' },
          { _id: 'event-halls', name: 'Event Halls' }
        ]);
      }
    };
    
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory, priceRange, sortBy, page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      let queryParams = new URLSearchParams();
      
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      
      if (selectedCategory && selectedCategory !== 'all') {
        queryParams.append('category', selectedCategory);
      }
      
      if (priceRange) {
        const [min, max] = priceRange.split('-');
        if (min) queryParams.append('minPrice', min);
        if (max) queryParams.append('maxPrice', max);
      }
      
      queryParams.append('sort', sortBy);
      queryParams.append('page', page);
      queryParams.append('limit', productsPerPage);
      
      const response = await api.get(`/products?${queryParams.toString()}`);
      
      setProducts(response.data.products || response.data);
      setTotalPages(response.data.totalPages || Math.ceil(response.data.length / productsPerPage));
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page on new search
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setPage(1);
  };

  const handlePriceRangeChange = (e) => {
    setPriceRange(e.target.value);
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductClick = (productId) => {
    navigate(`/vendors/${productId.split('-')[0]}`);
  };

  const getImageUrl = (image) => {
    if (!image) return 'https://source.unsplash.com/random/300x200/?event';
    if (typeof image === 'string') {
      if (image.startsWith('http')) return image;
      return `${import.meta.env.VITE_API_URL}${image}`;
    }
    if (image.url) {
      if (image.url.startsWith('http')) return image.url;
      return `${import.meta.env.VITE_API_URL}${image.url}`;
    }
    return 'https://source.unsplash.com/random/300x200/?event';
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const priceRanges = [
    { value: '', label: 'All Prices' },
    { value: '0-1000', label: 'Under ₹1,000' },
    { value: '1000-5000', label: '₹1,000 - ₹5,000' },
    { value: '5000-10000', label: '₹5,000 - ₹10,000' },
    { value: '10000-50000', label: '₹10,000 - ₹50,000' },
    { value: '50000-', label: 'Above ₹50,000' }
  ];

  const sortOptions = [
    { value: 'rating', label: 'Top Rated' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Browse Products & Services
      </Typography>

      {/* Filter Section */}
      <Box 
        component="section" 
        sx={{ 
          mb: 4, 
          p: 3, 
          borderRadius: 2, 
          bgcolor: 'background.paper',
          boxShadow: 1
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search products, vendors..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Price Range</InputLabel>
              <Select
                value={priceRange}
                onChange={handlePriceRangeChange}
                label="Price Range"
              >
                {priceRanges.map((range) => (
                  <MenuItem key={range.value} value={range.value}>
                    {range.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={handleSortChange}
                label="Sort By"
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Products Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 4 }}>{error}</Alert>
      ) : products.length === 0 ? (
        <Box sx={{ textAlign: 'center', my: 8 }}>
          <Typography variant="h6" gutterBottom>
            No products found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your search or filter criteria
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setPriceRange('');
              setSortBy('rating');
            }}
          >
            Clear Filters
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product._id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={getImageUrl(product.images?.[0])}
                    alt={product.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {truncateText(product.name, 25)}
                      </Typography>
                      <Chip 
                        label={`₹${product.price}`} 
                        color="primary" 
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {truncateText(product.description, 80)}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating 
                        value={product.rating || 4.5} 
                        precision={0.5} 
                        size="small" 
                        readOnly 
                      />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        ({product.reviewCount || 0})
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {product.vendor?.location || 'Location not specified'}
                      </Typography>
                    </Box>
                  </CardContent>
                  
                  <Divider />
                  
                  <CardActions>
                    <Button 
                      size="small" 
                      onClick={() => handleProductClick(product._id)}
                    >
                      View Details
                    </Button>
                    <Button 
                      size="small" 
                      color="primary"
                      component={Link}
                      to={`/vendors/${product.vendor?._id || product.vendorId}`}
                    >
                      Book Now
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default BrowseProducts;
