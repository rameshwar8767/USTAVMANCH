import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Container,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Payment as PaymentIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state?.bookingData || {
    id: 'BK' + Math.random().toString(36).substr(2, 6).toUpperCase(),
    product: 'Premium Decoration Package',
    vendor: 'Elegant Decorations',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    eventType: 'Wedding',
    guestCount: 200,
    amount: 45000,
    location: 'Crystal Hall, Mumbai',
    paymentStatus: 'Pending',
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChatWithVendor = () => {
    // Navigate to chat with the vendor
    navigate('/chat');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Booking Confirmed!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            Your booking has been successfully confirmed. We've sent a confirmation email with all the details.
          </Typography>
          <Typography variant="h6" color="primary" gutterBottom>
            Booking ID: {bookingData.id}
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom align="left">
              Booking Details
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <EventIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Event Date"
                  secondary={bookingData.date}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TimeIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Event Time"
                  secondary={bookingData.time}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Number of Guests"
                  secondary={bookingData.guestCount}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocationIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Location"
                  secondary={bookingData.location}
                />
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom align="left">
              Payment Information
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <PaymentIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Amount"
                  secondary={`₹${bookingData.amount.toLocaleString()}`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PaymentIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Payment Status"
                  secondary={bookingData.paymentStatus}
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body1" gutterBottom>
            Have questions about your booking?
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ChatIcon />}
            onClick={handleChatWithVendor}
            sx={{ mr: 2 }}
          >
            Chat with Vendor
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate('/user/bookings')}
            sx={{ mr: 2 }}
          >
            View My Bookings
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </Box>

        <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 1, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            For any assistance, please contact our support team:
            <br />
            Email: support@eventmanagement.com
            <br />
            Phone: +91 98765 43210
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default BookingConfirmation;
