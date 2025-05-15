import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import GroupsIcon from '@mui/icons-material/Groups';
import AnalyticsIcon from '@mui/icons-material/Analytics';

const CardContainer = styled(Box)({
  position: 'relative',
  width: '100%',
  height: '400px',
  perspective: '1000px',
  display: 'flex',
  // justifyContent: 'flex-end', // Align cards to the right
  paddingRight: '60px', // Add some padding to the right
  paddingTop: '90px', // Add some padding to the top
});

const FeatureCard = styled(motion.div)(({ theme }) => ({
  position: 'absolute',
  width: '180px',
  height: '220px',
  borderRadius: '20px',
  padding: '20px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(8px)',
  border: '2px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transformStyle: 'preserve-3d',
  transition: 'transform 0.3s ease',
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  fontSize: '40px',
  marginBottom: '15px',
  color: theme.palette.primary.main,
}));

const features = [
  {
    icon: <TaskAltIcon sx={{ fontSize: 40 }} />,
    title: 'Task Management',
    description: 'Streamline your workflow',
    position: { x: 0, y: 0 }
  },
  {
    icon: <GroupsIcon sx={{ fontSize: 40 }} />,
    title: 'Collaboration',
    description: 'Work together seamlessly',
    position: { x: 180, y: -40 }
  },
  {
    icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
    title: 'Analytics',
    description: 'Data-driven insights',
    position: { x: 360, y: 0 }
  }
];

const FloatingFeatureCards = () => {
  return (
    <CardContainer>
      {features.map((feature, index) => (
        <FeatureCard
          key={index}
          initial={{
            x: feature.position.x,
            y: feature.position.y,
            rotateX: 0,
            rotateY: 0,
            scale: 1,
          }}
          animate={{
            y: [
              feature.position.y,
              feature.position.y - 20,
              feature.position.y
            ],
          }}
          transition={{
            y: {
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
              delay: index * 0.2,
            },
          }}
          whileHover={{
            scale: 1.1,
            rotateX: 5,
            rotateY: 5,
            transition: { duration: 0.3 },
          }}
        >
          <IconWrapper>{feature.icon}</IconWrapper>
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              textAlign: 'center',
              mb: 1
            }}
          >
            {feature.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              textAlign: 'center' 
            }}
          >
            {feature.description}
          </Typography>
        </FeatureCard>
      ))}
    </CardContainer>
  );
};

export default FloatingFeatureCards;