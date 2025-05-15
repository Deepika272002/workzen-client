import React from 'react';
import { motion } from 'framer-motion';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Typography } from '@mui/material';

const LogoContainer = styled(Box)(({ theme }) => ({
  width: '400px',
  height: '400px',
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  perspective: '1000px',
}));

const LogoWrapper = styled(motion.div)({
  width: '200px',
  height: '200px',
  position: 'relative',
  transformStyle: 'preserve-3d',
  cursor: 'pointer',
});

const LogoFace = styled(motion.div)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(8px)',
  borderRadius: '20px',
  border: '2px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
}));

const Logo3D = () => {
  const containerVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3,
      },
    },
  };

  const logoVariants = {
    initial: { rotateY: 0 },
    animate: {
      rotateY: 360,
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: "linear",
      },
    },
    hover: {
      rotateX: [-15, 15],
      rotateY: [-15, 15],
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <LogoContainer>
      <LogoWrapper
        variants={containerVariants}
        whileHover="hover"
        initial="initial"
        animate="animate"
        variants={logoVariants}
      >
        {/* Front face */}
        <LogoFace
          style={{
            transform: 'translateZ(50px)',
          }}
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <motion.path
              d="M20 90 L40 30 L60 90 L80 30 L100 90"
              stroke="white"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: 1,
                opacity: 1,
                transition: { duration: 2, ease: "easeInOut" }
              }}
            />
            <motion.circle
              cx="60"
              cy="60"
              r="50"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="4"
              fill="none"
              initial={{ scale: 0 }}
              animate={{
                scale: 1,
                transition: { duration: 1, ease: "easeOut" }
              }}
            />
          </svg>
        </LogoFace>

        {/* Back face */}
        <LogoFace
          style={{
            transform: 'translateZ(-50px) rotateY(180deg)',
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.3, 0.7, 0.3],
              transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            <Typography
              variant="h2"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                textShadow: '0 0 10px rgba(255,255,255,0.5)',
              }}
            >
              WZ
            </Typography>
          </motion.div>
        </LogoFace>

        {/* Side faces for 3D effect */}
        {['top', 'bottom', 'left', 'right'].map((side, index) => (
          <LogoFace
            key={side}
            style={{
              transform: `${
                side === 'top' ? 'rotateX(90deg) translateZ(50px)' :
                side === 'bottom' ? 'rotateX(-90deg) translateZ(50px)' :
                side === 'left' ? 'rotateY(-90deg) translateZ(50px)' :
                'rotateY(90deg) translateZ(50px)'
              }`,
              background: 'rgba(255,255,255,0.05)',
            }}
          />
        ))}
      </LogoWrapper>
    </LogoContainer>
  );
};

export default Logo3D; 