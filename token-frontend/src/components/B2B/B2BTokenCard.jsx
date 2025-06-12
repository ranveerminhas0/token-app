import { Box, Text, VStack, Badge, Menu, MenuButton, MenuList, MenuItem, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, Input, useToast } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FiMoreVertical, FiShare2, FiClock, FiTrash2 } from 'react-icons/fi';
import '../TokenCard.css';
import { getApiUrl } from '../../services/api';

const B2BTokenCard = ({ token, onTokenUpdated }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isExtendOpen, onOpen: onExtendOpen, onClose: onExtendClose } = useDisclosure();
  const [extensionDays, setExtensionDays] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'green';
      case 'expired':
        return 'red';
      case 'reissued':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleShare = async () => {
    try {
      console.log('Full token object:', token);
      console.log('Token ID:', token._id);
      console.log('Token Serial:', token.serial);
      console.log('Token Code:', token.token);
      
      const response = await fetch(getApiUrl(`api/b2b/token/${token._id}`));
      console.log('Share response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Share error details:', errorData);
        throw new Error(errorData.message || 'Failed to get token details');
      }
      
      const data = await response.json();
      console.log('Share data received:', data);
      
      if (!data.whatsappLink) {
        throw new Error('WhatsApp link not found in response');
      }
      
      window.open(data.whatsappLink, '_blank');
    } catch (error) {
      console.error('Error sharing token:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to share token. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(getApiUrl(`api/b2b/tokens/${token._id}`), { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Error deleting token');
      }

      toast({
        title: 'Token deleted',
        description: `Token #${token.serial} has been deleted successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      if (onTokenUpdated) {
        onTokenUpdated();
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      onDeleteClose();
    }
  };

  const handleExtend = async () => {
    if (!extensionDays || extensionDays < 1) {
      setError('Please enter valid number of days');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(getApiUrl(`api/b2b/extend-token/${token.token}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ days: Number(extensionDays) })
      });

      if (!response.ok) {
        throw new Error('Error extending token');
      }

      toast({
        title: 'Token extended',
        description: `Token #${token.serial} has been extended by ${extensionDays} days.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      if (onTokenUpdated) {
        onTokenUpdated();
      }

      onExtendClose();
      setExtensionDays('');
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="token-card"
      >
        <Box
          p={6}
          borderRadius="xl"
          bg="rgba(0, 0, 0, 0.3)"
          border="1px solid rgba(122, 236, 218, 0.2)"
          cursor="pointer"
          transition="all 0.3s ease"
          position="relative"
          overflow="hidden"
          className="token-card-inner"
          _hover={{
            border: "1px solid rgba(122, 236, 218, 0.4)",
            transform: "translateY(-5px)",
            boxShadow: "0 10px 30px -10px rgba(122, 236, 218, 0.2)"
          }}
        >
          {/* Basic Info - Always Visible */}
          <VStack align="start" spacing={3}>
            <Box display="flex" justifyContent="space-between" width="100%" alignItems="center">
              <Text color="#7aecda" fontSize="xl" fontWeight="bold">
                #{token.serial} - {token.token}
              </Text>
              <Box display="flex" alignItems="center" gap={2}>
                <Badge colorScheme={getStatusColor(token.status)} fontSize="md" px={3} py={1}>
                  {token.status}
                </Badge>
                <Box onClick={(e) => e.stopPropagation()}>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<FiMoreVertical />}
                      variant="ghost"
                      color="#7aecda"
                      bg="rgba(0, 0, 0, 0.5)"
                      _hover={{ bg: 'rgba(122, 236, 218, 0.1)' }}
                      _active={{ bg: 'rgba(122, 236, 218, 0.2)' }}
                      sx={{
                        border: '1px solid rgba(122, 236, 218, 0.3)',
                        boxShadow: '0 0 10px rgba(122, 236, 218, 0.1)',
                        backdropFilter: 'blur(10px)',
                      }}
                    />
                    <MenuList 
                      bg="rgba(0, 0, 0, 0.9)"
                      borderColor="rgba(122, 236, 218, 0.3)"
                      boxShadow="0 0 20px rgba(122, 236, 218, 0.1)"
                      backdropFilter="blur(10px)"
                    >
                      <MenuItem 
                        icon={<FiShare2 />} 
                        onClick={handleShare}
                        _hover={{ bg: 'rgba(122, 236, 218, 0.1)' }}
                      >
                        Share
                      </MenuItem>
                      <MenuItem 
                        icon={<FiClock />} 
                        onClick={onExtendOpen}
                        _hover={{ bg: 'rgba(122, 236, 218, 0.1)' }}
                      >
                        Extend
                      </MenuItem>
                      <MenuItem 
                        icon={<FiTrash2 />} 
                        onClick={onDeleteOpen}
                        color="red.300"
                        _hover={{ bg: 'rgba(255, 0, 0, 0.1)' }}
                      >
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Box>
              </Box>
            </Box>

            <Text color="gray.300" fontSize="lg">
              {token.businessName}
            </Text>

            {/* Expanded Content */}
            <motion.div
              initial={false}
              animate={{ height: isExpanded ? "auto" : 0 }}
              style={{ overflow: "hidden", width: "100%" }}
            >
              {isExpanded && (
                <VStack align="start" spacing={3} pt={4} width="100%">
                  <Text color="gray.300">Owner: {token.businessOwner}</Text>
                  <Text color="gray.300">Phone: {token.businessPhone}</Text>
                  <Text color="gray.300">Type: {token.businessType}</Text>
                  <Text color="gray.300">Location: {token.businessLocation}</Text>
                  <Text color="gray.300">Instagram: {token.instagramProfile}</Text>
                  <Text color="gray.300">Uses: {token.currentUses}/{token.maxUses}</Text>
                  <Text color="gray.300">Total Business: ₹{token.totalBusiness}</Text>
                  <Text color="gray.300">Issue Date: {formatDate(token.issueDate)}</Text>
                  <Text color="gray.300">Expiration: {formatDate(token.expirationDate)}</Text>
                  <Text color="gray.300">Remaining Days: {token.remainingDays}</Text>

                  {token.redemptions && token.redemptions.length > 0 && (
                    <VStack align="start" spacing={2} width="100%">
                      <Text color="#7aecda" fontWeight="bold">Redemption History:</Text>
                      {token.redemptions.map((redemption, idx) => (
                        <Box 
                          key={idx} 
                          p={3} 
                          bg="rgba(0,0,0,0.3)" 
                          borderRadius="md" 
                          width="100%"
                          border="1px solid rgba(122, 236, 218, 0.1)"
                        >
                          <Text color="gray.300">Date: {formatDate(redemption.redemptionDate)}</Text>
                          <Text color="gray.300">Name: {redemption.redeemerName}</Text>
                          <Text color="gray.300">Phone: {redemption.redeemerPhone}</Text>
                          <Text color="gray.300">Residence: {redemption.redeemerResidence}</Text>
                          <Text color="gray.300">Bill Amount: ₹{redemption.billAmount}</Text>
                        </Box>
                      ))}
                    </VStack>
                  )}
                </VStack>
              )}
            </motion.div>
          </VStack>
        </Box>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent bg="rgba(0, 0, 0, 0.95)" borderColor="rgba(122, 236, 218, 0.3)">
          <ModalHeader color="#7aecda">Confirm Delete</ModalHeader>
          <ModalCloseButton color="#7aecda" />
          <ModalBody>
            <Text color="gray.300">
              Are you sure you want to delete token #{token.serial}? This action cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Extend Token Modal */}
      <Modal isOpen={isExtendOpen} onClose={onExtendClose}>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent bg="rgba(0, 0, 0, 0.95)" borderColor="rgba(122, 236, 218, 0.3)">
          <ModalHeader color="#7aecda">Extend Token</ModalHeader>
          <ModalCloseButton color="#7aecda" />
          <ModalBody>
            <Text color="gray.300" mb={4}>
              Enter the number of days to extend token #{token.serial}
            </Text>
            <Input
              type="number"
              value={extensionDays}
              onChange={(e) => setExtensionDays(e.target.value)}
              placeholder="Enter days"
              color="#7aecda"
              bg="rgba(0, 0, 0, 0.3)"
              borderColor="rgba(122, 236, 218, 0.3)"
              _hover={{ borderColor: "rgba(122, 236, 218, 0.5)" }}
              _focus={{ borderColor: "rgba(122, 236, 218, 0.8)" }}
            />
            {error && (
              <Text color="red.300" mt={2}>
                {error}
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onExtendClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleExtend}
              isLoading={loading}
              loadingText="Extending..."
            >
              Extend
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default B2BTokenCard; 