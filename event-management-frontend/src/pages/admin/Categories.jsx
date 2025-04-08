import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Switch,
  Tooltip,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';

const Categories = () => {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  // Check if user is logged in and is an admin
  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/login');
    }
  }, [user, isAdmin, navigate]);

  const { data: categories, isLoading, isError } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const response = await api.get('/admin/categories');
      console.log('Fetched categories:', response.data);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (newCategory) => {
      console.log('Creating new category:', newCategory);
      
      // Validate required fields
      if (!newCategory.name || !newCategory.description) {
        throw new Error('Name and description are required');
      }

      return api.post('/admin/categories', {
        name: newCategory.name.trim(),
        description: newCategory.description.trim(),
        icon: newCategory.icon?.trim() || '🎪',
        isActive: true
      });
    },
    onSuccess: (response) => {
      console.log('Category created successfully:', response.data);
      queryClient.invalidateQueries(['admin-categories']);
      handleCloseDialog();
    },
    onError: (error) => {
      console.error('Category creation error:', {
        response: error.response?.data,
        status: error.response?.status,
        message: error.message
      });
      
      let errorMessage = 'Failed to create category';
      if (error.response?.status === 403) {
        errorMessage = 'Access denied. Please make sure you are logged in as an admin.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => {
      // Check if we have a valid ID
      if (!id) {
        throw new Error('Category ID is missing');
      }

      console.log('Attempting to update category:', { 
        id, 
        data,
        token: localStorage.getItem('token'),
        user: user
      });

      return api.put(`/admin/categories/${id}`, data);
    },
    onSuccess: (response) => {
      console.log('Category update success:', response.data);
      queryClient.invalidateQueries(['admin-categories']);
      handleCloseDialog();
    },
    onError: (error) => {
      console.error('Category update error details:', {
        response: error.response?.data,
        status: error.response?.status,
        message: error.message,
        stack: error.stack
      });
      
      let errorMessage = 'Failed to update category';
      if (error.response?.status === 403) {
        errorMessage = 'Access denied. Please make sure you are logged in as an admin.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Category not found.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-categories']);
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Failed to delete category');
    },
  });

  const handleOpenDialog = (category = null) => {
    console.log('Opening dialog with category:', category);
    
    if (category) {
      // Ensure we have all required fields
      if (!category._id) {
        console.error('Category is missing _id:', category);
        setError('Invalid category data received');
        return;
      }
      
      setEditingCategory(category);
      setFormData({
        name: category.name || '',
        description: category.description || '',
        icon: category.icon || '',
        isActive: category.isActive !== undefined ? category.isActive : true
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        icon: '',
        isActive: true
      });
    }
    
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', icon: '' });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Trim the input values
    const name = formData.name.trim();
    const description = formData.description.trim();
    const icon = formData.icon?.trim();

    // Validate required fields
    if (!name || !description) {
      setError('Name and description are required');
      return;
    }

    if (editingCategory) {
      console.log('Editing category:', editingCategory);
      
      if (!editingCategory._id) {
        console.error('Missing category ID for update:', editingCategory);
        setError('Invalid category data: Missing ID');
        return;
      }

      const updateData = {
        name: name,
        description: description,
        icon: icon || editingCategory.icon,
        isActive: formData.isActive !== undefined ? formData.isActive : editingCategory.isActive
      };

      console.log('Submitting category update:', {
        id: editingCategory._id,
        currentData: editingCategory,
        updateData
      });

      updateMutation.mutate({
        id: editingCategory._id,
        data: updateData,
      });
    } else {
      console.log('Creating new category with data:', {
        name,
        description,
        icon
      });

      createMutation.mutate({
        name,
        description,
        icon
      });
    }
  };

  const handleToggleStatus = (category) => {
    updateMutation.mutate({
      id: category._id,
      data: { ...category, isActive: !category.isActive },
    });
  };

  const handleDelete = (category) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(category._id);
    }
  };

  if (isLoading) return <Typography>Loading...</Typography>;
  if (isError) return <Typography color="error">Error loading categories</Typography>;

  return (
    <AdminLayout>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Manage Categories</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Category
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Vendors</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories?.map((category) => {
                // Debug log for each category
                console.log('Rendering category:', category);
                
                // Skip rendering if category data is invalid
                if (!category || typeof category !== 'object') {
                  console.error('Invalid category data:', category);
                  return null;
                }

                // Ensure category has required fields
                if (!category._id) {
                  console.error('Category missing _id:', category);
                  return null;
                }

                return (
                  <TableRow key={category._id}>
                    <TableCell>
                      {category.icon || '🎪'} {category.name || 'Unnamed Category'}
                    </TableCell>
                    <TableCell>{category.description || 'No description'}</TableCell>
                    <TableCell>{category.vendorCount || 0}</TableCell>
                    <TableCell>
                      <Switch
                        checked={category.isActive || false}
                        onChange={() => handleToggleStatus(category)}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton 
                          onClick={() => handleOpenDialog(category)} 
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => handleDelete(category)}
                          size="small"
                          disabled={category.vendorCount > 0}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                margin="normal"
                required
                multiline
                rows={2}
              />
              <TextField
                fullWidth
                label="Icon (emoji)"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                margin="normal"
                placeholder="🎪"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={createMutation.isLoading || updateMutation.isLoading}
              >
                {editingCategory ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default Categories;
