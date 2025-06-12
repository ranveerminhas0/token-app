import React, { useState, useEffect } from 'react';
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
  FaUser, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaInstagram, 
  FaHashtag,
  FaPlus,
  FaIdCard,
  FaShieldAlt,
  FaBusinessTime,
  FaStore,
  FaPercent
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

const B2BACreateToken = ({ onTokenCreated }) => {
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
      agentName: '',
      agentPhone: '',
      businessType: '',
      regionZone: '',
      commission: '',
      maxUses: ''
    });
    setError('');
    setSuccess('');
    setFocusedField(null);
  };

  const [formData, setFormData] = useState({
    businessName: '',
    agentName: '',
    agentPhone: '',
    businessType: '',
    regionZone: '',
    commission: '',
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
    if (!formData.agentName.trim()) {
      errors.push("Agent name is required");
    }
    if (!formData.agentPhone.trim()) {
      errors.push("Phone number is required");
    } else if (!/^\d{10}$/.test(formData.agentPhone.trim())) {
      errors.push("Phone number must be 10 digits");
    }
    if (!formData.businessType.trim()) {
      errors.push("Type of business is required");
    }
    if (!formData.regionZone.trim()) {
      errors.push("Region/Zone is required");
    }
    if (!formData.commission) {
      errors.push("Commission percentage is required");
    } else if (isNaN(formData.commission) || Number(formData.commission) <= 0) {
      errors.push("Commission must be greater than 0");
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
      const response = await fetch(getApiUrl('api/b2ba/tokens'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          businessName: formData.businessName.trim(),
          agentName: formData.agentName.trim(),
          phone: formData.agentPhone.trim(),
          businessType: formData.businessType.trim(),
          region: formData.regionZone.trim(),
          commission: Number(formData.commission),
          numberOfTokens: Number(formData.maxUses)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create token');
      }

      // Show success message
      toast({
        title: "Token Created Successfully",
        description: `Token has been created for agent ${formData.agentName}`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right"
      });

      // Reset form
      resetForm();

      // Notify parent component
      if (onTokenCreated) {
        onTokenCreated();
      }
    } catch (error) {
      console.error('Error creating token:', error);
      setError(error.message);
      toast({
        title: "Error Creating Token",
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
          Create Token
        </Heading>
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
                      id={`${formName}-agent-name`}
                      name="agentName"
                      value={formData.agentName}
                      onChange={handleChange}
                      placeholder="Enter agent name"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      data-form-type="other"
                      {...inputStyles}
                      onFocus={() => handleFocus('agentName')}
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
                      id={`${formName}-agent-phone`}
                      name="agentPhone"
                      type="number"
                      value={formData.agentPhone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      data-form-type="other"
                      {...inputStyles}
                      onFocus={() => handleFocus('agentPhone')}
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
                      placeholder="Enter type of business"
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
                      id={`${formName}-region-zone`}
                      name="regionZone"
                      value={formData.regionZone}
                      onChange={handleChange}
                      placeholder="Enter region/zone"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      data-form-type="other"
                      {...inputStyles}
                      onFocus={() => handleFocus('regionZone')}
                      onBlur={handleBlur}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaPercent} color="rgba(122, 236, 218, 0.8)" />
                    </InputLeftElement>
                    <Input
                      id={`${formName}-commission`}
                      name="commission"
                      type="number"
                      value={formData.commission}
                      onChange={handleChange}
                      placeholder="Enter commission percentage"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      data-form-type="other"
                      {...inputStyles}
                      onFocus={() => handleFocus('commission')}
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

export default B2BACreateToken; 