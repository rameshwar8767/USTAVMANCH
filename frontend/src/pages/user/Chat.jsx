import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  TextField,
  IconButton,
  Badge,
  Divider,
  CircularProgress,
  Button,
  Chip,
  Container
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  EventNote as EventNoteIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { useChat } from '../../hooks/useChat';
import { format } from 'date-fns';

const UserChat = () => {
  const { user } = useAuth();
  const { isUserOnline } = useSocket();
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messageEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const {
    messages,
    sendMessage,
    sendTyping,
    markAsRead,
    typingUsers,
    error: chatError,
    isLoading: isChatLoading,
  } = useChat(selectedChat?._id);

  // Fetch chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/chats`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch chats');
        const data = await response.json();
        setChats(data);
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, []);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when chat is selected
  useEffect(() => {
    if (selectedChat) {
      markAsRead();
    }
  }, [selectedChat, markAsRead]);

  // Handle typing status
  const handleTyping = (e) => {
    setMessage(e.target.value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    sendTyping(true);
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
    }, 1000);
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      await sendMessage(null, file);
      event.target.value = null;
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  // Handle message send
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() && !fileInputRef.current?.files[0]) return;

    try {
      if (fileInputRef.current?.files[0]) {
        await sendMessage(null, fileInputRef.current.files[0]);
        fileInputRef.current.value = null;
      } else {
        await sendMessage(message);
      }
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Render chat list
  const renderChatList = () => (
    <List>
      {chats.map((chat) => {
        const vendor = chat.participants.find((p) => p._id !== user.id);
        const unreadCount = chat.unreadCount?.get(user.id) || 0;
        const booking = chat.bookingId;

        return (
          <ListItem
            key={chat._id}
            button
            selected={selectedChat?._id === chat._id}
            onClick={() => setSelectedChat(chat)}
            sx={{
              borderRadius: 1,
              mb: 1,
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
              },
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <ListItemAvatar>
              <Badge
                color={isUserOnline(vendor._id) ? 'success' : 'error'}
                variant="dot"
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                overlap="circular"
              >
                <Avatar sx={{ bgcolor: 'primary.main' }}>{vendor.name[0]}</Avatar>
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography fontWeight={unreadCount > 0 ? 'bold' : 'normal'}>
                    {vendor.name}
                  </Typography>
                  {booking && (
                    <Chip
                      size="small"
                      label={booking.status}
                      color={
                        booking.status === 'confirmed'
                          ? 'success'
                          : booking.status === 'pending'
                          ? 'warning'
                          : 'error'
                      }
                    />
                  )}
                </Box>
              }
              secondary={
                <>
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.primary"
                    sx={{ fontWeight: unreadCount > 0 ? 'bold' : 'normal' }}
                  >
                    {chat.lastMessage?.content 
                      ? (chat.lastMessage.type === 'image' 
                          ? '📷 Image' 
                          : chat.lastMessage.type === 'file' 
                            ? '📎 File' 
                            : truncateText(chat.lastMessage.content, 30))
                      : 'No messages yet'}
                  </Typography>
                  {chat.lastMessage && (
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      {format(new Date(chat.lastMessage.createdAt), 'HH:mm')}
                    </Typography>
                  )}
                </>
              }
            />
            {unreadCount > 0 && (
              <Badge badgeContent={unreadCount} color="primary" />
            )}
          </ListItem>
        );
      })}
    </List>
  );

  // Render chat messages
  const renderMessages = () => (
    <Box sx={{ p: 2, height: 'calc(100vh - 250px)', overflowY: 'auto' }}>
      {messages.map((msg, index) => {
        const isOwnMessage = msg.senderId === user.id;

        return (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
              mb: 2,
            }}
          >
            {!isOwnMessage && (
              <Avatar 
                sx={{ mr: 1, width: 32, height: 32, bgcolor: 'primary.main' }}
              >
                {selectedChat.participants.find(p => p._id !== user.id).name[0]}
              </Avatar>
            )}
            <Paper
              sx={{
                p: 2,
                backgroundColor: isOwnMessage ? 'primary.main' : 'grey.100',
                color: isOwnMessage ? 'white' : 'text.primary',
                maxWidth: '70%',
                borderRadius: isOwnMessage 
                  ? '16px 16px 0 16px' 
                  : '0 16px 16px 16px',
              }}
            >
              {msg.type === 'text' && <Typography>{msg.content}</Typography>}
              {msg.type === 'image' && (
                <Box
                  component="img"
                  src={msg.content}
                  alt="Shared image"
                  sx={{ maxWidth: '100%', borderRadius: 1 }}
                />
              )}
              {msg.type === 'file' && (
                <Button
                  startIcon={<AttachFileIcon />}
                  href={msg.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: isOwnMessage ? 'white' : 'primary.main' }}
                >
                  {msg.fileName || 'Download File'}
                </Button>
              )}
              <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.8 }}>
                {format(new Date(msg.createdAt), 'HH:mm')}
                {msg.readBy && msg.readBy.includes(selectedChat.participants.find(p => p._id !== user.id)._id) && (
                  <span style={{ marginLeft: '4px' }}>✓✓</span>
                )}
              </Typography>
            </Paper>
          </Box>
        );
      })}
      <div ref={messageEndRef} />
    </Box>
  );

  // Render typing indicator
  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;

    return (
      <Typography variant="caption" sx={{ pl: 2, color: 'text.secondary' }}>
        Vendor is typing...
      </Typography>
    );
  };

  // Render booking details
  const renderBookingDetails = () => {
    if (!selectedChat?.bookingId) return null;

    const booking = selectedChat.bookingId;
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <EventNoteIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle2">
            Booking Details
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Event Date
            </Typography>
            <Typography>
              {format(new Date(booking.date), 'dd MMM yyyy')}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Event Time
            </Typography>
            <Typography>{booking.time}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Status
            </Typography>
            <Chip 
              size="small" 
              label={booking.status}
              color={
                booking.status === 'confirmed'
                  ? 'success'
                  : booking.status === 'pending'
                  ? 'warning'
                  : 'error'
              }
            />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Guest Count
            </Typography>
            <Typography>{booking.guestCount}</Typography>
          </Grid>
          {booking.specialRequests && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Special Requests
              </Typography>
              <Typography variant="body2">{booking.specialRequests}</Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    );
  };

  // Helper function to truncate text
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        My Messages
      </Typography>
      
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Grid container sx={{ height: 'calc(100vh - 200px)' }}>
          <Grid item xs={12} md={3} sx={{ borderRight: 1, borderColor: 'divider' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">
                Conversations
              </Typography>
            </Box>
            {chats.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No conversations yet
                </Typography>
              </Box>
            ) : (
              renderChatList()
            )}
          </Grid>
          <Grid item xs={12} md={9}>
            {selectedChat ? (
              <>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Badge
                      color={isUserOnline(selectedChat.participants.find(p => p._id !== user.id)._id) ? 'success' : 'error'}
                      variant="dot"
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      overlap="circular"
                    >
                      <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
                        {selectedChat.participants.find(p => p._id !== user.id).name[0]}
                      </Avatar>
                    </Badge>
                    <Box>
                      <Typography variant="h6">
                        {selectedChat.participants.find(p => p._id !== user.id).name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {isUserOnline(selectedChat.participants.find(p => p._id !== user.id)._id) 
                          ? 'Online' 
                          : 'Offline'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                {renderBookingDetails()}
                {isChatLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50%' }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    {renderMessages()}
                    {renderTypingIndicator()}
                    <Box
                      component="form"
                      onSubmit={handleSendMessage}
                      sx={{
                        p: 2,
                        borderTop: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        gap: 1,
                      }}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                        accept="image/*,.pdf,.doc,.docx"
                      />
                      <IconButton
                        onClick={() => fileInputRef.current?.click()}
                        color="primary"
                      >
                        <AttachFileIcon />
                      </IconButton>
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Type a message"
                        value={message}
                        onChange={handleTyping}
                        size="small"
                      />
                      <IconButton type="submit" color="primary" disabled={!message.trim() && !fileInputRef.current?.files?.[0]}>
                        <SendIcon />
                      </IconButton>
                    </Box>
                  </>
                )}
              </>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  p: 3,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Select a conversation
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  Choose a vendor from the list to start chatting about your booking
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default UserChat;
