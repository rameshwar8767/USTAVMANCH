import React, { useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../context/CategoryContext';

const Browse = () => {
  const navigate = useNavigate();
  const { categories, isLoading, error } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    navigate(`/vendors?category=${encodeURIComponent(categoryName)}`);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">
          Error loading categories. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Browse by Category
      </Typography>
      
      <Grid container spacing={4} sx={{ mt: 2 }}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category._id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
              onClick={() => handleCategoryClick(category.name)}
            >
              <Box
                sx={{
                  p: 4,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'primary.light',
                }}
              >
                <Typography variant="h2" component="div">
                  {category.icon}
                </Typography>
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {category.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {category.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Browse; 