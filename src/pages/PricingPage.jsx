
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { CheckCircle, Storage, Group, TrendingUp, Security, Notifications, Schedule } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsAnnual(!isAnnual);
  };

  const plans = [
    {
      title: 'Starter',
      monthlyPrice: 10,
      annualPrice: 8,
      description: 'Essential task management for freelancers and small teams.',
      features: [
        { text: 'Task creation & assignment', icon: <CheckCircle /> },
        { text: 'Basic task tracking (To-Do, In Progress, Completed)', icon: <TrendingUp /> },
        { text: 'User authentication & profile management', icon: <Security /> },
        { text: '5GB file storage', icon: <Storage /> },
        { text: 'Email notifications for task updates', icon: <Notifications /> },
      ],
    },
    {
      title: 'Team',
      monthlyPrice: 25,
      annualPrice: 20,
      description: 'Structured workflows and collaboration tools.',
      features: [
        { text: 'Everything in Starter Plan +', icon: <CheckCircle /> },
        { text: 'Team collaboration & real-time task updates', icon: <Group /> },
        { text: 'Role-based access control', icon: <Security /> },
        { text: 'Subtasks & dependency management', icon: <TrendingUp /> },
        { text: '15GB file storage', icon: <Storage /> },
        { text: 'Customizable notifications', icon: <Notifications /> },
        { text: 'Task deadline reminders', icon: <Schedule /> },
      ],
    },
    {
      title: 'Business',
      monthlyPrice: 40,
      annualPrice: 32,
      description: 'Advanced project management and analytics for businesses.',
      features: [
        { text: 'Everything in Team Plan +', icon: <CheckCircle /> },
        { text: 'Advanced reporting & productivity analytics', icon: <TrendingUp /> },
        { text: 'Automated task scheduling', icon: <Schedule /> },
        { text: 'Performance tracking for employees', icon: <Group /> },
        { text: 'Priority support', icon: <Security /> },
        { text: '50GB file storage', icon: <Storage /> },
        { text: 'Audit logs for compliance & security', icon: <Security /> },
      ],
    },
  ];

  const enterprisePlus = {
    title: 'Enterprise',
    custom: true,
    description: 'Fully customizable solution for large organizations.',
    features: [
      { text: 'Everything in Business Plan +', icon: <CheckCircle /> },
      { text: 'Unlimited users & storage', icon: <Group /> },
      { text: 'AI-powered task prioritization (future integration)', icon: <TrendingUp /> },
      { text: 'Integration with third-party apps (Slack, Jira)', icon: <Group /> },
      { text: 'Dedicated account manager', icon: <Security /> },
      { text: 'Custom branding options', icon: <Storage /> },
      { text: 'Enterprise-grade security & compliance', icon: <Security /> },
    ],
  };

  return (
    <Container maxWidth="lg" sx={{ py: 11, background: 'linear-gradient(to right, #f9f9f9, #e3f2fd)' }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#333', mb: 3 }}>
        Choose the Best Plan for Your Business
      </Typography>

      <Box display="flex" justifyContent="center" alignItems="center" mb={4}>
        <FormControlLabel
          control={<Switch checked={isAnnual} onChange={handleToggle} />}
          label={
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#555' }}>
              {isAnnual ? 'Annually (Save 25%)' : 'Monthly'}
            </Typography>
          }
        />
      </Box>

      <Grid container spacing={4} justifyContent="center">
        {plans.map((plan, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                boxShadow: 5,
                transition: '0.3s',
                '&:hover': { boxShadow: 10, transform: 'scale(1.05)' },
                backgroundColor: 'white',
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#222' }}>
                  {plan.title}
                </Typography>

                <Box display="flex" alignItems="baseline" mb={2}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </Typography>
                  <Typography variant="body1" sx={{ ml: 1, color: '#666' }}>
                    / user / month
                  </Typography>
                </Box>

                <Typography variant="subtitle1" color="text.secondary" mb={2}>
                  {plan.description}
                </Typography>

                <Divider sx={{ mb: 2 }} />

                <List dense>
                  {plan.features.map((feature, idx) => (
                    <ListItem key={idx} sx={{ py: 0 }}>
                      {feature.icon}
                      <ListItemText primary={feature.text} sx={{ color: '#444', ml: 1 }} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
              <CardActions sx={{ mt: 'auto', justifyContent: 'center', pb: 2 }}>
              <Button variant="contained" onClick={() => navigate('/contact')} sx={{ borderRadius: 2, backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#125a9c' } }}>
                Contact Us
              </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              boxShadow: 5,
              transition: '0.3s',
  '&:hover': { boxShadow: 10, transform: 'scale(1.05)' },
  
              backgroundColor: 'white',
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#222' }}>
                {enterprisePlus.title}
              </Typography>

              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }} gutterBottom>
                Custom
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" mb={2}>
                {enterprisePlus.description}
              </Typography>

              <Divider sx={{ mb: 2 }} />

              <List dense>
                {enterprisePlus.features.map((feature, idx) => (
                  <ListItem key={idx} sx={{ py: 0 }}>
                    {feature.icon}
                    <ListItemText primary={feature.text} sx={{ color: '#444', ml: 1 }} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
            <CardActions sx={{ mt: 'auto', justifyContent: 'center', pb: 2 }}>
              <Button variant="contained" onClick={() => navigate('/contact')} sx={{ borderRadius: 2, backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#125a9c' } }}>
                Contact Us
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
     
    </Container>
  );
}

export default PricingPage;
