import { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem, IconButton, Avatar, ListItemIcon, ListItemText } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Chat from '@mui/icons-material/Chat';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  // Debug user role
  useEffect(() => {
    if (user) {
      console.log('Current user:', user);
      console.log('User role:', user.role);
    }
  }, [user]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'white',
        color: 'primary.main',
        boxShadow: 1
      }}
    >
      <Toolbar sx={{ width: '100%', maxWidth: '100%', px: { xs: 2, sm: 4 } }}>
        <Typography 
          variant="h6" 
          component={Link} 
          to="/" 
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none', 
            color: 'inherit',
            fontWeight: 600,
            fontSize: { xs: '1.2rem', sm: '1.5rem' }
          }}
        >
          UtsavManch
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
        
          <Button 
            color="primary" 
            component={Link} 
            to="/" 
            sx={{ 
              display: { xs: 'none', sm: 'block' }
            }}
          >
            Home
          </Button>

          <Button 
            color="primary" 
            component={Link} 
            to="/vendors" 
            sx={{ 
              display: { xs: 'none', sm: 'block' }
            }}
          >
            Vendors
          </Button>

          {!user ? (
            <>
              <Button 
                color="primary" 
                component={Link} 
                to="/login" 
                sx={{ 
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                Login
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                component={Link} 
                to="/register"
              >
                Register
              </Button>
            </>
          ) : (
            <>
              {user.role === 'vendor' && (
                <Button 
                  color="primary" 
                  component={Link} 
                  to="/vendor/dashboard"
                  sx={{ 
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  Dashboard
                </Button>
              )}
              {user.role === 'admin' && (
                <Button 
                  color="primary" 
                  component={Link} 
                  to="/admin/dashboard"
                  sx={{ 
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  Dashboard
                </Button>
              )}
              {(user.role === 'user' || user.role === 'customer' || (!user.role && user.userType === 'customer')) && (
                <Button 
                  color="primary" 
                  component={Link} 
                  to="/user/dashboard"
                  sx={{ 
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  Dashboard
                </Button>
              )}
              <IconButton onClick={handleMenuOpen} size="small">
                <Avatar sx={{ width: 32, height: 32 }}>
                  {user.name?.[0]?.toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem 
                  component={Link} 
                  to="/profile" 
                  onClick={handleMenuClose}
                >
                  Profile
                </MenuItem>
                {user.role === 'vendor' && (
                  <MenuItem 
                    component={Link} 
                    to="/vendor/dashboard" 
                    onClick={handleMenuClose}
                  >
                    Vendor Dashboard
                  </MenuItem>
                )}
                {user.role === 'admin' && (
                  <MenuItem 
                    component={Link} 
                    to="/admin/dashboard" 
                    onClick={handleMenuClose}
                  >
                    Admin Dashboard
                  </MenuItem>
                )}
                {(user.role === 'user' || user.role === 'customer' || (!user.role && user.userType === 'customer')) && (
                  <MenuItem onClick={() => {
                    navigate('/user/dashboard');
                    handleMenuClose();
                  }}>
                    <ListItemIcon>
                      <DashboardIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Dashboard</ListItemText>
                  </MenuItem>
                )}
                {(user.role === 'user' || user.role === 'customer' || (!user.role && user.userType === 'customer')) && (
                  <MenuItem onClick={() => {
                    navigate('/user/chat');
                    handleMenuClose();
                  }}>
                    <ListItemIcon>
                      <Chat fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Messages</ListItemText>
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
