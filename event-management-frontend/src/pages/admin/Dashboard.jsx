import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../utils/api';
import { useQuery } from '@tanstack/react-query';

const Dashboard = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [editDialog, setEditDialog] = useState({ open: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, data: null });
  const [error, setError] = useState(null);

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const response = await api.get('/admin/stats');
      return response.data;
    },
    onError: (err) => {
      console.error('Error fetching admin stats:', err);
      setError('Failed to load dashboard statistics');
    }
  });

  // Fetch vendors
  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ['adminVendors'],
    queryFn: async () => {
      const response = await api.get('/admin/vendors');
      return response.data;
    },
    onError: (err) => {
      console.error('Error fetching vendors:', err);
      setError('Failed to load vendors');
    }
  });

  // Fetch bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['adminBookings'],
    queryFn: async () => {
      const response = await api.get('/admin/bookings');
      return response.data;
    },
    onError: (err) => {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings');
    }
  });

  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const response = await api.get('/admin/users');
      return response.data;
    },
    onError: (err) => {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    }
  });

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleEdit = (item) => {
    setEditDialog({ open: true, data: item });
  };

  const handleDelete = (item) => {
    setDeleteDialog({ open: true, data: item });
  };

  const handleEditSubmit = () => {
    // Will be implemented with API call
    setEditDialog({ open: false, data: null });
  };

  const handleDeleteConfirm = () => {
    // Will be implemented with API call
    setDeleteDialog({ open: false, data: null });
  };

  const renderVendors = () => (
    <>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Vendors</Typography>
        <Button variant="contained" color="primary">
          Add New Vendor
        </Button>
      </Box>
      {vendorsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : vendors && vendors.length > 0 ? (
        <List>
          {vendors.map((vendor) => (
            <ListItem
              key={vendor._id}
              component={Paper}
              sx={{ mb: 2, display: 'flex', alignItems: 'center' }}
            >
              <ListItemText
                primary={vendor.name}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      {vendor.category}
                    </Typography>
                    {' — '}
                    <Typography
                      component="span"
                      variant="body2"
                      color={vendor.status === 'active' ? 'success.main' : 'warning.main'}
                    >
                      {vendor.status || 'pending'}
                    </Typography>
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleEdit(vendor)} sx={{ mr: 1 }}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDelete(vendor)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
        <Alert severity="info">No vendors found</Alert>
      )}
    </>
  );

  const renderBookings = () => (
    <>
      <Typography variant="h6" sx={{ mb: 3 }}>Recent Bookings</Typography>
      {bookingsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : bookings && bookings.length > 0 ? (
        <List>
          {bookings.slice(0, 10).map((booking) => (
            <ListItem
              key={booking._id}
              component={Paper}
              sx={{ mb: 2 }}
            >
              <ListItemText
                primary={
                  <Typography variant="subtitle1">
                    {booking.userId?.name || 'Unknown User'} - {booking.vendorId?.name || 'Unknown Vendor'}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography component="span" variant="body2">
                      Date: {new Date(booking.date).toLocaleDateString()}
                    </Typography>
                    <br />
                    <Typography component="span" variant="body2">
                      Amount: ₹{booking.amount?.toLocaleString() || '0'}
                    </Typography>
                    <br />
                    <Typography 
                      component="span" 
                      variant="body2"
                      color={
                        booking.status === 'confirmed' ? 'success.main' : 
                        booking.status === 'pending' ? 'warning.main' : 
                        booking.status === 'cancelled' ? 'error.main' : 'info.main'
                      }
                    >
                      Status: {booking.status || 'pending'}
                    </Typography>
                  </>
                }
              />
              <Box>
                <IconButton color="primary">
                  <CheckIcon />
                </IconButton>
                <IconButton color="error">
                  <CloseIcon />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
      ) : (
        <Alert severity="info">No bookings found</Alert>
      )}
    </>
  );

  const renderUsers = () => (
    <>
      <Typography variant="h6" sx={{ mb: 3 }}>Users</Typography>
      {usersLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : users && users.length > 0 ? (
        <List>
          {users.map((user) => (
            <ListItem
              key={user._id}
              component={Paper}
              sx={{ mb: 2 }}
            >
              <ListItemText
                primary={user.name}
                secondary={
                  <>
                    <Typography component="span" variant="body2">
                      {user.email}
                    </Typography>
                    <br />
                    <Typography
                      component="span"
                      variant="body2"
                      color="primary"
                    >
                      {user.role}
                    </Typography>
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleDelete(user)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
        <Alert severity="info">No users found</Alert>
      )}
    </>
  );

  return (
    <AdminLayout>
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard Overview
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Vendors
                </Typography>
                {statsLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <Typography variant="h4">
                    {stats?.vendorCount || 0}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Bookings
                </Typography>
                {statsLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <Typography variant="h4">
                    {stats?.bookingCount || 0}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Users
                </Typography>
                {statsLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <Typography variant="h4">
                    {stats?.userCount || 0}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Vendors" />
            <Tab label="Bookings" />
            <Tab label="Users" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <Paper sx={{ p: 3 }}>
          {currentTab === 0 && renderVendors()}
          {currentTab === 1 && renderBookings()}
          {currentTab === 2 && renderUsers()}
        </Paper>

        {/* Edit Dialog */}
        <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, data: null })}>
          <DialogTitle>Edit {editDialog.data?.name || 'Item'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              type="text"
              fullWidth
              variant="outlined"
              defaultValue={editDialog.data?.name}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog({ open: false, data: null })}>Cancel</Button>
            <Button onClick={handleEditSubmit} color="primary">Save</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, data: null })}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete {deleteDialog.data?.name || 'this item'}?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, data: null })}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default Dashboard;
