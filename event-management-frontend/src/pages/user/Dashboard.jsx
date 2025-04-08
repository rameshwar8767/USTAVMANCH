import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import {
  Event as EventIcon,
  Person as PersonIcon,
  Message as MessageIcon,
  ShoppingBag as ShoppingBagIcon,
  ArrowForward as ArrowForwardIcon,
  Celebration as CelebrationIcon,
  CalendarToday as CalendarTodayIcon,
  Star as StarIcon,
  Notifications as NotificationsIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentBookings, setRecentBookings] = useState([]);
  const [recommendedVendors, setRecommendedVendors] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch bookings from API
        const bookingsResponse = await api.get('/bookings');
        const bookings = bookingsResponse.data || [];
        console.log('API bookings:', bookings);
        
        // Set bookings state
        setBookings(bookings);
        
        // Set loading to false
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Initialize bookings array
        let apiBookings = [];
        let allBookings = [];
        
        // Try to fetch bookings from API
        try {
          const bookingsResponse = await api.get('/bookings');
          apiBookings = bookingsResponse.data || [];
          console.log('API bookings:', apiBookings);
        } catch (apiError) {
          console.error('Error fetching bookings from API:', apiError);
          // Continue with localStorage bookings if API fails
        }
        
        // Get bookings from localStorage
        try {
          const localBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
          console.log('Local bookings:', localBookings);
          
          // Check for the most recent booking
          try {
            const lastBooking = JSON.parse(localStorage.getItem('lastBooking'));
            if (lastBooking) {
              console.log('Last booking found:', lastBooking);
              // Add it to local bookings if not already there
              const exists = localBookings.some(booking => 
                booking._id === lastBooking._id || 
                (booking.vendorId === lastBooking.vendorId && 
                 booking.date === lastBooking.date)
              );
              
              if (!exists) {
                localBookings.push(lastBooking);
              }
            }
          } catch (lastBookingError) {
            console.error('Error parsing last booking:', lastBookingError);
          }
          
          // Filter local bookings to only include those for the current user if user is available
          const filteredLocalBookings = user ? 
            localBookings.filter(booking => {
              // Check multiple possible user ID formats
              return booking.userId === user._id || 
                     booking.userId === user.id || 
                     booking.userName === user.name;
            }) : 
            localBookings;
          
          console.log('Filtered local bookings for user:', filteredLocalBookings);
            
          // Combine API and localStorage bookings, avoiding duplicates
          allBookings = [...apiBookings];
          
          // Add localStorage bookings that aren't already in the API bookings
          filteredLocalBookings.forEach(localBooking => {
            // Check if this booking already exists in the API bookings
            const exists = allBookings.some(apiBooking => 
              apiBooking._id === localBooking._id || 
              (apiBooking.vendorId === localBooking.vendorId && 
               apiBooking.date === localBooking.date)
            );
            
            if (!exists) {
              allBookings.push(localBooking);
            }
          });
        } catch (localError) {
          console.error('Error parsing localStorage bookings:', localError);
          // If localStorage fails, just use API bookings
          allBookings = [...apiBookings];
        }
        
        // Set default status for bookings without a status
        allBookings = allBookings.map(booking => ({
          ...booking,
          status: booking.status || 'pending'
        }));
        
        // Sort bookings by date (newest first) using createdAt if available
        allBookings.sort((a, b) => {
          // Try to use createdAt first
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          // Fall back to date
          return new Date(b.date) - new Date(a.date);
        });
        
        console.log('All bookings after merging:', allBookings);
        
        // Set recent bookings (latest 3)
        setRecentBookings(allBookings.slice(0, 3));
        
        // Calculate booking stats
        const upcomingBookings = allBookings.filter(booking => 
          booking.status === 'upcoming' || 
          booking.status === 'confirmed' || 
          booking.status === 'pending'
        );
        
        const completedBookings = allBookings.filter(booking => 
          booking.status === 'completed'
        );
        
        setStats({
          totalBookings: allBookings.length,
          upcomingBookings: upcomingBookings.length,
          completedBookings: completedBookings.length
        });
        
        // Fetch recommended vendors
        try {
          const vendorsResponse = await api.get('/vendors?limit=3');
          setRecommendedVendors(vendorsResponse.data);
        } catch (vendorError) {
          console.error('Error fetching recommended vendors:', vendorError);
          // Use empty array if vendors can't be fetched
          setRecommendedVendors([]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

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
      case 'upcoming':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            width: 56,
            height: 56,
            mr: 2
          }}
        >
          {user?.name?.charAt(0)?.toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Welcome, {user?.name?.split(' ')[0]}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your bookings and discover new vendors
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarTodayIcon sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {stats.totalBookings}
                </Typography>
                <Typography variant="body1">
                  Total Bookings
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%', bgcolor: 'success.light', color: 'success.contrastText' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EventIcon sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {stats.upcomingBookings}
                </Typography>
                <Typography variant="body1">
                  Upcoming Events
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%', bgcolor: 'info.light', color: 'info.contrastText' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CelebrationIcon sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {stats.completedBookings}
                </Typography>
                <Typography variant="body1">
                  Completed Events
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Recent Bookings */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Recent Bookings
              </Typography>
              <Button 
                component={Link} 
                to="/user/bookings" 
                endIcon={<ArrowForwardIcon />}
                size="small"
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {recentBookings.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  You don't have any bookings yet.
                </Typography>
                <Button 
                  component={Link} 
                  to="/vendors" 
                  variant="contained" 
                  sx={{ mt: 2 }}
                >
                  Browse Vendors
                </Button>
              </Box>
            ) : (
              <Stack spacing={2}>
                {recentBookings.map((booking) => (
                  <Card key={booking._id} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent sx={{ pb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="h6">
                            {booking.productName || booking.productId?.name || 'Booking'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {booking.vendorName || booking.vendorId?.name || 'Vendor'}
                          </Typography>
                        </Box>
                        <Chip 
                          label={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)} 
                          color={getStatusColor(booking.status)} 
                          size="small" 
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <EventIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          {booking.date ? formatDate(booking.date) : 'Date not specified'}
                        </Typography>
                      </Box>

                      {booking.location && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <LocationOnIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            {booking.location}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        component={Link}
                        to="/user/bookings"
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Quick Access */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Quick Access
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              <ListItem 
                button 
                component={Link} 
                to="/profile" 
                sx={{ borderRadius: 1, mb: 1 }}
              >
                <ListItemIcon>
                  <PersonIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="My Profile" secondary="View and edit your personal information" />
              </ListItem>
              <ListItem 
                button 
                component={Link} 
                to="/user/bookings" 
                sx={{ borderRadius: 1, mb: 1 }}
              >
                <ListItemIcon>
                  <EventIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="My Bookings" secondary="Manage your event bookings" />
              </ListItem>
              <ListItem 
                button 
                component={Link} 
                to="/user/browse-products" 
                sx={{ borderRadius: 1, mb: 1 }}
              >
                <ListItemIcon>
                  <ShoppingBagIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Browse Products" secondary="Discover and book new services" />
              </ListItem>
              <ListItem 
                button 
                component={Link}
                to="/user/chat" 
                sx={{ borderRadius: 1 }}
              >
                <ListItemIcon>
                  <MessageIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Messages" secondary="Chat with your vendors" />
              </ListItem>
            </List>
          </Paper>

          {/* Recommended Vendors */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Recommended Vendors
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {recommendedVendors.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                No recommendations available at the moment.
              </Typography>
            ) : (
              <Stack spacing={2}>
                {recommendedVendors.map((vendor) => (
                  <Card key={vendor._id} variant="outlined">
                    <CardContent sx={{ pb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {vendor.name?.[0]?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {vendor.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <StarIcon sx={{ color: 'warning.main', fontSize: 16, mr: 0.5 }} />
                            <Typography variant="body2" color="text.secondary">
                              {vendor.rating || '4.5'} ({vendor.reviewCount || '10'} reviews)
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        component={Link}
                        to={`/vendors/${vendor._id}`}
                      >
                        View Services
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </Stack>
            )}
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button 
                component={Link} 
                to="/vendors" 
                endIcon={<ArrowForwardIcon />}
              >
                View All Vendors
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserDashboard;
