import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  Grid,
  TextField,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { format } from 'date-fns';

const steps = ['Select Date & Time', 'Event Details', 'Review & Confirm'];

const BookingPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    date: null,
    time: null,
    eventType: '',
    guestCount: '',
    specialRequests: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
  });
  const [error, setError] = useState('');

  // Get product data from location state or use mock data
  const product = location.state?.product || {
    id: productId,
    name: 'Premium Decoration Package',
    description: 'Luxury decoration package for premium events',
    price: 45000,
    vendorName: 'Elegant Decorations',
    vendorId: 1,
    image: 'https://source.unsplash.com/random/400x300?decoration',
    features: [
      'Complete venue decoration',
      'Premium flower arrangements',
      'Customized theme design',
      'LED lighting setup',
      'Setup and cleanup included',
    ],
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevStep) => prevStep + 1);
      setError('');
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const validateStep = () => {
    switch (activeStep) {
      case 0:
        if (!bookingData.date || !bookingData.time) {
          setError('Please select both date and time');
          return false;
        }
        break;
      case 1:
        if (!bookingData.eventType || !bookingData.guestCount) {
          setError('Please fill in all required fields');
          return false;
        }
        if (isNaN(bookingData.guestCount) || bookingData.guestCount < 1) {
          setError('Please enter a valid number of guests');
          return false;
        }
        break;
      case 2:
        if (!bookingData.contactName || !bookingData.contactPhone || !bookingData.contactEmail) {
          setError('Please fill in all contact details');
          return false;
        }
        if (!bookingData.contactEmail.includes('@')) {
          setError('Please enter a valid email address');
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  };

  const handleSubmit = () => {
    if (validateStep()) {
      // Will be replaced with API call
      const formattedData = {
        ...bookingData,
        date: format(bookingData.date, 'yyyy-MM-dd'),
        time: format(bookingData.time, 'HH:mm'),
        productId: product.id,
        productName: product.name,
        amount: product.price,
        vendor: product.vendorName,
        vendorId: product.vendorId,
      };
      
      // Navigate to confirmation page with booking data
      navigate('/booking/confirmation', { state: { bookingData: formattedData } });
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Event Date"
                value={bookingData.date}
                onChange={(newDate) => setBookingData({ ...bookingData, date: newDate })}
                sx={{ width: '100%' }}
                slotProps={{ textField: { fullWidth: true } }}
                minDate={new Date()}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TimePicker
                label="Event Time"
                value={bookingData.time}
                onChange={(newTime) => setBookingData({ ...bookingData, time: newTime })}
                sx={{ width: '100%' }}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Event Type</InputLabel>
                <Select
                  value={bookingData.eventType}
                  label="Event Type"
                  onChange={(e) => setBookingData({ ...bookingData, eventType: e.target.value })}
                >
                  <MenuItem value="wedding">Wedding</MenuItem>
                  <MenuItem value="corporate">Corporate Event</MenuItem>
                  <MenuItem value="birthday">Birthday Party</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number of Guests"
                type="number"
                value={bookingData.guestCount}
                onChange={(e) => setBookingData({ ...bookingData, guestCount: e.target.value })}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Special Requests"
                multiline
                rows={4}
                value={bookingData.specialRequests}
                onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Name"
                value={bookingData.contactName}
                onChange={(e) => setBookingData({ ...bookingData, contactName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Phone"
                value={bookingData.contactPhone}
                onChange={(e) => setBookingData({ ...bookingData, contactPhone: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contact Email"
                type="email"
                value={bookingData.contactEmail}
                onChange={(e) => setBookingData({ ...bookingData, contactEmail: e.target.value })}
                required
              />
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <CardMedia
                component="img"
                height="200"
                image={product.image}
                alt={product.name}
                sx={{ borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <Typography variant="h5" gutterBottom>
                {product.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {product.description}
              </Typography>
              <Typography variant="h6" color="primary" gutterBottom>
                ₹{product.price.toLocaleString()}
              </Typography>
              <Box sx={{ mt: 2 }}>
                {product.features.map((feature, index) => (
                  <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    • {feature}
                  </Typography>
                ))}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          {activeStep !== 0 && (
            <Button onClick={handleBack} sx={{ mr: 1 }}>
              Back
            </Button>
          )}
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
          >
            {activeStep === steps.length - 1 ? 'Submit Booking' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default BookingPage;
