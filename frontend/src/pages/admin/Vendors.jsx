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
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../utils/api';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Vendors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dialog, setDialog] = useState({
    open: false,
    type: null, // 'delete' or 'edit'
    data: null,
  });
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

  // Fetch vendors using React Query
  const { 
    data: vendors = [], 
    isLoading, 
    error: fetchError,
    refetch 
  } = useQuery({
    queryKey: ['adminVendors'],
    queryFn: async () => {
      try {
        const response = await api.get('/admin/vendors');
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
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDeleteClick = (vendor) => {
    setDialog({ open: true, type: 'delete', data: vendor });
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!dialog.data?._id) {
        setError('Invalid vendor data');
        return;
      }

      console.log('Attempting to delete vendor:', dialog.data);
      const response = await api.delete(`/admin/vendors/${dialog.data._id}`);
      
      console.log('Delete response:', response);

      if (response.status === 200) {
        // Clear any existing errors
        setError(null);
        // Close the dialog
        setDialog({ open: false, type: null, data: null });
        // Refresh the vendors list
        await refetch();
      } else {
        setError('Unexpected response from server');
      }
    } catch (error) {
      console.error('Error deleting vendor:', error.response || error);
      setError(
        error.response?.data?.message || 
        error.message ||
        'Failed to delete vendor. Please try again.'
      );
    }
  };

  const handleStatusChange = async (vendor, newStatus) => {
    try {
      setError(null); // Clear any existing errors
      
      if (!vendor._id) {
        console.error('Missing vendor ID:', vendor);
        setError('Invalid vendor data: Missing ID');
        return;
      }

      console.log('Updating vendor status:', {
        vendorId: vendor._id,
        currentStatus: vendor.status,
        newStatus: newStatus
      });

      const response = await api.put(`/admin/vendors/${vendor._id}/status`, { 
        status: newStatus 
      });

      console.log('Status update response:', response);

      if (response.status === 200) {
        // Refresh the vendors list
        await refetch();
      }
    } catch (error) {
      console.error('Error updating vendor status:', error.response || error);
      
      // More specific error messages based on the error type
      if (error.response) {
        if (error.response.status === 404) {
          setError('Vendor not found. The page may be outdated, please refresh.');
        } else if (error.response.status === 403) {
          setError('You do not have permission to update vendor status.');
        } else {
          setError(error.response.data?.message || 'Failed to update vendor status.');
        }
      } else {
        setError('Network error. Please check your connection and try again.');
      }
      
      // Refresh the list to ensure we're showing the correct status
      await refetch();
    }
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (fetchError) {
    return (
      <AdminLayout>
        <Alert severity="error" sx={{ m: 2 }}>
          Error loading vendors: {fetchError.message}
          {fetchError.response?.status === 401 && (
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
          Manage Vendors
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
                placeholder="Search vendors..."
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
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Business Name</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Total Bookings</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredVendors.map((vendor) => (
                    <TableRow key={vendor._id}>
                      <TableCell>{vendor.name}</TableCell>
                      <TableCell>{vendor.ownerName}</TableCell>
                      <TableCell>{vendor.email}</TableCell>
                      <TableCell>{vendor.phone}</TableCell>
                      <TableCell>
                        <Chip
                          label={vendor.status || 'pending'}
                          color={getStatusColor(vendor.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{vendor.totalBookings || 0}</TableCell>
                      <TableCell>{(vendor.rating || 0).toFixed(1)}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleStatusChange(vendor, vendor.status === 'active' ? 'suspended' : 'active')}
                          color={vendor.status === 'active' ? 'error' : 'success'}
                          title={vendor.status === 'active' ? 'Suspend Vendor' : 'Activate Vendor'}
                        >
                          {vendor.status === 'active' ? (
                            <BlockIcon />
                          ) : (
                            <CheckCircleIcon />
                          )}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(vendor)}
                          color="error"
                          title="Delete Vendor"
                        >
                          <DeleteIcon />
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

      <Dialog
        open={dialog.open && dialog.type === 'delete'}
        onClose={() => setDialog({ open: false, type: null, data: null })}
      >
        <DialogTitle>Delete Vendor</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {dialog.data?.name}? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ open: false, type: null, data: null })}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default Vendors;
