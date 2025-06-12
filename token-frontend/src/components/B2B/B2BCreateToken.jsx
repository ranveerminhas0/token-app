import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
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
  FaBusinessTime, 
  FaUser, 
  FaPhone, 
  FaStore, 
  FaMapMarkerAlt, 
  FaInstagram, 
  FaHashtag,
  FaPlus
} from 'react-icons/fa';
import { keyframes as emotionKeyframes } from '@emotion/react';

const MotionBox = motion(Box);

// Custom animation for input focus
const glowAnimation = emotionKeyframes`
  0% { box-shadow: 0 0 5px rgba(122, 236, 218, 0.3); }
  50% { box-shadow: 0 0 20px rgba(122, 236, 218, 0.5); }
  100% { box-shadow: 0 0 5px rgba(122, 236, 218, 0.3); }
`;

const B2BCreateToken = ({ onTokenCreated }) => {
  // Generate random form name to prevent browser from recognizing the form
  const [formName] = useState(() => `form-${Math.random().toString(36).substring(7)}`);

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
      businessName: '',
      businessOwner: '',
      businessPhone: '',
      businessType: '',
      businessLocation: '',
      instagramProfile: '',
      maxUses: ''
    });
    setError('');
    setSuccess('');
    setFocusedField(null);
  };

  const [formData, setFormData] = useState({
    businessName: '',
    businessOwner: '',
    businessPhone: '',
    businessType: '',
    businessLocation: '',
    instagramProfile: '',
    maxUses: ''
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

  const validateForm = () => {
    const errors = [];
    
    if (!formData.businessName.trim()) {
      errors.push("Business name is required");
    }
    if (!formData.businessOwner.trim()) {
      errors.push("Business owner name is required");
    }
    if (!formData.businessPhone.trim()) {
      errors.push("Phone number is required");
    } else if (!/^\d{10}$/.test(formData.businessPhone.trim())) {
      errors.push("Phone number must be 10 digits");
    }
    if (!formData.businessType.trim()) {
      errors.push("Business type is required");
    }
    if (!formData.businessLocation.trim()) {
      errors.push("Business location is required");
    }
    if (!formData.instagramProfile.trim()) {
      errors.push("Instagram profile is required");
    } else if (!/^[a-zA-Z0-9._]+$/.test(formData.instagramProfile.trim())) {
      errors.push("Instagram profile must be a valid username (letters, numbers, dots, and underscores only)");
    }
    if (!formData.maxUses) {
      errors.push("Number of tokens is required");
    } else if (isNaN(formData.maxUses) || Number(formData.maxUses) <= 0) {
      errors.push("Number of tokens must be greater than 0");
    } else if (!Number.isInteger(Number(formData.maxUses))) {
      errors.push("Number of tokens must be a whole number");
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
      const response = await fetch(getApiUrl('api/b2b/create-token'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessName: formData.businessName.trim(),
          businessOwner: formData.businessOwner.trim(),
          businessPhone: formData.businessPhone.trim(),
          businessType: formData.businessType.trim(),
          businessLocation: formData.businessLocation.trim(),
          instagramProfile: formData.instagramProfile.trim(),
          maxUses: Number(formData.maxUses)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 400) {
          throw new Error(data.message || "Invalid business data. Please check your input.");
        } else if (response.status === 409) {
          throw new Error("A token for this business already exists. Please check the business details.");
        } else if (response.status === 403) {
          throw new Error("You don't have permission to create tokens. Please contact support.");
        } else {
          throw new Error(data.message || "Unable to create token. Please try again.");
        }
      }

      // Show success message
      toast({
        title: "Success! 🎉",
        description: "Token created successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right"
      });

      // Log the created token data for debugging
      console.log("Created token:", data);

      resetForm();

      if (onTokenCreated) {
        onTokenCreated();
      }
    } catch (err) {
      console.error("Error creating token:", err);
      
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
          description: err.message || "An unexpected error occurred. Please try again.",
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
          Create New Token
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
                      <Icon as={FaBusinessTime} color="rgba(122, 236, 218, 0.8)" />
                    </InputLeftElement>
                    <Input
                      id={`${formName}-business-name`}
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder="Enter business name"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      data-form-type="other"
                      {...inputStyles}
                      onFocus={() => handleFocus('businessName')}
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
                      id={`${formName}-business-owner`}
                      name="businessOwner"
                      value={formData.businessOwner}
                      onChange={handleChange}
                      placeholder="Enter owner name"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      data-form-type="other"
                      {...inputStyles}
                      onFocus={() => handleFocus('businessOwner')}
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
                      id={`${formName}-business-phone`}
                      name="businessPhone"
                      type="tel"
                      value={formData.businessPhone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      data-form-type="other"
                      {...inputStyles}
                      onFocus={() => handleFocus('businessPhone')}
                      onBlur={handleBlur}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaStore} color="rgba(122, 236, 218, 0.8)" />
                    </InputLeftElement>
                    <Input
                      id={`${formName}-business-type`}
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      placeholder="Enter business type"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      data-form-type="other"
                      {...inputStyles}
                      onFocus={() => handleFocus('businessType')}
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
                      id={`${formName}-business-location`}
                      name="businessLocation"
                      value={formData.businessLocation}
                      onChange={handleChange}
                      placeholder="Enter business location"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      data-form-type="other"
                      {...inputStyles}
                      onFocus={() => handleFocus('businessLocation')}
                      onBlur={handleBlur}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaInstagram} color="rgba(122, 236, 218, 0.8)" />
                    </InputLeftElement>
                    <Input
                      id={`${formName}-instagram-profile`}
                      name="instagramProfile"
                      value={formData.instagramProfile}
                      onChange={handleChange}
                      placeholder="Enter Instagram username"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      data-form-type="other"
                      {...inputStyles}
                      onFocus={() => handleFocus('instagramProfile')}
                      onBlur={handleBlur}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaHashtag} color="rgba(122, 236, 218, 0.8)" />
                    </InputLeftElement>
                    <Input
                      id={`${formName}-max-uses`}
                      name="maxUses"
                      type="number"
                      value={formData.maxUses}
                      onChange={handleChange}
                      min="1"
                      placeholder="Enter number of tokens"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      data-form-type="other"
                      {...inputStyles}
                      onFocus={() => handleFocus('maxUses')}
                      onBlur={handleBlur}
                    />
                  </InputGroup>
                </FormControl>
              </VStack>
            </Box>

            <Button
              type="submit"
              isLoading={loading}
              loadingText="Creating..."
              size="lg"
              width="100%"
              {...submitButtonStyles}
            >
              CREATE TOKEN
            </Button>
          </VStack>
        </form>
      </VStack>
    </MotionBox>
  );
};

export default B2BCreateToken; 