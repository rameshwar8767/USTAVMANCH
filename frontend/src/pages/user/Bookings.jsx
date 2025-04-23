import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Event as EventIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Message as MessageIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import UserLayout from '../../components/user/UserLayout';

const UserBookings = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [dialogType, setDialogType] = useState(null); // 'details', 'review', 'cancel', 'message', 'edit'
  const [review, setReview] = useState({ rating: 0, comment: '' });
  const [message, setMessage] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editBooking, setEditBooking] = useState({
    date: '',
    time: '',
    guestCount: '',
    location: '',
    specialRequests: ''
  });

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch bookings from API
      const response = await api.get('/bookings');
      const bookings = response.data || [];
      console.log('API bookings:', bookings);
      
      // Set bookings state
      setBookings(bookings);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings. Please try again later.');
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
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

  const getFilteredBookings = () => {
    if (!bookings.length) return [];
    
    switch (currentTab) {
      case 0: // All
        return bookings;
      case 1: // Upcoming/Confirmed
        return bookings.filter(booking => 
          booking.status === 'upcoming' || 
          booking.status === 'confirmed' || 
          booking.status === 'pending'
        );
      case 2: // Completed
        return bookings.filter(booking => booking.status === 'completed');
      case 3: // Cancelled
        return bookings.filter(booking => booking.status === 'cancelled');
      default:
        return bookings;
    }
  };

  const handleOpenDialog = (booking, type) => {
    setSelectedBooking(booking);
    setDialogType(type);
    
    if (type === 'review') {
      setReview({ rating: booking.rating || 0, comment: booking.review || '' });
    } else if (type === 'edit') {
      setEditBooking({
        date: booking.date ? new Date(booking.date).toISOString().split('T')[0] : '',
        time: booking.time || '',
        guestCount: booking.guestCount || '',
        location: booking.location || '',
        specialRequests: booking.specialRequests || booking.notes || ''
      });
    }
  };

  const handleCloseDialog = () => {
    setSelectedBooking(null);
    setDialogType(null);
    setReview({ rating: 0, comment: '' });
    setMessage('');
    setCancelReason('');
  };

  const handleSubmitReview = async () => {
    try {
      await api.post(`/bookings/${selectedBooking._id}/review`, {
        rating: review.rating,
        comment: review.comment
      });
      
      setSnackbar({
        open: true,
        message: 'Review submitted successfully!',
        severity: 'success'
      });
      
      fetchBookings(); // Refresh bookings
      handleCloseDialog();
    } catch (err) {
      console.error('Error submitting review:', err);
      setSnackbar({
        open: true,
        message: 'Failed to submit review. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleCancelBooking = async () => {
    try {
      await api.put(`/bookings/${selectedBooking._id}/status`, {
        status: 'cancelled',
        cancelReason
      });
      
      setSnackbar({
        open: true,
        message: 'Booking cancelled successfully!',
        severity: 'success'
      });
      
      fetchBookings(); // Refresh bookings
      handleCloseDialog();
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setSnackbar({
        open: true,
        message: 'Failed to cancel booking. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleSendMessage = async () => {
    try {
      // This would connect to your chat system
      console.log('Sending message to vendor:', selectedBooking.vendorId?.name);
      console.log('Message:', message);
      
      setSnackbar({
        open: true,
        message: 'Message sent successfully!',
        severity: 'success'
      });
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error sending message:', err);
      setSnackbar({
        open: true,
        message: 'Failed to send message. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleUpdateBooking = async () => {
    try {
      await api.put(`/bookings/${selectedBooking._id}`, editBooking);
      
      setSnackbar({
        open: true,
        message: 'Booking updated successfully!',
        severity: 'success'
      });
      
      fetchBookings(); // Refresh bookings
      handleCloseDialog();
    } catch (err) {
      console.error('Error updating booking:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update booking. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      await api.delete(`/bookings/${bookingId}`);
      
      setSnackbar({
        open: true,
        message: 'Booking deleted successfully!',
        severity: 'success'
      });
      
      fetchBookings(); // Refresh bookings
    } catch (err) {
      console.error('Error deleting booking:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete booking. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditBooking(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const filteredBookings = getFilteredBookings();

  return (
    <UserLayout>
      <Typography variant="h4" gutterBottom>
        My Bookings
      </Typography>

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="All Bookings" />
          <Tab label="Upcoming" />
          <Tab label="Completed" />
          <Tab label="Cancelled" />
        </Tabs>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
      ) : getFilteredBookings().length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No bookings found
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {getFilteredBookings().map((booking) => (
            <Grid item xs={12} sm={6} md={4} key={booking._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {booking.productId?.name || 'Unknown Product'}
                  </Typography>
                  <Chip
                    label={booking.status}
                    color={getStatusColor(booking.status)}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <EventIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Date"
                        secondary={booking.date ? format(new Date(booking.date), 'PPP') : 'Not specified'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TimeIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Time"
                        secondary={booking.date ? format(new Date(booking.date), 'p') : 'Not specified'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <LocationIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Location"
                        secondary={booking.location || 'Not specified'}
                      />
                    </ListItem>
                    {booking.attendeesCount && (
                      <ListItem>
                        <ListItemIcon>
                          <MoneyIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Attendees"
                          secondary={booking.attendeesCount}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    onClick={() => handleOpenDialog(booking, 'details')}
                  >
                    View Details
                  </Button>
                  
                  {(booking.status === 'upcoming' || booking.status === 'confirmed' || booking.status === 'pending') && (
                    <Button
                      size="small"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={() => handleOpenDialog(booking, 'cancel')}
                    >
                      Cancel
                    </Button>
                  )}
                  
                  {booking.status === 'completed' && !booking.rating && (
                    <Button
                      size="small"
                      color="primary"
                      startIcon={<StarIcon />}
                      onClick={() => handleOpenDialog(booking, 'review')}
                    >
                      Review
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Booking Details Dialog */}
      {dialogType === 'details' && selectedBooking && (
        <Dialog 
          open={Boolean(selectedBooking)} 
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Booking Details</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={600}>Product Information</Typography>
                <Typography>{selectedBooking.productId?.name || 'Unknown Product'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Vendor: {selectedBooking.vendorId?.name || 'Unknown'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={600}>Booking Information</Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Date:</Typography>
                    <Typography>{formatDate(selectedBooking.date)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Time:</Typography>
                    <Typography>{selectedBooking.time}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Event Type:</Typography>
                    <Typography>{selectedBooking.eventType}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Guest Count:</Typography>
                    <Typography>{selectedBooking.guestCount}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Amount:</Typography>
                    <Typography>₹{selectedBooking.productId?.price || 0}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Status:</Typography>
                    <Chip 
                      label={selectedBooking.status} 
                      color={getStatusColor(selectedBooking.status)} 
                      size="small" 
                    />
                  </Grid>
                </Grid>
              </Grid>
              
              {selectedBooking.location && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={600}>Location</Typography>
                  <Typography>{selectedBooking.location}</Typography>
                </Grid>
              )}
              
              {(selectedBooking.specialRequests || selectedBooking.notes) && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={600}>Special Requests</Typography>
                  <Typography>{selectedBooking.specialRequests || selectedBooking.notes}</Typography>
                </Grid>
              )}
              
              {selectedBooking.rating && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={600}>Your Review</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={selectedBooking.rating} readOnly />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      ({selectedBooking.rating}/5)
                    </Typography>
                  </Box>
                  {selectedBooking.review && (
                    <Typography variant="body2">{selectedBooking.review}</Typography>
                  )}
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Review Dialog */}
      {dialogType === 'review' && selectedBooking && (
        <Dialog 
          open={Boolean(selectedBooking)} 
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Review Your Experience</DialogTitle>
          <DialogContent dividers>
            <Typography gutterBottom>
              {selectedBooking.productId?.name || 'Unknown Product'} by {selectedBooking.vendorId?.name || 'Unknown Vendor'}
            </Typography>
            
            <Box sx={{ my: 2 }}>
              <Typography component="legend">Rating</Typography>
              <Rating
                name="rating"
                value={review.rating}
                onChange={(event, newValue) => {
                  setReview({ ...review, rating: newValue });
                }}
              />
            </Box>
            
            <TextField
              label="Your Review"
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              value={review.comment}
              onChange={(e) => setReview({ ...review, comment: e.target.value })}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleSubmitReview} 
              variant="contained" 
              color="primary"
              disabled={!review.rating}
            >
              Submit Review
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Cancel Booking Dialog */}
      {dialogType === 'cancel' && selectedBooking && (
        <Dialog 
          open={Boolean(selectedBooking)} 
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Cancel Booking</DialogTitle>
          <DialogContent dividers>
            <Typography gutterBottom>
              Are you sure you want to cancel your booking for {selectedBooking.productId?.name || 'Unknown Product'}?
            </Typography>
            
            <TextField
              label="Reason for Cancellation"
              multiline
              rows={3}
              fullWidth
              variant="outlined"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              sx={{ mt: 2 }}
            />
            
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Note: Cancellation policies may apply. Please check with the vendor for any applicable fees.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>No, Keep Booking</Button>
            <Button 
              onClick={handleCancelBooking} 
              variant="contained" 
              color="error"
            >
              Yes, Cancel Booking
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Message Vendor Dialog */}
      {dialogType === 'message' && selectedBooking && (
        <Dialog 
          open={Boolean(selectedBooking)} 
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Message Vendor</DialogTitle>
          <DialogContent dividers>
            <Typography gutterBottom>
              Send a message to {selectedBooking.vendorId?.name || 'the vendor'} regarding your booking.
            </Typography>
            
            <TextField
              label="Your Message"
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleSendMessage} 
              variant="contained" 
              color="primary"
              disabled={!message.trim()}
            >
              Send Message
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Edit Booking Dialog */}
      {dialogType === 'edit' && selectedBooking && (
        <Dialog 
          open={Boolean(selectedBooking)} 
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Update Booking</DialogTitle>
          <DialogContent dividers>
            <Typography gutterBottom>
              Update your booking details for {selectedBooking.productId?.name || 'Unknown Product'}
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date"
                  type="date"
                  fullWidth
                  name="date"
                  value={editBooking.date}
                  onChange={handleEditChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Time"
                  type="time"
                  fullWidth
                  name="time"
                  value={editBooking.time}
                  onChange={handleEditChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Guest Count"
                  type="number"
                  fullWidth
                  name="guestCount"
                  value={editBooking.guestCount}
                  onChange={handleEditChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Location"
                  fullWidth
                  name="location"
                  value={editBooking.location}
                  onChange={handleEditChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Special Requests"
                  multiline
                  rows={3}
                  fullWidth
                  name="specialRequests"
                  value={editBooking.specialRequests}
                  onChange={handleEditChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleUpdateBooking} 
              variant="contained" 
              color="primary"
            >
              Update Booking
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </UserLayout>
  );
};

export default UserBookings;
