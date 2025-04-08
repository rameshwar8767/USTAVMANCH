import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../context/AuthContext';

export const useChat = (chatId) => {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Join chat room
  useEffect(() => {
    if (!socket || !chatId) return;

    socket.emit('chat:join', chatId);

    return () => {
      socket.emit('chat:leave', chatId);
    };
  }, [socket, chatId]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = ({ message }) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on('message:received', handleNewMessage);

    return () => {
      socket.off('message:received', handleNewMessage);
    };
  }, [socket]);

  // Handle typing status
  useEffect(() => {
    if (!socket) return;

    const handleTypingUpdate = ({ userId, isTyping }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    };

    socket.on('typing:updated', handleTypingUpdate);

    return () => {
      socket.off('typing:updated', handleTypingUpdate);
    };
  }, [socket]);

  // Handle read receipts
  useEffect(() => {
    if (!socket) return;

    const handleMessageRead = ({ userId }) => {
      // Update message read status in UI
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          readBy: msg.readBy ? [...msg.readBy, userId] : [userId],
        }))
      );
    };

    socket.on('message:read', handleMessageRead);

    return () => {
      socket.off('message:read', handleMessageRead);
    };
  }, [socket]);

  // Fetch chat history
  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/chats/${chatId}/messages`);
        if (!response.ok) throw new Error('Failed to fetch messages');
        const data = await response.json();
        setMessages(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [chatId]);

  // Send message
  const sendMessage = useCallback(
    async (content, file = null) => {
      if (!socket || !isConnected) {
        throw new Error('Not connected to chat');
      }

      let fileData = null;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/chats/${chatId}/messages`,
          {
            method: 'POST',
            body: formData,
          }
        );
        if (!response.ok) throw new Error('Failed to upload file');
        fileData = await response.json();
      }

      socket.emit('message:new', {
        chatId,
        content: fileData?.url || content,
        type: fileData ? (file.type.startsWith('image/') ? 'image' : 'file') : 'text',
        file: fileData
          ? {
              name: file.name,
              size: file.size,
              url: fileData.url,
            }
          : null,
      });
    },
    [socket, isConnected, chatId]
  );

  // Send typing status
  const sendTyping = useCallback(
    (isTyping) => {
      if (!socket || !isConnected) return;
      socket.emit(`typing:${isTyping ? 'start' : 'stop'}`, { chatId });
    },
    [socket, isConnected, chatId]
  );

  // Mark messages as read
  const markAsRead = useCallback(() => {
    if (!socket || !isConnected) return;
    socket.emit('message:read', { chatId });
  }, [socket, isConnected, chatId]);

  return {
    messages,
    sendMessage,
    sendTyping,
    markAsRead,
    typingUsers: Array.from(typingUsers),
    error,
    isLoading,
  };
};
