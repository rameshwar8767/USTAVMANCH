import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../utils/api';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Bookings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [authError, setAuthError] = useState(false);
  const { user, isAdmin } = useAuth();

  // Check if user is logged in and is an admin
  useEffect(() => {
    if (!user || !isAdmin) {
      setAuthError(true);
    }
  }, [user, isAdmin]);

  // Fetch bookings using React Query
  const { 
    data: bookings = [], 
    isLoading, 
    error: queryError,
    refetch 
  } = useQuery({
    queryKey: ['adminBookings'],
    queryFn: async () => {
      try {
        const response = await api.get('/admin/bookings');
        return response.data;
      } catch (err) {
        if (err.response && err.response.status === 401) {
          // Unauthorized - redirect to login
          navigate('/login');
        } else if (err.response && err.response.status === 403) {
          // Forbidden - user is not an admin
          setAuthError(true);
        }
        throw err;
      }
    },
    enabled: !authError && isAdmin, // Don't run the query if there's an auth error or user is not admin
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'primary';
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return <CheckCircleIcon fontSize="small" />;
      case 'cancelled':
        return <CancelIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await api.put(`/admin/bookings/${bookingId}/status`, { status: newStatus });
      refetch();
    } catch (error) {
      console.error('Error updating booking status:', error);
      setError('Failed to update booking status');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = (
      booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.product.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (authError) {
    return (
      <AdminLayout>
        <Alert severity="error" sx={{ m: 2 }}>
          You do not have permission to access this page. Please log in as an administrator.
        </Alert>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/login')}
          sx={{ ml: 2 }}
        >
          Go to Login
        </Button>
      </AdminLayout>
    );
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  if (queryError) {
    return (
      <AdminLayout>
        <Alert severity="error" sx={{ m: 2 }}>
          Error loading bookings: {queryError.message}
          {queryError.response?.status === 401 && (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate('/login')}
              sx={{ ml: 2 }}
            >
              Login
            </Button>
          )}
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Manage Bookings
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <TextField
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 300 }}
              />
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  label="Status Filter"
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>Vendor</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.customer}</TableCell>
                      <TableCell>{booking.vendor}</TableCell>
                      <TableCell>{booking.product}</TableCell>
                      <TableCell>{new Date(booking.date).toLocaleDateString()}</TableCell>
                      <TableCell>${booking.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip
                          label={booking.status}
                          color={getStatusColor(booking.status)}
                          size="small"
                          icon={getStatusIcon(booking.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleStatusChange(booking.id, 'completed')}
                          disabled={booking.status === 'completed' || booking.status === 'cancelled'}
                        >
                          <CheckCircleIcon color="success" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleStatusChange(booking.id, 'cancelled')}
                          disabled={booking.status === 'completed' || booking.status === 'cancelled'}
                        >
                          <CancelIcon color="error" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </AdminLayout>
  );
};

export default Bookings;
