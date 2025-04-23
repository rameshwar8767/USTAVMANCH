import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  CardMedia,
  Alert,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';

// Mock data - will be replaced with API call
const mockProduct = {
  id: 1,
  name: 'Wedding Package - Premium',
  description: 'Complete wedding decoration package including entrance, stage, and seating area',
  price: 75000,
  image: 'https://source.unsplash.com/400x300/?wedding-stage',
  vendor: {
    name: 'Elegant Decorations',
    rating: 4.5,
  },
};

const steps = ['Select Date & Time', 'Enter Details', 'Confirm Booking'];

const BookingPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    date: null,
    time: null,
    name: '',
    email: '',
    phone: '',
    eventType: '',
    specialRequirements: '',
  });

  // This will be replaced with an API call using the productId
  const product = mockProduct;

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Submit booking
      console.log('Booking submitted:', bookingData);
      // This will be replaced with an API call
      navigate('/booking-confirmation');
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleInputChange = (field) => (event) => {
    setBookingData({
      ...bookingData,
      [field]: event.target.value,
    });
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return bookingData.date && bookingData.time;
      case 1:
        return bookingData.name && bookingData.email && bookingData.phone;
      case 2:
        return true;
      default:
        return false;
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Book Service
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {/* Step 1: Date & Time Selection */}
            {activeStep === 0 && (
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <DatePicker
                    label="Event Date"
                    value={bookingData.date}
                    onChange={(newDate) => setBookingData({ ...bookingData, date: newDate })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    disablePast
                  />
                  <TimePicker
                    label="Event Time"
                    value={bookingData.time}
                    onChange={(newTime) => setBookingData({ ...bookingData, time: newTime })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Box>
              </LocalizationProvider>
            )}

            {/* Step 2: Customer Details */}
            {activeStep === 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label="Full Name"
                  value={bookingData.name}
                  onChange={handleInputChange('name')}
                  fullWidth
                  required
                />
                <TextField
                  label="Email"
                  type="email"
                  value={bookingData.email}
                  onChange={handleInputChange('email')}
                  fullWidth
                  required
                />
                <TextField
                  label="Phone Number"
                  value={bookingData.phone}
                  onChange={handleInputChange('phone')}
                  fullWidth
                  required
                />
                <TextField
                  label="Event Location"
                  value={bookingData.location}
                  onChange={handleInputChange('location')}
                  fullWidth
                  required
                />
                <TextField
                  label="Event Type"
                  value={bookingData.eventType}
                  onChange={handleInputChange('eventType')}
                  fullWidth
                />
                <TextField
                  label="Special Requirements"
                  value={bookingData.specialRequirements}
                  onChange={handleInputChange('specialRequirements')}
                  multiline
                  rows={4}
                  fullWidth
                />
              </Box>
            )}

            {/* Step 3: Confirmation */}
            {activeStep === 2 && (
              <Box>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Please review your booking details before confirming.
                </Alert>
                <Typography variant="h6" gutterBottom>
                  Booking Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body1">Date:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">
                      {bookingData.date?.toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">Time:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">
                      {bookingData.time?.toLocaleTimeString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">Name:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">{bookingData.name}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">Email:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">{bookingData.email}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">Phone:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">{bookingData.phone}</Typography>
                  </Grid>
                </Grid>
              </Box>
            )}

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid()}
              >
                {activeStep === steps.length - 1 ? 'Confirm Booking' : 'Next'}
              </Button>
            </Box>
          </Grid>

          {/* Product Summary */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={product.image}
                alt={product.name}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {product.description}
                </Typography>
                <Typography variant="h6" color="primary">
                  ₹{product.price.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  By {product.vendor.name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default BookingPage;
