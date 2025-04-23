import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Typography,
  Avatar,
  Divider,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import VendorLayout from '../../components/vendor/VendorLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const Profile = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    website: '',
    profileImage: null,
    category: ''
  });

  useEffect(() => {
    // Fetch categories from the API
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    // Fetch vendor profile data from the API
    const fetchVendorProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/vendors/profile`);
        
        if (response.data) {
          console.log('Vendor profile data:', response.data); // Debug log
          
          // Construct the full image URL if needed
          let profileImage = response.data.profileImage;
          if (profileImage) {
            // If it's just a filename, construct the full URL
            if (!profileImage.startsWith('http')) {
              profileImage = `${api.defaults.baseURL}/uploads/${profileImage}`;
            }
            console.log('Profile image URL constructed:', profileImage);
          }
          
          setFormData({
            businessName: response.data.name || '',
            ownerName: response.data.ownerName || '',
            email: response.data.email || '',
            phone: response.data.phone || '',
            address: response.data.address || '',
            description: response.data.description || '',
            website: response.data.website || '',
            profileImage: profileImage,
            category: response.data.category || ''
          });
        }
      } catch (err) {
        console.error('Error fetching vendor profile:', err);
        setError('Failed to load profile data');
        setSnackbar({
          open: true,
          message: 'Failed to load profile data: ' + (err.response?.data?.message || err.message),
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    if (user && user.id) {
      fetchVendorProfile();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.put('/vendors/profile', {
        name: formData.businessName,
        ownerName: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        description: formData.description,
        website: formData.website,
        category: formData.category
      });
      
      setEditing(false);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update profile: ' + (err.response?.data?.message || err.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await api.put('/vendors/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Image upload response:', response.data); // Debug log

      if (response.data && response.data.imageUrl) {
        // Construct the full URL if needed
        let imageUrl = response.data.imageUrl;
        if (!imageUrl.startsWith('http')) {
          imageUrl = `${api.defaults.baseURL}${imageUrl}`;
        }
        console.log('Setting profile image URL:', imageUrl);
        
        setFormData(prev => ({
          ...prev,
          profileImage: imageUrl
        }));
        setSnackbar({
          open: true,
          message: 'Profile image updated successfully!',
          severity: 'success'
        });
      }
    } catch (err) {
      console.error('Error uploading profile image:', err);
      setSnackbar({
        open: true,
        message: 'Failed to upload profile image: ' + (err.response?.data?.message || err.message),
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading && !editing) {
    return (
      <VendorLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <CircularProgress />
        </Box>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Vendor Profile
        </Typography>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar
                  src={formData.profileImage || undefined}
                  sx={{
                    width: 150,
                    height: 150,
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '3rem',
                  }}
                >
                  {formData.businessName ? formData.businessName.charAt(0) : 'V'}
                </Avatar>
                {editing && (
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="label"
                    sx={{ mb: 2 }}
                  >
                    <input 
                      hidden 
                      accept="image/*" 
                      type="file"
                      onChange={handleImageUpload}
                    />
                    <PhotoCameraIcon />
                  </IconButton>
                )}
                <Typography variant="h6" gutterBottom>
                  {formData.businessName || 'Your Business Name'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {formData.ownerName || 'Owner Name'}
                </Typography>
              </Grid>

              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  {!editing ? (
                    <Button
                      startIcon={<EditIcon />}
                      variant="contained"
                      onClick={() => setEditing(true)}
                      disabled={loading}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        startIcon={<CancelIcon />}
                        variant="outlined"
                        onClick={() => setEditing(false)}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button
                        startIcon={<SaveIcon />}
                        variant="contained"
                        onClick={handleSave}
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </Box>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Business Name"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      disabled={!editing || loading}
                      variant={editing ? 'outlined' : 'filled'}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Owner Name"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      disabled={!editing || loading}
                      variant={editing ? 'outlined' : 'filled'}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!editing || loading}
                      variant={editing ? 'outlined' : 'filled'}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!editing || loading}
                      variant={editing ? 'outlined' : 'filled'}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!editing || loading}
                      variant={editing ? 'outlined' : 'filled'}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      disabled={!editing || loading}
                      variant={editing ? 'outlined' : 'filled'}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl 
                      fullWidth 
                      disabled={!editing || loading}
                      variant={editing ? 'outlined' : 'filled'}
                    >
                      <InputLabel>Category</InputLabel>
                      <Select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        label="Category"
                      >
                        {categories.map((category) => (
                          <MenuItem key={category._id} value={category.name}>
                            {category.icon} {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      multiline
                      rows={4}
                      disabled={!editing || loading}
                      variant={editing ? 'outlined' : 'filled'}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </VendorLayout>
  );
};

export default Profile;
