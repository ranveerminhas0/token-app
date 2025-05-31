import React from 'react';
import { Box } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import styles from './HamburgerButton.module.css';

const MotionBox = motion(Box);

const HamburgerButton = ({ isOpen, onClick }) => {
  const lineVariants = {
    closed: {
      rotate: 0,
      y: 0,
    },
    open: (custom) => ({
      rotate: custom ? 45 : -45,
      y: custom ? -8 : 8,
    }),
  };

  const middleLineVariants = {
    closed: {
      opacity: 1,
      x: 0,
    },
    open: {
      opacity: 0,
      x: -20,
    },
  };

  return (
    <button 
      className={styles.hamburgerButton}
      onClick={onClick}
      type="button"
    >
      <MotionBox
        className={styles.line}
        variants={lineVariants}
        custom={true}
        animate={isOpen ? 'open' : 'closed'}
        transition={{ duration: 0.3 }}
      />
      <MotionBox
        className={styles.line}
        variants={middleLineVariants}
        animate={isOpen ? 'open' : 'closed'}
        transition={{ duration: 0.3 }}
      />
      <MotionBox
        className={styles.line}
        variants={lineVariants}
        custom={false}
        animate={isOpen ? 'open' : 'closed'}
        transition={{ duration: 0.3 }}
      />
    </button>
  );
};

export default HamburgerButton; 