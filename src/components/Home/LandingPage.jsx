import { Box, Button, Container, Grid, Typography, Card, CardContent, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import SecurityIcon from '@mui/icons-material/Security';
import GroupsIcon from '@mui/icons-material/Groups';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { motion } from 'framer-motion';
import React from 'react';
import { keyframes } from '@emotion/react';
import { styled } from '@mui/material/styles';
import FloatingFeatureCards from './FloatingFeatureCards';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';


const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const AnimatedCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: theme.shadows[10],
  },
}));

const pricingTiers = [
  {
    title: 'Starter',
    price: '$10/mo (or $8/mo billed annually)',
    features: [
      'Task creation & assignment',
      'Basic task tracking',
      'User authentication',
      '5GB file storage',
      'Email notifications',
    ],
    buttonText: 'Contact Us',
  },
  {
    title: 'Team',
    price: '$25/mo (or $20/mo billed annually)',
    features: [
      'All Starter features',
      'Team collaboration',
      'Role-based access',
      'Subtasks & dependencies',
      '15GB file storage',
      'Customizable notifications',
      'Task reminders',
    ],
    buttonText: 'Contact Us',
    highlighted: true,
  },
  {
    title: 'Business',
    price: '$40/mo (or $32/mo billed annually)',
    features: [
      'All Team features',
      'Advanced reporting',
      'Automated scheduling',
      'Performance tracking',
      'Priority support',
      '50GB file storage',
      'Audit logs',
    ],
    buttonText: 'Contact Us',
  },
  {
    title: 'Enterprise',
    price: 'Custom',
    features: [
      'All Business features',
      'Unlimited users & storage',
      'AI task prioritization',
      'Third-party integrations',
      'Dedicated account manager',
      'Custom branding',
      'Enterprise-grade security',
    ],
    buttonText: 'Contact Us',
  },
];

const testimonials = [
  {
    name: 'John Doe',
    role: 'Project Manager',
    company: 'Tech Corp',
    content: 'WorkZen has transformed how our team collaborates. The efficiency gains are remarkable.',
    avatar: '/path-to-avatar-1.jpg',
  },
  {
    name: 'Jane Smith',
    role: 'Team Lead',
    company: 'Innovation Labs',
    content: 'The analytics features help us make data-driven decisions. Highly recommended!',
    avatar: '/path-to-avatar-2.jpg',
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <TaskAltIcon sx={{ fontSize: 50 }} />,
      title: 'Task Automation',
      description: 'Automate your tasks for increased efficiency and productivity.'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 50 }} />,
      title: 'Real-Time Collaboration',
      description: 'Collaborate with your team in real-time, no matter where you are.'
    },
    {
      icon: <GroupsIcon sx={{ fontSize: 50 }} />,
      title: 'Advanced Analytics',
      description: 'Gain insights into your workflow with our advanced analytics tools.'
    },
    {
      icon: <NotificationsIcon sx={{ fontSize: 50 }} />,
      title: 'Smart Notifications',
      description: 'Stay updated with real-time notifications and alerts.'
    },
    {
      icon: <SupervisorAccountIcon sx={{ fontSize: 50 }} />,
      title: 'Role Management',
      description: 'Flexible user roles and permissions for better control.'
    },
    {
  icon: <SettingsSuggestIcon sx={{ fontSize: 50 }} />,
  title: 'Custom Workflow',
  description: 'Design and manage custom task workflows tailored to your team’s needs.'
}
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(45deg, #0E2954 30%, #1F6E8C 90%)',
          color: 'white',
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          pt: 8,
        }}
      >
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography 
                  variant="h2" 
                  component="h1" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 700,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  Streamline Your Workflow with WorkZen
                </Typography>
                <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                  Effortless Task Management, Real-Time Collaboration, and Advanced Analytics
                </Typography>
                <Box sx={{ mt: 4 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    onClick={() => navigate('/pricing')}
                    sx={{
                      mr: 2,
                      px: 4,
                      py: 1.5,
                      borderRadius: '30px',
                      boxShadow: '0 4px 14px 0 rgba(0,0,0,0.25)',
                    }}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="large"
                    onClick={() => navigate('/about')}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: '30px',
                    }}
                  >
                    Learn More
                  </Button>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative' }}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <FloatingFeatureCards />
                </motion.div>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 12 }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          gutterBottom
          sx={{ mb: 8, fontWeight: 700 }}
        >
          Features
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <AnimatedCard>
                <CardContent sx={{ 
                  textAlign: 'center', 
                  p: 4,
                  height: '100%',
                  background: 'linear-gradient(45deg, #fff 30%, #f5f5f5 90%)'
                }}>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Box sx={{ color: 'primary.main', mb: 2 }}>
                      {feature.icon}
                    </Box>
                  </motion.div>
                  <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </AnimatedCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Pricing Section */}
      <Box sx={{ py: 12, bgcolor: 'grey.50' }}>
        <Container>
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            gutterBottom
            sx={{ mb: 8, fontWeight: 700 }}
          >
            Pricing Plans
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {pricingTiers.map((tier, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <AnimatedCard sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      textAlign: 'center',
                      p: 4,
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Typography variant="h6" component="h3" gutterBottom>
                      {tier.title}
                    </Typography>
                    <Typography variant="h5" component="div" sx={{ mb: 3 }}>
                      {tier.price}
                    </Typography>
                    <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
                      {tier.features.map((feature, featureIndex) => (
                        <Box
                          key={featureIndex}
                          sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                        >
                          <TaskAltIcon sx={{ color: 'success.main', mr: 1 }} />
                          <Typography variant="body1">{feature}</Typography>
                        </Box>
                      ))}
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={() => navigate('/contact')}
                      sx={{ mt: 'auto' }}
                    >
                      {tier.buttonText}
                    </Button>
                  </CardContent>
                </AnimatedCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Container sx={{ py: 12 }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          gutterBottom
          sx={{ mb: 8, fontWeight: 700 }}
        >
          What Our Users Say
        </Typography>
        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={6} key={index}>
              <AnimatedCard>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      src={testimonial.avatar}
                      sx={{ width: 60, height: 60, mr: 2 }}
                    />
                    <Box>
                      <Typography variant="h6">{testimonial.name}</Typography>
                      <Typography color="text.secondary">
                        {testimonial.role} at {testimonial.company}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1">
                    "{testimonial.content}"
                  </Typography>
                </CardContent>
              </AnimatedCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 12,
          background: 'linear-gradient(45deg, #0E2954 30%, #1F6E8C 90%)',
        }}
      >
        <Container>
          <Box textAlign="center">
            <Typography variant="h3" component="h2" gutterBottom>
              Boost Your Team's Productivity Today!
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={() => navigate('/contact')}
              sx={{
                mt: 4,
                px: 6,
                py: 2,
                borderRadius: '30px',
                fontSize: '1.2rem',
              }}
            >
              Get Started for Free
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'primary.dark', color: 'white', py: 6 }}>
        <Container>
          <Grid container spacing={4}>
            <Grid item xs={12} textAlign="center">
              <Typography variant="body2">
                © 2024 WorkZen. All rights reserved.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button color="inherit" onClick={() => navigate('/about')}>About</Button>
                <Button color="inherit" onClick={() => navigate('/features')}>Features</Button>
                <Button color="inherit" onClick={() => navigate('/pricing')}>Pricing</Button>
                <Button color="inherit" onClick={() => navigate('/contact')}>Contact</Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;