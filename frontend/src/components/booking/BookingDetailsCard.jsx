import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Divider,
  Paper,
  Avatar,
  useTheme
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

const BookingDetailsCard = ({ booking }) => {
  const theme = useTheme();
  
  // Sample booking data for demonstration
  const bookingData = booking || {
    _id: 'BOOK123456',
    customerName: 'Sarvesh L Asawa',
    customerEmail: 'jklm@abc.com',
    customerPhone: '1230123012',
    productName: 'ABCD',
    date: '2025-04-04',
    time: '3:10:00 am',
    location: 'Nani Peth',
    eventType: 'party',
    guestCount: '100',
    amount: '100',
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return { bg: '#e6f7ee', color: '#00a854', borderColor: '#b7eb8f' };
      case 'pending':
        return { bg: '#fff7e6', color: '#fa8c16', borderColor: '#ffd591' };
      case 'completed':
        return { bg: '#e6f7ff', color: '#1890ff', borderColor: '#91d5ff' };
      case 'cancelled':
        return { bg: '#fff1f0', color: '#f5222d', borderColor: '#ffa39e' };
      default:
        return { bg: '#f5f5f5', color: '#8c8c8c', borderColor: '#d9d9d9' };
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit' 
      });
    } catch (error) {
      return dateString;
    }
  };

  const statusColors = getStatusColor(bookingData.status);

  return (
    <Card 
      elevation={3} 
      sx={{ 
        maxWidth: 800, 
        margin: '0 auto',
        overflow: 'hidden',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      {/* Header */}
      <Box sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        py: 3,
        px: 4,
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 120,
          height: 120,
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.1)',
          zIndex: 0
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 160,
          height: 160,
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.05)',
          zIndex: 0
        }} />
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Booking Details
          </Typography>
          <Typography variant="subtitle1">
            Booking ID: {bookingData._id?.substring(0, 8) || 'N/A'}
          </Typography>
        </Box>
        
        <Chip 
          label={bookingData.status?.charAt(0).toUpperCase() + bookingData.status?.slice(1) || 'Unknown'}
          sx={{ 
            position: 'absolute',
            top: 16,
            right: 16,
            fontWeight: 'bold',
            backgroundColor: statusColors.bg,
            color: statusColors.color,
            border: `1px solid ${statusColors.borderColor}`,
            zIndex: 1
          }}
        />
      </Box>

      <CardContent sx={{ p: 0 }}>
        <Grid container>
          {/* Left Column - Customer Information */}
          <Grid item xs={12} md={5} sx={{ 
            p: 3, 
            backgroundColor: theme.palette.background.default,
            borderRight: { md: `1px solid ${theme.palette.divider}` }
          }}>
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2,
                  pb: 1,
                  position: 'relative',
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: 50,
                    height: 3,
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: 1
                  }
                }}
              >
                Customer Information
              </Typography>
              
              <Paper elevation={0} sx={{ p: 2, mb: 2, backgroundColor: 'white', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.light, mr: 2 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Name</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {bookingData.customerName}
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    mr: 2, 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: '#e6f7ff'
                  }}>
                    <EmailIcon color="primary" />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">
                      {bookingData.customerEmail}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                    mr: 2, 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: '#fff2e8'
                  }}>
                    <PhoneIcon sx={{ color: '#fa541c' }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1">
                      {bookingData.customerPhone}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
              
              <Box sx={{ 
                mt: 4, 
                p: 2, 
                borderRadius: 2, 
                backgroundColor: '#fffbe6',
                border: '1px solid #ffe58f'
              }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 'medium' }}>
                  Booking created on
                </Typography>
                <Typography variant="body2">
                  {bookingData.createdAt ? new Date(bookingData.createdAt).toLocaleString() : 'Unknown'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          {/* Right Column - Booking Information */}
          <Grid item xs={12} md={7} sx={{ p: 3 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 3,
                pb: 1,
                position: 'relative',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: 50,
                  height: 3,
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: 1
                }
              }}
            >
              Booking Information
            </Typography>
            
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 2,
                backgroundColor: 'white',
                border: '1px solid',
                borderColor: theme.palette.divider
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box sx={{ 
                  mr: 2, 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: theme.palette.primary.light
                }}>
                  <CategoryIcon sx={{ color: theme.palette.primary.main }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Product/Service</Typography>
                  <Typography variant="h6" fontWeight="medium">
                    {bookingData.productName}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      mr: 2, 
                      width: 36, 
                      height: 36, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: '#f6ffed'
                    }}>
                      <CalendarIcon sx={{ color: '#52c41a' }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Date</Typography>
                      <Typography variant="body1">
                        {formatDate(bookingData.date)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      mr: 2, 
                      width: 36, 
                      height: 36, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: '#e6f7ff'
                    }}>
                      <TimeIcon sx={{ color: '#1890ff' }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Time</Typography>
                      <Typography variant="body1">
                        {bookingData.time}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      mr: 2, 
                      width: 36, 
                      height: 36, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: '#f9f0ff'
                    }}>
                      <LocationIcon sx={{ color: '#722ed1' }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Location</Typography>
                      <Typography variant="body1">
                        {bookingData.location}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      mr: 2, 
                      width: 36, 
                      height: 36, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: '#fff2e8'
                    }}>
                      <EventIcon sx={{ color: '#fa541c' }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Event Type</Typography>
                      <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                        {bookingData.eventType}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      mr: 2, 
                      width: 36, 
                      height: 36, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: '#e6fffb'
                    }}>
                      <PeopleIcon sx={{ color: '#13c2c2' }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Guest Count</Typography>
                      <Typography variant="body1">
                        {bookingData.guestCount}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.primary.dark
                  }}>
                    <Box sx={{ 
                      mr: 2, 
                      width: 36, 
                      height: 36, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: 'white'
                    }}>
                      <MoneyIcon sx={{ color: theme.palette.primary.main }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>Amount</Typography>
                      <Typography variant="h6" fontWeight="bold">
                        ₹{bookingData.amount}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default BookingDetailsCard;
