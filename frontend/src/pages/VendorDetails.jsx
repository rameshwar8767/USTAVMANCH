import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Tabs,
  Tab,
  ImageList,
  ImageListItem,
  Rating,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  Stack
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useQuery, useMutation } from '@tanstack/react-query';
import api, { BACKEND_URL } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const VendorDetails = () => {
  const { id } = useParams();
  const decodedId = decodeURIComponent(id);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Enhanced booking state
  const [bookingDate, setBookingDate] = useState(null);
  const [bookingTime, setBookingTime] = useState(null);
  const [bookingLocation, setBookingLocation] = useState('');
  const [attendeesCount, setAttendeesCount] = useState('');
  const [eventType, setEventType] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  const [openBooking, setOpenBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Add image dialog state
  const [openImageDialog, setOpenImageDialog] = useState(false);

  // Fetch vendor details
  const { data: vendor, isLoading, error } = useQuery({
    queryKey: ['vendor', decodedId],
    queryFn: async () => {
      const response = await api.get(`/vendors/${decodedId}`);
      return response.data;
    }
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      try {
        // Call the API to create a booking
        const response = await api.post('/bookings', bookingData);
        return response.data;
      } catch (error) {
        console.error('Error creating booking:', error);
        throw error; // Re-throw the error to be handled by the onError callback
      }
    },
    onSuccess: (data) => {
      // Show success message
      setSnackbar({
        open: true,
        message: 'Booking created successfully!',
        severity: 'success'
      });
      
      // Navigate to booking confirmation page
      navigate(`/booking-confirmation/${data._id}`);
    },
    onError: (error) => {
      // Show error message
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to create booking. Please try again.',
        severity: 'error'
      });
    }
  });

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleBookNow = (product) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/vendors/${id}` } });
      return;
    }
    setSelectedProduct(product);
    resetBookingForm();
    setOpenBooking(true);
  };

  const resetBookingForm = () => {
    setBookingDate(null);
    setBookingTime(null);
    setBookingLocation('');
    setAttendeesCount('');
    setEventType('');
    setBookingNotes('');
    setContactPhone('');
    setFormErrors({});
    setBookingError('');
  };

  const validateForm = () => {
    const errors = {};
    if (!bookingDate) errors.date = 'Date is required';
    if (!bookingTime) errors.time = 'Time is required';
    if (!bookingLocation) errors.location = 'Location is required';
    if (!attendeesCount) errors.attendees = 'Number of attendees is required';
    if (!eventType) errors.eventType = 'Event type is required';
    if (!contactPhone) errors.phone = 'Contact phone is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBookingSubmit = () => {
    if (!validateForm()) return;

    // Combine date and time
    const bookingDateTime = new Date(bookingDate);
    if (bookingTime) {
      const timeDate = new Date(bookingTime);
      bookingDateTime.setHours(timeDate.getHours());
      bookingDateTime.setMinutes(timeDate.getMinutes());
    }

    // Format time as string (HH:MM)
    const formattedTime = bookingTime 
      ? `${bookingTime.getHours().toString().padStart(2, '0')}:${bookingTime.getMinutes().toString().padStart(2, '0')}`
      : bookingDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Create booking data with proper field names
    const bookingData = {
      productId: selectedProduct._id,
      vendorId: vendor._id,
      date: bookingDateTime.toISOString(), // Format date as ISO string
      time: formattedTime,
      eventType: eventType || "Other",
      guestCount: parseInt(attendeesCount) || 1,
      specialRequests: bookingNotes || '',
      amount: selectedProduct.price || 0
    };
    
    console.log('Submitting booking data:', bookingData);
    
    createBookingMutation.mutate(bookingData);
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setOpenImageDialog(true);
  };

  const handleCloseImageDialog = () => {
    setOpenImageDialog(false);
    setSelectedImage(null);
  };

  // Function to get complete image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/uploads/')) {
      return `${import.meta.env.VITE_API_URL}${imageUrl}`;
    }
    return null;
  };

  // Function to get image URL from product image
  const getProductImageUrl = (image) => {
    if (!image) return null;
    if (typeof image === 'string') return getImageUrl(image);
    return getImageUrl(image.url);
  };

  // Function to get all images from vendor and products
  const getAllImages = () => {
    const images = [];
    
    // Add vendor images
    if (vendor.images && Array.isArray(vendor.images)) {
      images.push(...vendor.images.map(img => getImageUrl(img)).filter(Boolean));
    }

    // Add product images
    if (vendor.products && Array.isArray(vendor.products)) {
      vendor.products.forEach(product => {
        if (product.images && Array.isArray(product.images)) {
          images.push(...product.images.map(img => getProductImageUrl(img)).filter(Boolean));
        }
      });
    }

    return images.filter(Boolean); // Remove any null/undefined values
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Error loading vendor details: {error.message}</Alert>
      </Container>
    );
  }

  if (!vendor) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Vendor not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {vendor && (
        <>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  {vendor.images && vendor.images[0] && (
                    <CardMedia
                      component="img"
                      height="300"
                      image={getImageUrl(vendor.images[0])}
                      alt={vendor.name}
                      sx={{ objectFit: 'cover', cursor: 'pointer', borderRadius: 1 }}
                      onClick={() => handleImageClick(getImageUrl(vendor.images[0]))}
                    />
                  )}
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="h4" gutterBottom>
                    {vendor.name}
                  </Typography>
                  <Rating value={vendor.rating || 0} readOnly precision={0.5} />
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    ({vendor.reviews?.length || 0} reviews)
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    {vendor.description}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Stack direction="row" spacing={2}>
                      {vendor.location && (
                        <Chip icon={<LocationOnIcon />} label={vendor.location} />
                      )}
                      {vendor.phone && (
                        <Chip icon={<PhoneIcon />} label={vendor.phone} />
                      )}
                      {vendor.email && (
                        <Chip icon={<EmailIcon />} label={vendor.email} />
                      )}
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={selectedTab} onChange={handleTabChange}>
              <Tab label="PRODUCTS & SERVICES" />
              <Tab label="GALLERY" />
              <Tab label="REVIEWS" />
            </Tabs>
          </Box>

          {selectedTab === 0 && (
            <Grid container spacing={3}>
              {vendor.products?.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product._id}>
                  <Card>
                    {product.images && product.images.length > 0 && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={getProductImageUrl(product.images[0])}
                        alt={product.name}
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleImageClick(getProductImageUrl(product.images[0]))}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {product.description}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ₹{product.price}
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={() => handleBookNow(product)}
                      >
                        Book Now
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {selectedTab === 1 && (
            <ImageList cols={3} gap={8}>
              {getAllImages().map((image, index) => (
                <ImageListItem key={index} sx={{ cursor: 'pointer' }}>
                  <img
                    src={image}
                    alt={`Gallery image ${index + 1}`}
                    loading="lazy"
                    style={{ height: '200px', objectFit: 'cover' }}
                    onClick={() => handleImageClick(image)}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )}

          {selectedTab === 2 && (
            <Box>
              {vendor.reviews?.length > 0 ? (
                vendor.reviews.map((review, index) => (
                  <Card key={index} sx={{ mb: 2 }}>
                    <CardContent>
                      <Rating value={review.rating} readOnly size="small" />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {review.comment}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {new Date(review.date).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No reviews yet.
                </Typography>
              )}
            </Box>
          )}

          {/* Image Preview Dialog */}
          <Dialog
            open={openImageDialog}
            onClose={handleCloseImageDialog}
            maxWidth="md"
            fullWidth
          >
            <DialogContent sx={{ p: 0 }}>
              {selectedImage && (
                <img
                  src={selectedImage}
                  alt="Preview"
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '80vh',
                    objectFit: 'contain'
                  }}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseImageDialog}>Close</Button>
            </DialogActions>
          </Dialog>

          {/* Booking Dialog */}
          <Dialog open={openBooking} onClose={() => setOpenBooking(false)} maxWidth="md" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="h5">Book {selectedProduct?.name}</Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Please provide all the details for your booking
              </Typography>
            </DialogTitle>
            <Divider />
            <DialogContent>
              {bookingError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {bookingError}
                </Alert>
              )}
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Event Date"
                      value={bookingDate}
                      onChange={setBookingDate}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!formErrors.date,
                          helperText: formErrors.date,
                          InputProps: {
                            startAdornment: (
                              <EventIcon color="action" sx={{ mr: 1 }} />
                            ),
                          },
                        },
                      }}
                      minDate={new Date()}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <TimePicker
                      label="Event Time"
                      value={bookingTime}
                      onChange={setBookingTime}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!formErrors.time,
                          helperText: formErrors.time,
                          InputProps: {
                            startAdornment: (
                              <AccessTimeIcon color="action" sx={{ mr: 1 }} />
                            ),
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Event Location"
                    value={bookingLocation}
                    onChange={(e) => setBookingLocation(e.target.value)}
                    error={!!formErrors.location}
                    helperText={formErrors.location}
                    InputProps={{
                      startAdornment: (
                        <LocationOnIcon color="action" sx={{ mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Number of Attendees"
                    type="number"
                    value={attendeesCount}
                    onChange={(e) => setAttendeesCount(e.target.value)}
                    error={!!formErrors.attendees}
                    helperText={formErrors.attendees}
                    InputProps={{
                      startAdornment: (
                        <PeopleIcon color="action" sx={{ mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!formErrors.eventType}>
                    <InputLabel id="event-type-label">Event Type</InputLabel>
                    <Select
                      labelId="event-type-label"
                      value={eventType}
                      label="Event Type"
                      onChange={(e) => setEventType(e.target.value)}
                    >
                      <MenuItem value="wedding">Wedding</MenuItem>
                      <MenuItem value="birthday">Birthday</MenuItem>
                      <MenuItem value="corporate">Corporate Event</MenuItem>
                      <MenuItem value="conference">Conference</MenuItem>
                      <MenuItem value="party">Party</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                    {formErrors.eventType && (
                      <FormHelperText>{formErrors.eventType}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Contact Phone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    error={!!formErrors.phone}
                    helperText={formErrors.phone}
                    InputProps={{
                      startAdornment: (
                        <PhoneIcon color="action" sx={{ mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Additional Notes"
                    placeholder="Any special requirements or details about your event"
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button 
                onClick={() => setOpenBooking(false)} 
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleBookingSubmit}
                disabled={createBookingMutation.isPending}
                startIcon={createBookingMutation.isPending ? <CircularProgress size={20} /> : null}
              >
                Confirm Booking
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Container>
  );
};

export default VendorDetails;
