import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Alert,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put('/users/profile', data);
      return response.data;
    },
    onSuccess: (data) => {
      updateUser(data);
      queryClient.invalidateQueries(['user']);
      setIsEditing(false);
      setError(null);
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Error updating profile');
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    });
    setIsEditing(false);
    setError(null);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              mr: 3,
              bgcolor: 'primary.main',
              fontSize: '2rem',
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom>
              Profile
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your personal information
            </Typography>
          </Box>
          {!isEditing && (
            <IconButton
              sx={{ ml: 'auto' }}
              onClick={() => setIsEditing(true)}
              color="primary"
            >
              <EditIcon />
            </IconButton>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                multiline
                rows={3}
              />
            </Grid>
            {isEditing && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    startIcon={<CancelIcon />}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={updateProfileMutation.isPending}
                    startIcon={
                      updateProfileMutation.isPending ? (
                        <CircularProgress size={20} />
                      ) : (
                        <SaveIcon />
                      )
                    }
                  >
                    Save Changes
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default Profile;
