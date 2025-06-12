import { Box, Text, VStack, Badge, Menu, MenuButton, MenuList, MenuItem, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, Input, useToast } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FiMoreVertical, FiEdit2, FiShare2, FiTrash2 } from 'react-icons/fi';
import { getApiUrl } from '../services/api';
import './TokenCard.css';

const TokenCard = ({ token, onTokenDeleted, highlight = false, autoExpand = false }) => {
  const [isExpanded, setIsExpanded] = useState(autoExpand);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [editedToken, setEditedToken] = useState({ ...token });
  const toast = useToast();

  // Effect to handle highlight animation
  useEffect(() => {
    if (highlight) {
      setIsExpanded(true);
    }
  }, [highlight]);

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
      const response = await fetch(getApiUrl(`token/${token.serial}`));
      if (!response.ok) throw new Error('Failed to get token details');
      const data = await response.json();
      // Open in WhatsApp Web instead of WhatsApp app
      const whatsappWebLink = data.whatsappLink.replace('https://wa.me/', 'https://web.whatsapp.com/send?');
      window.open(whatsappWebLink, '_blank');
    } catch (error) {
      console.error('Error sharing token:', error);
      toast({
        title: "Error",
        description: "Failed to share token. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(getApiUrl(`delete-token/${token.serial}`), {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete token');
      
      toast({
        title: "Success",
        description: "Token deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onDeleteClose();
      if (onTokenDeleted) onTokenDeleted(token.serial);
    } catch (error) {
      console.error('Error deleting token:', error);
      toast({
        title: "Error",
        description: "Failed to delete token. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEdit = async () => {
    try {
      const response = await fetch(getApiUrl(`edit-token/${token.serial}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerName: editedToken.ownerName,
          ownerPhone: editedToken.ownerPhone,
          residence: editedToken.residence,
          ownerBusiness: parseFloat(editedToken.ownerBusiness),
        }),
      });
      
      if (!response.ok) throw new Error('Failed to update token');
      const updatedToken = await response.json();
      
      toast({
        title: "Success",
        description: "Token updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onEditClose();
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating token:', error);
      toast({
        title: "Error",
        description: "Failed to update token. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          scale: highlight ? [1, 1.02, 1] : 1,
          transition: {
            scale: highlight ? {
              duration: 0.5,
              repeat: 2,
              repeatType: "reverse"
            } : undefined
          }
        }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="token-card"
      >
        <Box
          p={6}
          borderRadius="xl"
          bg={highlight ? "rgba(122, 236, 218, 0.1)" : "rgba(0, 0, 0, 0.3)"}
          border={highlight ? "1px solid rgba(122, 236, 218, 0.6)" : "1px solid rgba(122, 236, 218, 0.2)"}
          cursor="pointer"
          transition="all 0.3s ease"
          position="relative"
          overflow="hidden"
          className="token-card-inner"
          _hover={{
            border: highlight ? "1px solid rgba(122, 236, 218, 0.8)" : "1px solid rgba(122, 236, 218, 0.4)",
            transform: "translateY(-5px)",
            boxShadow: highlight ? "0 10px 30px -10px rgba(122, 236, 218, 0.4)" : "0 10px 30px -10px rgba(122, 236, 218, 0.2)"
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
                        icon={<FiEdit2 />}
                        onClick={onEditOpen}
                        _hover={{ bg: 'rgba(122, 236, 218, 0.1)' }}
                        color="#7aecda"
                      >
                        Edit
                      </MenuItem>
                      <MenuItem
                        icon={<FiShare2 />}
                        onClick={handleShare}
                        _hover={{ bg: 'rgba(122, 236, 218, 0.1)' }}
                        color="#7aecda"
                      >
                        Share
                      </MenuItem>
                      <MenuItem
                        icon={<FiTrash2 />}
                        onClick={onDeleteOpen}
                        _hover={{ bg: 'rgba(255, 0, 0, 0.1)' }}
                        color="red.400"
                      >
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Box>
              </Box>
            </Box>

            <VStack align="start" spacing={2} width="100%">
              <Text color="gray.300">Owner: {token.ownerName}</Text>
              <Text color="gray.300">Phone: {token.ownerPhone}</Text>
              <Text color="gray.300">Uses: {token.uses}/{token.maxUses}</Text>
              <Text color="gray.300">Owner Business: ₹{token.ownerBusiness}</Text>
              <Text color="gray.300">
                Redeemer Contribution: ₹
                {token.redeemerBusiness.reduce((sum, b) => sum + (b.amount || 0), 0)}
              </Text>
              <Text color="gray.300" fontWeight="bold">Total Business: ₹{token.totalBusiness}</Text>
            </VStack>

            {/* Expanded Content */}
            <motion.div
              initial={false}
              animate={{ height: isExpanded ? "auto" : 0 }}
              style={{ overflow: "hidden", width: "100%" }}
            >
              {isExpanded && (
                <VStack align="start" spacing={3} pt={4} width="100%">
                  <Text color="gray.300">Residence: {token.residence}</Text>
                  <Text color="gray.300">Issue Date: {formatDate(token.issueDate)}</Text>
                  <Text color="gray.300">Expiration: {formatDate(token.expirationDate)}</Text>
                  <Text color="gray.300">Remaining: {token.remainingDays}</Text>

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
                          <Text color="gray.300">Date: {formatDate(redemption.date)}</Text>
                          <Text color="gray.300">Name: {redemption.redeemerName}</Text>
                          <Text color="gray.300">Phone: {redemption.redeemerPhone}</Text>
                          {redemption.note && (
                            <Text color="orange.300" fontSize="sm" mt={1}>
                              Note: {redemption.note}
                            </Text>
                          )}
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

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent bg="rgba(0, 0, 0, 0.95)" borderColor="rgba(122, 236, 218, 0.3)">
          <ModalHeader color="#7aecda">Edit Token</ModalHeader>
          <ModalCloseButton color="#7aecda" />
          <ModalBody>
            <VStack spacing={4}>
              <Input
                placeholder="Owner Name"
                value={editedToken.ownerName}
                onChange={(e) => setEditedToken({ ...editedToken, ownerName: e.target.value })}
                bg="rgba(0, 0, 0, 0.3)"
                borderColor="rgba(122, 236, 218, 0.3)"
                color="#7aecda"
              />
              <Input
                placeholder="Owner Phone"
                value={editedToken.ownerPhone}
                onChange={(e) => setEditedToken({ ...editedToken, ownerPhone: e.target.value })}
                bg="rgba(0, 0, 0, 0.3)"
                borderColor="rgba(122, 236, 218, 0.3)"
                color="#7aecda"
              />
              <Input
                placeholder="Residence"
                value={editedToken.residence}
                onChange={(e) => setEditedToken({ ...editedToken, residence: e.target.value })}
                bg="rgba(0, 0, 0, 0.3)"
                borderColor="rgba(122, 236, 218, 0.3)"
                color="#7aecda"
              />
              <Input
                placeholder="Owner Business"
                type="number"
                value={editedToken.ownerBusiness}
                onChange={(e) => setEditedToken({ ...editedToken, ownerBusiness: e.target.value })}
                bg="rgba(0, 0, 0, 0.3)"
                borderColor="rgba(122, 236, 218, 0.3)"
                color="#7aecda"
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleEdit}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TokenCard; 