
import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Paper, 
  Box 
} from '@mui/material';
import { Email, Phone, SupportAgent, Feedback, Public } from '@mui/icons-material';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  });

  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle form input change
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatusMessage('');

    try {
      const response = await fetch('http://localhost:3002/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        setStatusMessage("Message sent successfully!");
        setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
      } else {
        setStatusMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setStatusMessage("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container 
      maxWidth="lg" 
      sx={{ marginTop: '80px', padding: '50px 20px', background: 'linear-gradient(to right, #f9f9f9, #e3f2fd)', borderRadius: 3 }}
    >
      <Grid container spacing={6} alignItems="center">
        
        {/* Left Section - Contact Info */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ backgroundColor: 'transparent', padding: 5, borderRadius: 3, boxShadow: 'none' }} elevation={0}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
              Contact Us
            </Typography>
            <Typography variant="body1" paragraph sx={{ color: '#555' }}>
              Reach out via email, phone, or fill out the form to learn how WorkZen can help you.
            </Typography>
            <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
              <Email sx={{ color: '#1976d2' }} />
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>support@workzen.com</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Phone sx={{ color: '#1976d2' }} />
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>+91 9876543210</Typography>
            </Box>

            {/* Support Sections */}
            <Grid container spacing={3} sx={{ mt: 3 }}>
              <Grid item xs={12} md={4}>
                <Box textAlign="center">
                  <SupportAgent sx={{ fontSize: 40, color: '#1976d2' }} />
                  <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold' }}>Customer Support</Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Our support team is available 24/7 for any queries or concerns.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box textAlign="center">
                  <Feedback sx={{ fontSize: 40, color: '#1976d2' }} />
                  <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold' }}>Feedback</Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Your feedback helps shape the future of WorkZen.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box textAlign="center">
                  <Public sx={{ fontSize: 40, color: '#1976d2' }} />
                  <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold' }}>Media Inquiries</Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Contact us at media@workzen.com for press inquiries.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Right Section - Contact Form */}
        <Grid item xs={12} md={5}>
          <Paper 
            sx={{ padding: 3, borderRadius: 3, boxShadow: 6, backgroundColor: 'white', width: '90%', margin: '0 auto', transition: '0.3s', '&:hover': { boxShadow: 10, transform: 'scale(1.02)' } }}
          >
            <Typography variant="h6" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#222' }}>
              Get in Touch
            </Typography>
            <Typography variant="body2" align="center" paragraph sx={{ color: '#555' }}>
              We'd love to hear from you!
            </Typography>

            {/* Contact Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField 
                    label="First Name" 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    variant="outlined" 
                    fullWidth 
                    sx={{ backgroundColor: '#f4f4f4' }} 
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField 
                    label="Last Name" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    variant="outlined" 
                    fullWidth 
                    sx={{ backgroundColor: '#f4f4f4' }} 
                    required
                  />
                </Grid>
              </Grid>
              <TextField 
                label="Your Email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                variant="outlined" 
                type="email" 
                fullWidth 
                sx={{ backgroundColor: '#f4f4f4' }} 
                required
              />
              <TextField 
                label="Phone Number" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                variant="outlined" 
                fullWidth 
                sx={{ backgroundColor: '#f4f4f4' }} 
              />
              <TextField 
                label="How can we help?" 
                name="message"
                value={formData.message}
                onChange={handleChange}
                variant="outlined" 
                multiline 
                rows={3} 
                fullWidth 
                sx={{ backgroundColor: '#f4f4f4' }} 
                required
              />
              <Button 
                type="submit"
                variant="contained" 
                color="primary" 
                fullWidth 
                disabled={loading}
                sx={{ borderRadius: '20px', padding: '10px', fontWeight: 'bold', textTransform: 'none', backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#125a9c' } }}
              >
                {loading ? "Submitting..." : "Submit"}
              </Button>
              {statusMessage && (
                <Typography variant="body2" align="center" sx={{ mt: 1, color: 'green' }}>
                  {statusMessage}
                </Typography>
              )}
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ContactUs;
