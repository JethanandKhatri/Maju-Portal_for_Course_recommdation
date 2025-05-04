import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress,
  List,
  ListItem,
  Divider,
  Avatar,
  useTheme
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const theme = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    // Initialize conversation with greeting
    if (messages.length === 0) {
      setMessages([
        {
          text: "Hello! I'm your academic advisor chatbot. I can help you with course recommendations and academic planning. How can I assist you today?",
          sender: 'bot'
        }
      ]);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      text: input,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chatbot/response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages
        }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { text: data.response, sender: 'bot' }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        text: "I'm sorry, I encountered an error. Please try again.", 
        sender: 'bot' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      height: '80vh', 
      display: 'flex', 
      flexDirection: 'column',
      maxWidth: '800px',
      margin: 'auto',
      padding: 2,
      bgcolor: 'background.default'
    }}>
      <Paper elevation={3} sx={{ 
        flexGrow: 1, 
        overflow: 'auto',
        mb: 2,
        p: 2,
        bgcolor: 'background.paper'
      }}>
        <List>
          {messages.map((message, index) => (
            <React.Fragment key={index}>
              <ListItem
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 1
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    maxWidth: '70%'
                  }}
                >
                  {message.sender === 'bot' && (
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                      <SmartToyIcon />
                    </Avatar>
                  )}
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      bgcolor: message.sender === 'user' ? 'primary.main' : 'background.paper',
                      color: message.sender === 'user' ? 'primary.contrastText' : 'text.primary'
                    }}
                  >
                    <Typography>{message.text}</Typography>
                  </Paper>
                  {message.sender === 'user' && (
                    <Avatar sx={{ bgcolor: 'secondary.main', ml: 1 }}>
                      <PersonIcon />
                    </Avatar>
                  )}
                </Box>
              </ListItem>
              {index < messages.length - 1 && <Divider />}
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Paper>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={loading}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.paper'
            }
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSend}
          disabled={loading}
          sx={{ minWidth: '100px' }}
        >
          {loading ? <CircularProgress size={24} /> : <SendIcon />}
        </Button>
      </Box>
    </Box>
  );
};

export default Chatbot; 