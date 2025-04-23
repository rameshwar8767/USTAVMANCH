import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container, Grid, Card, CardMedia, CardContent, Typography,
  Box, Button, Rating, Chip, Stack, TextField, Paper,
  InputAdornment, Divider, Avatar, CircularProgress,
  Skeleton, Fade, Zoom, useTheme, alpha, Tabs, Tab,
  IconButton, Tooltip
} from '@mui/material';
import {
  Search, LocationOn, FilterList, Restaurant,
  PhotoCamera, MusicNote, Celebration, Deck, EmojiEvents,
  Star, StarBorder, Favorite, FavoriteBorder, VerifiedUser,
  Sort, ArrowUpward, ArrowDownward
} from '@mui/icons-material';
import api from '../utils/api';
import { useQuery } from '@tanstack/react-query';

// Mock data as fallback
const mockCategories = [
  { name: 'All', icon: <FilterList />, color: '#6366F1' },
  { name: 'Venues', icon: <Deck />, color: '#F59E0B' },
  { name: 'Catering', icon: <Restaurant />, color: '#10B981' },
  { name: 'Photography', icon: <PhotoCamera />, color: '#EC4899' },
  { name: 'Music', icon: <MusicNote />, color: '#8B5CF6' },
  { name: 'Decoration', icon: <Celebration />, color: '#F43F5E' },
];

const VendorList = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeTab, setActiveTab] = useState(0);
  const [favorites, setFavorites] = useState([]);

  // Helper function to get icon based on category name
  const getIconForCategory = (name) => {
    const iconMap = {
      'Venues': <Deck />,
      'Catering': <Restaurant />,
      'Photography': <PhotoCamera />,
      'Music': <MusicNote />,
      'Decoration': <Celebration />
    };
    
    return iconMap[name] || <EmojiEvents />;
  };

  // Helper function to get color based on category name
  const getCategoryColor = (name) => {
    const colorMap = {
      'Venues': '#F59E0B',
      'Catering': '#10B981',
      'Photography': '#EC4899',
      'Music': '#8B5CF6',
      'Decoration': '#F43F5E'
    };
    
    return colorMap[name] || '#6366F1';
  };

  // Fetch categories from API with mock fallback
  const { 
    data: apiCategories = [], 
    isLoading: categoriesLoading,
    isError: categoriesError
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const response = await api.get('/categories');
        // Map API categories to include icons and colors
        return response.data.map(category => ({
          ...category,
          icon: getIconForCategory(category.name),
          color: getCategoryColor(category.name)
        }));
      } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Use API categories if available, otherwise fall back to mock data
  // Always ensure 'All' category is first
  const categories = categoriesError || apiCategories.length === 0 
    ? mockCategories 
    : [{ name: 'All', icon: <FilterList />, color: '#6366F1' }, ...apiCategories];

  // Fetch vendors using React Query
  const { 
    data: vendors = [], 
    isLoading: vendorsLoading, 
    error: vendorsError 
  } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      try {
        const response = await api.get('/vendors');
        return response.data;
      } catch (error) {
        console.error('Error fetching vendors:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Filter vendors based on search and category
  const filteredVendors = vendors?.filter(vendor => {
    // Check if vendor exists
    if (!vendor) return false;

    const matchesSearch = !searchTerm || 
      vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || 
      vendor.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  }) || [];

  // Sort vendors
  const sortedVendors = [...filteredVendors].sort((a, b) => {
    if (!a || !b) return 0;
    
    switch (sortBy) {
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'reviews':
        return (b.reviews?.length || 0) - (a.reviews?.length || 0);
      default:
        return 0;
    }
  });

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const toggleFavorite = (vendorId) => {
    if (favorites.includes(vendorId)) {
      setFavorites(favorites.filter(id => id !== vendorId));
    } else {
      setFavorites([...favorites, vendorId]);
    }
  };

  const getImageUrl = (vendor) => {
    if (!vendor) return null;
    
    console.log('Processing vendor image:', {
      vendorId: vendor._id,
      vendorName: vendor.name,
      profileImage: vendor.profileImage,
      images: vendor.images
    });
    
    // First try to get the profile image
    if (vendor.profileImage) {
      console.log('Found profile image:', vendor.profileImage);
      
      // If it's already a full URL, return it
      if (vendor.profileImage.startsWith('http')) {
        return vendor.profileImage;
      }
      
      // Clean up the URL by removing any HTML attributes or query parameters
      const cleanPath = vendor.profileImage.split('"')[0].split('?')[0];
      console.log('Cleaned profile image path:', cleanPath);
      
      // If it's a relative path starting with /uploads/, construct the full URL
      if (cleanPath.startsWith('/uploads/')) {
        const fullUrl = `http://localhost:5001${cleanPath}`;
        console.log('Constructed full URL:', fullUrl);
        return fullUrl;
      }
      
      // Otherwise, assume it's just a filename and construct the full URL
      const fullUrl = `http://localhost:5001/uploads/${cleanPath}`;
      console.log('Constructed full URL from filename:', fullUrl);
      return fullUrl;
    }
    
    // If no profile image, use the default Logo.jpg
    return 'http://localhost:5001/uploads/Logo.jpg';
  };

  if (vendorsError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', pt: 8 }}>
        <Typography color="error">Error loading vendors: {vendorsError.message}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', pt: 8 }}>
      {/* Hero Section with Parallax Effect */}
      <Box 
        sx={{ 
          width: '100%', 
          height: '400px', 
          background: 'linear-gradient(135deg, #660095 0%, #800080 25%, #c837ab 50%, #ff69b4 75%, #ffb6c1 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          mb: 6,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'url(https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            opacity: 0.3,
            zIndex: -1,
          }
        }}
      >
        <Zoom in={true} timeout={800}>
          <Typography variant="h2" sx={{ mb: 2, fontWeight: 700, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            Find Perfect Vendors
          </Typography>
        </Zoom>
        <Fade in={true} timeout={1200}>
          <Typography variant="h5" sx={{ mb: 4, maxWidth: '800px', textAlign: 'center', px: 2 }}>
            Discover and book the best venues and services for your dream events
          </Typography>
        </Fade>
        <Zoom in={true} timeout={1000}>
          <TextField
            placeholder="Search vendors, services, or locations..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              width: '90%',
              maxWidth: '700px',
              backgroundColor: 'white',
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: 'transparent',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'transparent',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="primary" />
                </InputAdornment>
              ),
            }}
          />
        </Zoom>
      </Box>

      {/* Category Tabs - Mobile View */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 4, mt: 2 }}>
        <Container maxWidth="xl">
          <Typography variant="h5" fontWeight={700} sx={{ mb: 2, textAlign: 'center' }}>
            Browse by Category
          </Typography>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => {
              setActiveTab(newValue);
              setSelectedCategory(categories[newValue].name);
            }}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{ 
              mb: 2,
              '& .MuiTabs-indicator': {
                backgroundColor: 'transparent',
                height: 3,
              },
              '& .MuiTabs-scrollButtons': {
                color: theme.palette.primary.main,
                '&.Mui-disabled': {
                  opacity: 0.3,
                }
              }
            }}
          >
            {categories.map((category, index) => (
              <Tab 
                key={category.name} 
                label={category.name} 
                icon={category.icon} 
                sx={{ 
                  minHeight: '90px',
                  minWidth: '120px',
                  borderRadius: '12px',
                  margin: '0 4px',
                  transition: 'all 0.3s ease',
                  color: activeTab === index ? 'white' : 'text.secondary',
                  backgroundColor: activeTab === index ? category.color : alpha(category.color, 0.1),
                  boxShadow: activeTab === index ? `0 4px 12px ${alpha(category.color, 0.5)}` : 'none',
                  transform: activeTab === index ? 'translateY(-4px)' : 'none',
                  '&:hover': {
                    backgroundColor: activeTab === index ? category.color : alpha(category.color, 0.2),
                    transform: 'translateY(-2px)',
                  },
                  '&.Mui-selected': {
                    color: 'white',
                  }
                }}
              />
            ))}
          </Tabs>
        </Container>
      </Box>

      {/* Filters and Content */}
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {/* Category Filters - Desktop View */}
          <Grid item xs={12} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                position: 'sticky',
                top: 88,
                background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                border: '1px solid rgba(0,0,0,0.05)',
              }}
            >
              <Typography variant="h5" gutterBottom fontWeight={700} sx={{ 
                textAlign: 'center', 
                mb: 3, 
                background: 'linear-gradient(90deg, #660095, #ff69b4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Browse by Category
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={2}>
                {categories.map((category) => (
                  <Zoom in={true} key={category.name} style={{ transitionDelay: '100ms' }}>
                    <Button
                      variant={selectedCategory === category.name ? "contained" : "outlined"}
                      onClick={() => handleCategoryChange(category.name)}
                      startIcon={category.icon}
                      fullWidth
                      sx={{
                        justifyContent: 'flex-start',
                        px: 2,
                        py: 1.8,
                        borderRadius: 3,
                        fontSize: '1rem',
                        fontWeight: 600,
                        backgroundColor: selectedCategory === category.name ? 
                          alpha(category.color, 0.9) : 'transparent',
                        borderColor: category.color,
                        borderWidth: '2px',
                        color: selectedCategory === category.name ? 'white' : category.color,
                        boxShadow: selectedCategory === category.name ? 
                          `0 6px 15px ${alpha(category.color, 0.4)}` : 'none',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: selectedCategory === category.name ? 
                            alpha(category.color, 0.8) : alpha(category.color, 0.1),
                          borderColor: category.color,
                          transform: 'translateY(-3px)',
                          boxShadow: `0 8px 20px ${alpha(category.color, 0.3)}`,
                        }
                      }}
                    >
                      {category.name}
                    </Button>
                  </Zoom>
                ))}
              </Stack>
              <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 4, mb: 2 }}>
                Sort By
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1.5}>
                <Button
                  variant={sortBy === 'rating' ? "contained" : "outlined"}
                  onClick={() => handleSortChange('rating')}
                  startIcon={<Star />}
                  endIcon={sortBy === 'rating' && (sortOrder === 'desc' ? <ArrowDownward fontSize="small" /> : <ArrowUpward fontSize="small" />)}
                  fullWidth
                  sx={{
                    justifyContent: 'flex-start',
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                  }}
                >
                  Rating
                </Button>
                <Button
                  variant={sortBy === 'reviews' ? "contained" : "outlined"}
                  onClick={() => handleSortChange('reviews')}
                  startIcon={<Star />}
                  endIcon={sortBy === 'reviews' && (sortOrder === 'desc' ? <ArrowDownward fontSize="small" /> : <ArrowUpward fontSize="small" />)}
                  fullWidth
                  sx={{
                    justifyContent: 'flex-start',
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                  }}
                >
                  Reviews
                </Button>
                <Button
                  variant={sortBy === 'name' ? "contained" : "outlined"}
                  onClick={() => handleSortChange('name')}
                  startIcon={<Sort />}
                  endIcon={sortBy === 'name' && (sortOrder === 'desc' ? <ArrowDownward fontSize="small" /> : <ArrowUpward fontSize="small" />)}
                  fullWidth
                  sx={{
                    justifyContent: 'flex-start',
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                  }}
                >
                  Name
                </Button>
              </Stack>
            </Paper>
          </Grid>

          {/* Vendor List */}
          <Grid item xs={12} md={9}>
            {/* Sort Controls - Mobile */}
            <Box sx={{ 
              display: { xs: 'flex', md: 'none' }, 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2,
              px: 1
            }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {filteredVendors.length} Results
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Sort by Rating">
                  <IconButton 
                    color={sortBy === 'rating' ? 'primary' : 'default'}
                    onClick={() => handleSortChange('rating')}
                  >
                    <Star />
                    {sortBy === 'rating' && (sortOrder === 'desc' ? <ArrowDownward fontSize="small" /> : <ArrowUpward fontSize="small" />)}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Sort by Name">
                  <IconButton 
                    color={sortBy === 'name' ? 'primary' : 'default'}
                    onClick={() => handleSortChange('name')}
                  >
                    <Sort />
                    {sortBy === 'name' && (sortOrder === 'desc' ? <ArrowDownward fontSize="small" /> : <ArrowUpward fontSize="small" />)}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Results Count - Desktop */}
            <Box sx={{ 
              display: { xs: 'none', md: 'flex' }, 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3 
            }}>
              <Typography variant="h6" fontWeight={600}>
                {filteredVendors.length} Vendors Found
              </Typography>
            </Box>

            {vendorsLoading ? (
              // Loading Skeletons
              <Grid container spacing={3}>
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <Grid item xs={12} sm={6} lg={4} key={item}>
                    <Card sx={{ height: '100%', borderRadius: 2, overflow: 'hidden' }}>
                      <Skeleton variant="rectangular" height={200} animation="wave" />
                      <CardContent>
                        <Skeleton variant="text" height={30} width="80%" animation="wave" />
                        <Skeleton variant="text" height={20} animation="wave" />
                        <Skeleton variant="text" height={20} animation="wave" />
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                          <Skeleton variant="rectangular" height={30} width={120} animation="wave" />
                          <Skeleton variant="circular" height={30} width={30} sx={{ ml: 'auto' }} animation="wave" />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid container spacing={3}>
                {sortedVendors.map((vendor) => (
                  <Grid item xs={12} sm={6} lg={4} key={vendor._id}>
                    <Zoom in={true} style={{ transitionDelay: '100ms' }}>
                      <Card 
                        elevation={0}
                        sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 2,
                          overflow: 'hidden',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 12px 20px rgba(0,0,0,0.12)'
                          }
                        }}
                      >
                        <Box sx={{ position: 'relative' }}>
                          <CardMedia
                            component="img"
                            height="220"
                            image={vendor.profileImage ? `http://localhost:5001${vendor.profileImage}` : 'http://localhost:5001/uploads/Logo.jpg'}
                            alt={vendor.name || 'Vendor Image'}
                            sx={{ 
                              transition: 'transform 0.5s ease',
                              '&:hover': {
                                transform: 'scale(1.05)'
                              },
                              objectFit: 'cover'
                            }}
                          />
                          <IconButton 
                            sx={{ 
                              position: 'absolute', 
                              top: 8, 
                              right: 8, 
                              backgroundColor: 'rgba(255,255,255,0.8)',
                              '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.95)'
                              }
                            }}
                            onClick={() => toggleFavorite(vendor._id)}
                          >
                            {favorites.includes(vendor._id) ? 
                              <Favorite color="error" /> : 
                              <FavoriteBorder />}
                          </IconButton>
                          {vendor.featured && (
                            <Chip 
                              label="Featured" 
                              color="primary" 
                              size="small"
                              icon={<VerifiedUser fontSize="small" />}
                              sx={{ 
                                position: 'absolute', 
                                top: 8, 
                                left: 8,
                                fontWeight: 'bold',
                                backgroundColor: alpha('#FFD700', 0.9),
                                color: '#000',
                              }} 
                            />
                          )}
                          <Chip 
                            label={vendor.category || 'Venue'} 
                            size="small"
                            sx={{ 
                              position: 'absolute', 
                              bottom: 8, 
                              left: 8,
                              backgroundColor: 'rgba(0,0,0,0.7)',
                              color: 'white',
                            }} 
                          />
                        </Box>
                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="h6" gutterBottom fontWeight={600}>
                              {vendor.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Rating value={vendor.rating || 0} readOnly precision={0.5} size="small" />
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                                ({vendor.reviews?.length || 0} reviews)
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                            <LocationOn fontSize="small" color="action" sx={{ mr: 0.5 }} />
                            <Typography variant="body2" color="text.secondary">
                              {vendor.location || 'Pune, Maharashtra'}
                            </Typography>
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" paragraph sx={{ 
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            height: '4.5em'
                          }}>
                            {vendor.description}
                          </Typography>
                          
                          <Box sx={{ mt: 'auto' }}>
                            <Button
                              component={Link}
                              to={`/vendors/${encodeURIComponent(vendor._id)}`}
                              variant="contained"
                              fullWidth
                              sx={{ 
                                borderRadius: 2, 
                                py: 1,
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: '1rem'
                              }}
                            >
                              View Details
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Zoom>
                  </Grid>
                ))}
                
                {sortedVendors.length === 0 && (
                  <Box sx={{ width: '100%', py: 8, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                      No vendors found matching your criteria
                    </Typography>
                    <Button 
                      variant="outlined" 
                      sx={{ mt: 2 }}
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('All');
                      }}
                    >
                      Clear Filters
                    </Button>
                  </Box>
                )}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default VendorList;
