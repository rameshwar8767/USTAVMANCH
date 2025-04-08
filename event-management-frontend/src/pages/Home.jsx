import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Box,
  Paper,
  useTheme,
  alpha
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  ArrowForward,
  Celebration,
  Restaurant,
  PhotoCamera,
  MusicNote,
  Deck,
  EmojiEvents
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

// Mock data as fallback
const mockCategories = [
  { 
    name: 'Venues', 
    icon: <Deck sx={{ fontSize: 40 }} />,
    image: 'https://source.unsplash.com/800x600/?wedding-venue',
    description: 'Find the perfect venue for your special day'
  },
  { 
    name: 'Catering', 
    icon: <Restaurant sx={{ fontSize: 40 }} />,
    image: 'https://source.unsplash.com/800x600/?catering-food',
    description: 'Delicious menus for every taste and budget'
  },
  { 
    name: 'Photography', 
    icon: <PhotoCamera sx={{ fontSize: 40 }} />,
    image: 'https://source.unsplash.com/800x600/?wedding-photography',
    description: 'Capture your precious moments forever'
  },
  { 
    name: 'Entertainment', 
    icon: <MusicNote sx={{ fontSize: 40 }} />,
    image: 'https://source.unsplash.com/800x600/?wedding-entertainment',
    description: 'Keep your guests entertained all day'
  },
  { 
    name: 'Decoration', 
    icon: <Celebration sx={{ fontSize: 40 }} />,
    image: 'https://source.unsplash.com/800x600/?wedding-decoration',
    description: 'Make your event unforgettable with our decoration services'
  }
];

const Home = () => {
  const theme = useTheme();
  const [activeCategory, setActiveCategory] = useState(0);

  // Helper function to get icon based on category name
  const getIconForCategory = (name) => {
    const iconMap = {
      'Venues': <Deck sx={{ fontSize: 40 }} />,
      'Catering': <Restaurant sx={{ fontSize: 40 }} />,
      'Photography': <PhotoCamera sx={{ fontSize: 40 }} />,
      'Entertainment': <MusicNote sx={{ fontSize: 40 }} />,
      'Decoration': <Celebration sx={{ fontSize: 40 }} />
    };
    
    return iconMap[name] || <EmojiEvents sx={{ fontSize: 40 }} />;
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
        return response.data.map(category => ({
          ...category,
          icon: getIconForCategory(category.name)
        }));
      } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Use API data if available, otherwise fall back to mock data
  const categories = !categoriesLoading && !categoriesError && apiCategories.length > 0 
    ? apiCategories 
    : mockCategories;

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCategory((prev) => (prev + 1) % categories.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [categories.length]);

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      {/* Hero Section with Video Background */}
      <Paper 
        elevation={0}
        sx={{
          position: 'relative',
          color: '#fff',
          mb: 4,
          height: '70vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          marginTop: '64px', // Add spacing for navbar height
        }}
      >
        {/* Video Background */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.4)', // Reduced overlay opacity
              zIndex: 1
            }
          }}
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
            }}
          >
            <source src="/videos/bg-video.mp4" type="video/mp4" />
          </video>
        </Box>

        {/* Content */}
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              component="h1"
              variant="h2"
              color="inherit"
              gutterBottom
              sx={{ 
                fontWeight: 700,
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                mb: 4
              }}
            >
              Plan Your Perfect Event
            </Typography>
            <Typography
              variant="h5"
              color="inherit"
              paragraph
              sx={{ 
                mb: 4,
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
              }}
            >
              Find the best vendors, venues, and services all in one place
            </Typography>
            <Button
              component={Link}
              to="/vendors"
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                bgcolor: theme.palette.primary.main,
                color: 'white',
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                },
                px: 4,
                py: 1.5,
                fontSize: '1.1rem'
              }}
            >
              Explore Vendors
            </Button>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="lg" sx={{ mb: 8 }}>
        {/* Categories Section */}
        <Typography
          variant="h4"
          component="h2"
          align="center"
          gutterBottom
          sx={{ 
            mb: 6, 
            fontWeight: 700,
            background: 'linear-gradient(90deg, #660095, #ff69b4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Browse by Category
        </Typography>
        <Grid container spacing={4}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={3} key={category.name}>
              <Card 
                elevation={3}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[10]
                  }
                }}
              >
                <Box
                  sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    borderBottom: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.1)
                  }}
                >
                  <Box 
                    sx={{ 
                      color: theme.palette.primary.main,
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    {category.icon}
                  </Box>
                  <Typography
                    gutterBottom
                    variant="h6"
                    component="h3"
                    sx={{ mt: 2, fontWeight: 600 }}
                  >
                    {category.name}
                  </Typography>
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {category.description}
                  </Typography>
                </CardContent>
                <Button
                  component={Link}
                  to={`/vendors?category=${category.name.toLowerCase()}`}
                  variant="outlined"
                  color="primary"
                  sx={{ 
                    mx: 2, 
                    mb: 2,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    } 
                  }}
                >
                  View All
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Call to Action Section */}
        <Paper
          sx={{
            mt: 8,
            p: 6,
            textAlign: 'center',
            bgcolor: alpha(theme.palette.primary.main, 0.04),
            borderRadius: 4
          }}
        >
          <EmojiEvents sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Are You a Vendor?
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Join our platform and reach thousands of potential customers
          </Typography>
          <Button
            component={Link}
            to="/register?type=vendor"
            variant="contained"
            size="large"
            sx={{ mt: 2 }}
          >
            Register as Vendor
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default Home;
