import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  VStack,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Text,
  useToast,
  FormControl,
  FormLabel,
  Icon,
  HStack,
  Divider,
  useColorModeValue,
  Heading
} from '@chakra-ui/react';
import {
  FaKey,
  FaUser,
  FaPhone,
  FaIdCard,
  FaCheck,
  FaMapMarkerAlt,
  FaRupeeSign
} from 'react-icons/fa';
import { keyframes as emotionKeyframes } from '@emotion/react';
import { getApiUrl } from '../../services/api';

const MotionBox = motion(Box);

// Custom animation for input focus
const glowAnimation = emotionKeyframes`
  0% { box-shadow: 0 0 5px rgba(122, 236, 218, 0.3); }
  50% { box-shadow: 0 0 20px rgba(122, 236, 218, 0.5); }
  100% { box-shadow: 0 0 5px rgba(122, 236, 218, 0.3); }
`;

const labelStyles = {
  color: "#8ff6e7",
  fontWeight: "normal",
  fontSize: "md",
  mb: 0.5,
};

const inputStyles = {
  bg: "rgba(0, 0, 0, 0.15)",
  border: "1px solid rgba(122, 236, 218, 0.2)",
  color: "white",
  borderRadius: "lg",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  fontSize: "md",
  h: "42px",
  py: 2,
  px: 4,
  _hover: {
    borderColor: "rgba(122, 236, 218, 0.4)",
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(122, 236, 218, 0.1)",
  },
  _focus: {
    borderColor: "rgba(122, 236, 218, 0.8)",
    boxShadow: "0 0 0 2px rgba(122, 236, 218, 0.3), 0 0 20px rgba(122, 236, 218, 0.2)",
    bg: "rgba(0, 0, 0, 0.25)",
    transform: "translateY(-2px) scale(1.01)",
  },
  _placeholder: {
    color: "#b2f7ee",
    fontWeight: "normal",
    opacity: 1,
  },
  _active: {
    transform: "translateY(0) scale(0.99)",
  },
};

const formContainerStyles = {
  maxW: "600px",
  mx: "auto",
  p: 8,
  bg: "rgba(0, 0, 0, 0.2)",
  backdropFilter: "blur(25px)",
  borderRadius: "2xl",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
  border: "1px solid rgba(122, 236, 218, 0.15)",
  position: "relative",
  overflow: "hidden",
  _before: {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(135deg, rgba(122, 236, 218, 0.08) 0%, rgba(0, 0, 0, 0.15) 100%)",
    zIndex: 0,
  },
  _after: {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "radial-gradient(circle at 50% 50%, rgba(122, 236, 218, 0.05) 0%, transparent 70%)",
    zIndex: 0,
  },
};

const formSectionStyles = {
  bg: "rgba(0, 0, 0, 0.15)",
  p: 6,
  borderRadius: "xl",
  border: "1px solid rgba(122, 236, 218, 0.1)",
  position: "relative",
  zIndex: 1,
  backdropFilter: "blur(10px)",
  _hover: {
    borderColor: "rgba(122, 236, 218, 0.2)",
    boxShadow: "0 4px 12px rgba(122, 236, 218, 0.05)",
    transition: "all 0.3s ease-in-out",
  },
};

const submitButtonStyles = {
  bg: "rgba(122, 236, 218, 0.15)",
  color: "white",
  border: "1px solid rgba(122, 236, 218, 0.3)",
  borderRadius: "lg",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  _hover: {
    bg: "rgba(122, 236, 218, 0.25)",
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(122, 236, 218, 0.2)",
  },
  _active: {
    bg: "rgba(122, 236, 218, 0.3)",
    transform: "translateY(0) scale(0.98)",
  },
  _loading: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
};

const B2BARedeemToken = ({ onTokenRedeemed }) => {
  const [formData, setFormData] = useState({
    tokenCode: '',
    redeemerName: '',
    redeemerPhone: '',
    redeemerResidence: '',
    billAmount: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const resetForm = () => {
    setFormData({
      tokenCode: '',
      redeemerName: '',
      redeemerPhone: '',
      redeemerResidence: '',
      billAmount: ''
    });
    setError('');
    setSuccess('');
    setFocusedField(null);
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.tokenCode.trim()) {
      errors.push("Token code is required");
    }
    if (!formData.redeemerName.trim()) {
      errors.push("Redeemer name is required");
    }
    if (!formData.redeemerPhone.trim()) {
      errors.push("Phone number is required");
    } else if (!/^\d{10}$/.test(formData.redeemerPhone.trim())) {
      errors.push("Phone number must be 10 digits");
    }
    if (!formData.redeemerResidence.trim()) {
      errors.push("Residence is required");
    }
    if (!formData.billAmount) {
      errors.push("Bill amount is required");
    } else if (isNaN(formData.billAmount) || Number(formData.billAmount) <= 0) {
      errors.push("Bill amount must be greater than 0");
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form first
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: (
          <VStack align="start" spacing={1}>
            {validationErrors.map((error, index) => (
              <Text key={index} color="red.300">• {error}</Text>
            ))}
          </VStack>
        ),
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(getApiUrl('api/b2ba/tokens/redeem'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          tokenCode: formData.tokenCode.trim(),
          redeemerName: formData.redeemerName.trim(),
          redeemerPhone: formData.redeemerPhone.trim(),
          redeemerResidence: formData.redeemerResidence.trim(),
          billAmount: Number(formData.billAmount)
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to redeem token');
      }

      const data = await response.json();

      // Show success message
      toast({
        title: "Token Redeemed Successfully",
        description: "Token has been redeemed successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right"
      });

      // Reset form
      resetForm();

      // Notify parent component
      if (onTokenRedeemed) {
        onTokenRedeemed();
      }
    } catch (error) {
      console.error('Error redeeming token:', error);
      setError(error.message);
      toast({
        title: "Error Redeeming Token",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      {...formContainerStyles}
    >
      <VStack spacing={6} position="relative" zIndex={1}>
        <Heading
          color="white"
          fontSize="2xl"
          fontWeight="bold"
          textAlign="center"
          mb={4}
          textShadow="0 2px 4px rgba(0, 0, 0, 0.2)"
        >
          Redeem Token
        </Heading>
        <form 
          onSubmit={handleSubmit} 
          style={{ width: '100%' }}
          autoComplete="off"
          id="redeem-token-form"
          name="redeem-token-form"
          noValidate
        >
          <VStack spacing={6}>
            <Box {...formSectionStyles} w="100%">
              <VStack spacing={4}>
                <FormControl isRequired>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" top="50%" transform="translateY(-50%)">
                      <Icon as={FaKey} color="#8ff6e7" boxSize={5} />
                    </InputLeftElement>
                    <Input
                      id="token-code"
                      name="tokenCode"
                      value={formData.tokenCode}
                      onChange={handleChange}
                      placeholder="Enter token code"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      data-form-type="other"
                      {...inputStyles}
                      onFocus={() => handleFocus('tokenCode')}
                      onBlur={handleBlur}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" top="50%" transform="translateY(-50%)">
                      <Icon as={FaUser} color="#8ff6e7" boxSize={5} />
                    </InputLeftElement>
                    <Input
                      id="redeemer-name"
                      name="redeemerName"
                      value={formData.redeemerName}
                      onChange={handleChange}
                      placeholder="Enter redeemer name"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      data-form-type="other"
                      {...inputStyles}
                      onFocus={() => handleFocus('redeemerName')}
                      onBlur={handleBlur}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" top="50%" transform="translateY(-50%)">
                      <Icon as={FaPhone} color="#8ff6e7" boxSize={5} />
                    </InputLeftElement>
                    <Input
                      id="redeemer-phone"
                      name="redeemerPhone"
                      type="number"
                      value={formData.redeemerPhone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      data-form-type="other"
                      {...inputStyles}
                      onFocus={() => handleFocus('redeemerPhone')}
                      onBlur={handleBlur}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" top="50%" transform="translateY(-50%)">
                      <Icon as={FaMapMarkerAlt} color="#8ff6e7" boxSize={5} />
                    </InputLeftElement>
                    <Input
                      id="redeemer-residence"
                      name="redeemerResidence"
                      value={formData.redeemerResidence}
                      onChange={handleChange}
                      placeholder="Enter residence"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      data-form-type="other"
                      {...inputStyles}
                      onFocus={() => handleFocus('redeemerResidence')}
                      onBlur={handleBlur}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" top="50%" transform="translateY(-50%)">
                      <Icon as={FaRupeeSign} color="#8ff6e7" boxSize={5} />
                    </InputLeftElement>
                    <Input
                      id="bill-amount"
                      name="billAmount"
                      type="number"
                      value={formData.billAmount}
                      onChange={handleChange}
                      placeholder="Enter bill amount"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      data-form-type="other"
                      {...inputStyles}
                      onFocus={() => handleFocus('billAmount')}
                      onBlur={handleBlur}
                    />
                  </InputGroup>
                </FormControl>
              </VStack>
            </Box>
            <Button
              type="submit"
              isLoading={loading}
              loadingText="Redeeming..."
              size="lg"
              width="100%"
              {...submitButtonStyles}
            >
              REDEEM TOKEN
            </Button>
          </VStack>
        </form>
      </VStack>
    </MotionBox>
  );
};

export default B2BARedeemToken; 