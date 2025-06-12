import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../../services/api';
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
  Icon,
  Heading
} from '@chakra-ui/react';
import { 
  FaHashtag, 
  FaUser, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaRupeeSign,
  FaTicketAlt
} from 'react-icons/fa';
import { keyframes as emotionKeyframes } from '@emotion/react';

const MotionBox = motion(Box);

// Custom animation for input focus
const glowAnimation = emotionKeyframes`
  0% { box-shadow: 0 0 5px rgba(122, 236, 218, 0.3); }
  50% { box-shadow: 0 0 20px rgba(122, 236, 218, 0.5); }
  100% { box-shadow: 0 0 5px rgba(122, 236, 218, 0.3); }
`;

const B2BRedeemToken = ({ onTokenRedeemed }) => {
  // Generate random form name to prevent browser from recognizing the form
  const [formName] = useState(() => `form-${Math.random().toString(36).substring(7)}`);

  const [formData, setFormData] = useState({
    tokenCode: '',
    redeemerName: '',
    redeemerPhone: '',
    redeemerResidence: '',
    billAmount: ''
  });

  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const toast = useToast();

  // Reset form data when component mounts and unmounts
  useEffect(() => {
    resetForm();
    // Force clear any stored form data
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      input.value = '';
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('autocorrect', 'off');
      input.setAttribute('autocapitalize', 'off');
      input.setAttribute('spellcheck', 'false');
    });
    return () => resetForm();
  }, []);

  const resetForm = () => {
    setFormData({
      tokenCode: '',
      redeemerName: '',
      redeemerPhone: '',
      redeemerResidence: '',
      billAmount: ''
    });
    setFocusedField(null);
  };

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
      const response = await fetch(getApiUrl(`api/b2b/redeem-token/${formData.tokenCode.trim()}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          redeemerName: formData.redeemerName.trim(),
          redeemerPhone: formData.redeemerPhone.trim(),
          redeemerResidence: formData.redeemerResidence.trim(),
          billAmount: Number(formData.billAmount)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 404) {
          throw new Error("Token not found. Please check the token code.");
        } else if (response.status === 400) {
          throw new Error(data.message || "Invalid token data. Please check your input.");
        } else if (response.status === 403) {
          throw new Error("This token has expired or reached its maximum uses.");
        } else {
          throw new Error(data.message || "Unable to redeem token. Please try again.");
        }
      }

      toast({
        title: "Success! 🎉",
        description: "Token redeemed successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right"
      });

      resetForm();

      if (onTokenRedeemed) {
        onTokenRedeemed();
      }
    } catch (err) {
      // Handle network errors
      if (err.name === 'TypeError' && err.message.includes('JSON')) {
        toast({
          title: "Connection Error",
          description: "Unable to connect to the server. Please check your internet connection and try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top-right"
        });
      } else {
        toast({
          title: "Error",
          description: err.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top-right"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = {
    bg: "rgba(0, 0, 0, 0.15)",
    border: "1px solid rgba(122, 236, 218, 0.2)",
    color: "white",
    borderRadius: "lg",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
      color: "rgba(255, 255, 255, 0.5)",
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

        {/* Hidden fields to confuse autocomplete */}
        <div style={{ display: 'none' }}>
          <input type="text" name="fakeusernameremembered" />
          <input type="password" name="fakepasswordremembered" />
        </div>

        <form 
          onSubmit={handleSubmit} 
          style={{ width: '100%' }}
          autoComplete="off"
          id={formName}
          name={formName}
          noValidate
        >
          <VStack spacing={6}>
            <Box {...formSectionStyles} w="100%">
              <VStack spacing={4}>
                <FormControl isRequired>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaTicketAlt} color="rgba(122, 236, 218, 0.8)" />
                    </InputLeftElement>
                    <Input
                      id={`${formName}-token-code`}
                      name="tokenCode"
                      value={formData.tokenCode}
                      onChange={handleChange}
                      placeholder="Enter token code"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      data-form-type="other"
                      textTransform="uppercase"
                      {...inputStyles}
                      onFocus={() => handleFocus('tokenCode')}
                      onBlur={handleBlur}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaUser} color="rgba(122, 236, 218, 0.8)" />
                    </InputLeftElement>
                    <Input
                      id={`${formName}-redeemer-name`}
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
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaPhone} color="rgba(122, 236, 218, 0.8)" />
                    </InputLeftElement>
                    <Input
                      id={`${formName}-redeemer-phone`}
                      name="redeemerPhone"
                      type="tel"
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
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaMapMarkerAlt} color="rgba(122, 236, 218, 0.8)" />
                    </InputLeftElement>
                    <Input
                      id={`${formName}-redeemer-residence`}
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
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaRupeeSign} color="rgba(122, 236, 218, 0.8)" />
                    </InputLeftElement>
                    <Input
                      id={`${formName}-bill-amount`}
                      name="billAmount"
                      type="number"
                      value={formData.billAmount}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
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

export default B2BRedeemToken; 