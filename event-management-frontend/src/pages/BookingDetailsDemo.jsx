import React from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import BookingDetailsCard from '../components/booking/BookingDetailsCard';
import { useNavigate } from 'react-router-dom';

const BookingDetailsDemo = () => {
  const navigate = useNavigate();
  
  // Sample booking data
  const sampleBooking = {
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

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Booking Details Demo
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          This is a demo of the enhanced booking details card design
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => navigate(-1)}
          sx={{ mb: 4 }}
        >
          Back
        </Button>
      </Box>
      
      <BookingDetailsCard booking={sampleBooking} />
    </Container>
  );
};

export default BookingDetailsDemo;
