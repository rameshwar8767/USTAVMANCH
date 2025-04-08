import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  CircularProgress,
  Alert,
  Container,
  Snackbar
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Check as AcceptIcon,
  Close as RejectIcon,
  Message as MessageIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import VendorLayout from '../../components/vendor/VendorLayout';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

const Bookings = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [viewDialog, setViewDialog] = useState({ open: false, booking: null });
  const [messageDialog, setMessageDialog] = useState({ open: false, booking: null });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch bookings on component mount
  useEffect(() => {
    if (!user) return;
    fetchBookings();
    fetchProducts();
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      // Fetch bookings from API
      const response = await api.get('/bookings');
      const bookings = response.data || [];
      console.log('API bookings for vendor:', bookings);
      
      // Set bookings state
      setBookings(bookings);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings. Please try again later.');
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      if (!user || !user.id) {
        console.log('User not available for product fetch');
        return;
      }
      
      const response = await api.get('/products', {
        params: { vendorId: user.id }
      });
      setProducts(response.data);
      console.log('Fetched products for price reference:', response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getFilteredBookings = () => {
    if (!bookings.length) return [];
    
    switch (currentTab) {
      case 0: // All
        return bookings;
      case 1: // Pending
        return bookings.filter(booking => booking.status === 'pending');
      case 2: // Confirmed
        return bookings.filter(booking => booking.status === 'confirmed');
      case 3: // Completed
        return bookings.filter(booking => booking.status === 'completed');
      default:
        return bookings;
    }
  };

  const handleAcceptBooking = async (bookingId) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: 'confirmed' });
      fetchBookings(); // Refresh bookings only after successful update
      setSnackbar({
        open: true,
        message: 'Booking accepted successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error accepting booking:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to accept booking. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleRejectBooking = async (bookingId) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: 'cancelled' });
      fetchBookings(); // Refresh bookings only after successful update
      setSnackbar({
        open: true,
        message: 'Booking rejected successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error rejecting booking:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to reject booking. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleViewDetails = (booking) => {
    try {
      // Find the matching product to get the price
      const matchingProduct = products.find(product => 
        product._id === booking.productId || 
        product.name === booking.productName
      );
      
      console.log('Viewing booking details:', booking);
      console.log('Matching product found:', matchingProduct);
      
      setViewDialog({ open: true, booking: { ...booking, matchingProduct } });
    } catch (error) {
      console.error('Error in handleViewDetails:', error);
      // Fallback to just showing the booking without the matching product
      setViewDialog({ open: true, booking });
    }
  };

  const handleMessageCustomer = (booking) => {
    setMessageDialog({ open: true, booking });
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
    <VendorLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>Bookings Management</Typography>
          
          <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="All Bookings" />
            <Tab label="Pending" />
            <Tab label="Confirmed" />
            <Tab label="Completed" />
          </Tabs>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
          ) : filteredBookings.length === 0 ? (
            <Alert severity="info" sx={{ my: 2 }}>No bookings found.</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell>{booking.userName || booking.userId?.name || 'Unknown'}</TableCell>
                      <TableCell>{booking.productName || booking.productId?.name || 'Unknown Product'}</TableCell>
                      <TableCell>{formatDate(booking.date)}</TableCell>
                      <TableCell>₹{booking.price || booking.productId?.price || 0}</TableCell>
                      <TableCell>
                        <Chip 
                          label={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)} 
                          color={getStatusColor(booking.status)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewDetails(booking)}
                          title="View Details"
                        >
                          <ViewIcon />
                        </IconButton>
                        
                        {booking.status === 'pending' && (
                          <>
                            <IconButton 
                              size="small" 
                              color="success" 
                              onClick={() => handleAcceptBooking(booking._id)}
                              title="Accept Booking"
                            >
                              <AcceptIcon />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error" 
                              onClick={() => handleRejectBooking(booking._id)}
                              title="Reject Booking"
                            >
                              <RejectIcon />
                            </IconButton>
                          </>
                        )}
                        
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => handleMessageCustomer(booking)}
                          title="Message Customer"
                        >
                          <MessageIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* View Booking Details Dialog */}
        <Dialog 
          open={viewDialog.open} 
          onClose={() => setViewDialog({ ...viewDialog, open: false })}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: 'primary.main', 
            color: 'white',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box>
              <Typography variant="h5">Booking Details</Typography>
              <Typography variant="subtitle2" sx={{ opacity: 0.8, mt: 0.5 }}>
                Booking ID: {viewDialog.booking?._id?.substring(0, 8) || 'N/A'}
              </Typography>
            </Box>
            <Chip 
              label={viewDialog.booking?.status?.charAt(0).toUpperCase() + viewDialog.booking?.status?.slice(1) || 'Unknown'} 
              color={getStatusColor(viewDialog.booking?.status || 'pending')} 
              sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
            />
          </DialogTitle>
          
          <DialogContent dividers sx={{ p: 0 }}>
            {viewDialog.booking && (
              <Box sx={{ p: 0 }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', md: 'row' },
                  bgcolor: 'background.paper',
                  overflow: 'hidden'
                }}>
                  {/* Left Column */}
                  <Box sx={{ 
                    flex: 1, 
                    p: 3,
                    borderRight: { md: 1 }, 
                    borderColor: { md: 'divider' },
                    bgcolor: 'background.default'
                  }}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" color="primary" gutterBottom sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        fontWeight: 'bold',
                        '&:before': {
                          content: '""',
                          display: 'block',
                          width: 4,
                          height: 24,
                          bgcolor: 'primary.main',
                          mr: 1,
                          borderRadius: 1
                        }
                      }}>
                        Customer Information
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <PersonIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
                        <Typography variant="body1">
                          <Box component="span" sx={{ fontWeight: 'medium', color: 'text.secondary', mr: 1 }}>Name:</Box>
                          {viewDialog.booking.userName || viewDialog.booking.userId?.name || 'Unknown'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <EmailIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
                        <Typography variant="body1">
                          <Box component="span" sx={{ fontWeight: 'medium', color: 'text.secondary', mr: 1 }}>Email:</Box>
                          {viewDialog.booking.userEmail || viewDialog.booking.userId?.email || 'Unknown'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
                        <Typography variant="body1">
                          <Box component="span" sx={{ fontWeight: 'medium', color: 'text.secondary', mr: 1 }}>Phone:</Box>
                          {viewDialog.booking.phone || viewDialog.booking.userId?.phone || viewDialog.booking.contactPhone || 'Not provided'}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box>
                      <Typography variant="h6" color="primary" gutterBottom sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        fontWeight: 'bold',
                        '&:before': {
                          content: '""',
                          display: 'block',
                          width: 4,
                          height: 24,
                          bgcolor: 'primary.main',
                          mr: 1,
                          borderRadius: 1
                        }
                      }}>
                        Event Notes
                      </Typography>
                      
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: '#FFFDE7', borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                          {viewDialog.booking.specialRequests || viewDialog.booking.notes || 'No additional notes provided.'}
                        </Typography>
                      </Paper>
                    </Box>

                    {viewDialog.booking.status === 'cancelled' && viewDialog.booking.cancellationReason && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" color="error" gutterBottom sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          fontWeight: 'bold',
                          '&:before': {
                            content: '""',
                            display: 'block',
                            width: 4,
                            height: 24,
                            bgcolor: 'error.main',
                            mr: 1,
                            borderRadius: 1
                          }
                        }}>
                          Cancellation Reason
                        </Typography>
                        
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#FFEBEE', borderRadius: 1 }}>
                          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'error.main' }}>
                            {viewDialog.booking.cancellationReason}
                          </Typography>
                        </Paper>
                      </Box>
                    )}
                  </Box>
                  
                  {/* Right Column */}
                  <Box sx={{ flex: 1, p: 3 }}>
                    <Typography variant="h6" color="primary" gutterBottom sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      fontWeight: 'bold',
                      '&:before': {
                        content: '""',
                        display: 'block',
                        width: 4,
                        height: 24,
                        bgcolor: 'primary.main',
                        mr: 1,
                        borderRadius: 1
                      }
                    }}>
                      Booking Information
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <Box sx={{ 
                        width: 36, 
                        height: 36, 
                        borderRadius: '50%', 
                        bgcolor: 'primary.light', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        mr: 1.5
                      }}>
                        <EventIcon sx={{ color: 'primary.main' }} />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Product/Service</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {viewDialog.booking.productName || viewDialog.booking.productId?.name || 'Unknown Product'}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12} sm={6}>
                        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                          <Typography variant="body2" color="text.secondary">Date</Typography>
                          <Typography variant="body1">
                            {formatDate(viewDialog.booking.date)}
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                          <Typography variant="body2" color="text.secondary">Time</Typography>
                          <Typography variant="body1">
                            {viewDialog.booking.time || (viewDialog.booking.date ? new Date(viewDialog.booking.date).toLocaleTimeString() : 'Not specified')}
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                          <Typography variant="body2" color="text.secondary">Location</Typography>
                          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationIcon sx={{ fontSize: '1rem', mr: 0.5, color: 'text.secondary' }} />
                            {viewDialog.booking.location || viewDialog.booking.eventLocation || viewDialog.booking.venue || 'Not specified'}
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                          <Typography variant="body2" color="text.secondary">Event Type</Typography>
                          <Typography variant="body1">
                            {viewDialog.booking.eventType || 'Not specified'}
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                          <Typography variant="body2" color="text.secondary">Guest Count</Typography>
                          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                            <PeopleIcon sx={{ fontSize: '1rem', mr: 0.5, color: 'text.secondary' }} />
                            {viewDialog.booking.guestCount || 0}
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, bgcolor: 'primary.light' }}>
                          <Typography variant="body2" color="primary.dark">Amount</Typography>
                          <Typography variant="body1" fontWeight="bold" color="primary.dark">
                            ₹{viewDialog.booking.matchingProduct?.price || viewDialog.booking.price || viewDialog.booking.amount || 0}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                        Booking created on: {viewDialog.booking.createdAt ? new Date(viewDialog.booking.createdAt).toLocaleString() : 'Unknown date'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ px: 3, py: 2, bgcolor: 'background.default' }}>
            {viewDialog.booking?.status === 'pending' && (
              <>
                <Button 
                  variant="contained" 
                  color="success" 
                  onClick={() => {
                    handleAcceptBooking(viewDialog.booking._id);
                    setViewDialog({ ...viewDialog, open: false });
                  }}
                  startIcon={<AcceptIcon />}
                >
                  Accept Booking
                </Button>
                <Button 
                  variant="contained" 
                  color="error"
                  onClick={() => {
                    handleRejectBooking(viewDialog.booking._id);
                    setViewDialog({ ...viewDialog, open: false });
                  }}
                  startIcon={<RejectIcon />}
                >
                  Reject Booking
                </Button>
              </>
            )}
            <Button onClick={() => setViewDialog({ ...viewDialog, open: false })}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Message Customer Dialog */}
        <Dialog open={messageDialog.open} onClose={() => setMessageDialog({ ...messageDialog, open: false })}>
          <DialogTitle>Message Customer</DialogTitle>
          <DialogContent dividers>
            {messageDialog.booking && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  To: {messageDialog.booking.userName || messageDialog.booking.userId?.name || 'Customer'} ({messageDialog.booking.userEmail || messageDialog.booking.userId?.email || 'Unknown'})
                </Typography>
                <TextField
                  label="Message"
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMessageDialog({ ...messageDialog, open: false })}>Cancel</Button>
            <Button variant="contained" color="primary">Send Message</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </VendorLayout>
  );
};

export default Bookings;
