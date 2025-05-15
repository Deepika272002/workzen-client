
import React from 'react';
import { Box, Button, Container, Grid, Typography, Card, CardContent, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import SecurityIcon from '@mui/icons-material/Security';
import GroupsIcon from '@mui/icons-material/Groups';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';

const AnimatedCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.3s, box-shadow 0.3s',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '100%', // Ensure all cards have the same height
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: theme.shadows[10],
  },
}));

const features = [
  {
    icon: <TaskAltIcon sx={{ fontSize: 50 }} />, 
    title: 'Task Automation', 
    description: 'Optimize workflows with AI-driven task management and intelligent tracking capabilities.'
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 50 }} />, 
    title: 'Enterprise-Grade Security', 
    description: 'Ensure data integrity with role-based access, encrypted communication, and compliance standards.'
  },
  {
    icon: <GroupsIcon sx={{ fontSize: 50 }} />, 
    title: 'Real-Time Collaboration', 
    description: 'Enhance teamwork with real-time task updates, mentions, and project discussions.'
  },
  {
    icon: <NotificationsIcon sx={{ fontSize: 50 }} />, 
    title: 'Smart Notifications', 
    description: 'Get instant updates and alerts to ensure seamless task completion and deadline adherence.'
  },
  {
    icon: <SupervisorAccountIcon sx={{ fontSize: 50 }} />, 
    title: 'Advanced Role Management', 
    description: 'Define hierarchical access levels with precision to ensure smooth organizational workflow.'
  },
  {
  icon: <SettingsSuggestIcon sx={{ fontSize: 50 }} />,
  title: 'Custom Workflow',
  description: 'Design and manage custom task workflows tailored to your team’s needs.'
}
];

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          color: 'white',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          px: 3,
          py: 10,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'url("https://www.shutterstock.com/image-photo/checklist-clipboard-task-management-verifying-260nw-2385170463.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'brightness(0.25) contrast(1.1)', // Faded background for readability
            zIndex: -1,
          }}
        />

        <Container>
          <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={8} sx={{ mx: 'auto', textAlign: 'center' }}>
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
    
    {/* Main Title */}
    <Typography 
      variant="h3" 
      gutterBottom 
      sx={{ 
        fontWeight: 700, 
        textShadow: '2px 2px 4px rgba(0,0,0,0.2)', 
        color: 'white' // Keeping the earlier color scheme
      }}
    >
      About WorkZen
    </Typography>

    {/* Subtitle with subtle color */}
    <Typography 
      variant="h5" 
      sx={{ 
        opacity: 0.9, 
        mb: 3, 
        color: 'white' // Keeping original contrast
      }}
    >
      Elevate your workflow with a seamless, AI-driven task management experience.
    </Typography>

    {/* Description */}
    <Typography 
      variant="body1" 
      sx={{ 
        mb: 4, 
        fontSize: '1.2rem', 
        lineHeight: 1.6, 
        maxWidth: '800px', 
        mx: 'auto', 
        color: 'white' // Original theme colors
      }}
    >
      WorkZen is designed to enhance productivity, streamline workflows, and foster seamless collaboration. 
      With intuitive automation, advanced analytics, and secure role management, teams can focus on what truly matters. 
      Whether managing projects, delegating tasks, or tracking progress, WorkZen empowers you to work smarter.
    </Typography>

    {/* Call to Action Button */}
    <Button
      variant="contained"
      color="secondary"
      size="large"
      onClick={() => navigate('/contact')}
      sx={{ px: 5, py: 1.8, fontSize: '1.2rem', borderRadius: '30px', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}
    >
      Contact Us
    </Button>

  </motion.div>
</Grid>

          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 12 }}>
        <Typography variant="h4" textAlign="center" gutterBottom sx={{ fontWeight: 700 }}>
          Why Choose WorkZen?
        </Typography>
        <Typography textAlign="center" sx={{ mb: 6, fontSize: '1.2rem', color: 'text.secondary' }}>
          WorkZen is built for businesses of all sizes, ensuring seamless collaboration, security, and efficiency with AI-enhanced task management.
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <AnimatedCard>
                <CardContent sx={{ textAlign: 'center', p: 4, height: '100%' }}>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
                  </motion.div>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">{feature.description}</Typography>
                </CardContent>
              </AnimatedCard>
            </Grid>
          ))}
        </Grid>
        <Divider sx={{ my: 8 }} />
        <Typography variant="h4" textAlign="center" sx={{ fontWeight: 700, mb: 3 }}>
          Built for Modern Workflows
        </Typography>
        <Box 
  textAlign="center" 
  sx={{ 
    background: 'white', // Set background to white
    p: 5, 
    borderRadius: 3, 
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', // Subtle shadow effect
    color: 'text.primary' // Ensures text is dark for contrast
  }}
>
  <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
    Work Smarter, Not Harder
  </Typography>
  <Typography sx={{ fontSize: '1.2rem', color: 'text.secondary', mb: 3 }}>
    WorkZen simplifies complex workflows with automation, real-time collaboration, and advanced analytics. 
    Our intuitive platform ensures efficiency, accountability, and transparency across teams of all sizes.
  </Typography>
  <Typography textAlign="center" variant="h5" sx={{ fontWeight: 600, mt: 4, color: 'primary.main' }}>
    Contact Us
  </Typography>
  <Typography textAlign="center" sx={{ fontSize: '1rem', color: 'text.secondary' }}>
    Email: support@workzen.com | Phone: +91 9876543210
  </Typography>
</Box>

      </Container>
    </Box>
  );
};

export default AboutPage;
