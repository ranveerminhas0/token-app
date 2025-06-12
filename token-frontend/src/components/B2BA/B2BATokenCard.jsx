import React, { useState } from 'react';
import { 
  Box, 
  Text, 
  VStack, 
  Badge, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  IconButton, 
  useDisclosure, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalFooter, 
  ModalBody, 
  ModalCloseButton, 
  Button, 
  Input,
  useToast
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiMoreVertical, FiShare2, FiClock, FiTrash2 } from 'react-icons/fi';
import { getApiUrl } from '../../services/api';

const B2BATokenCard = ({ token, onDelete, onExtend }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isExtendOpen, onOpen: onExtendOpen, onClose: onExtendClose } = useDisclosure();
  const [extensionDays, setExtensionDays] = useState('');
  const toast = useToast();

  // Field mapping with fallback and N/A
  const serial = token.serial || 'N/A';
  const tokenCode = token.tokenCode || token.token || 'N/A';
  const businessName = token.businessName || 'N/A';
  const agentName = token.agentName || 'N/A';
  const phone = token.phone || 'N/A';
  const type = token.businessType || token.type || 'N/A';
  const region = token.region || token.regionZone || 'N/A';
  const commission = token.commission !== undefined && token.commission !== null ? token.commission : 'N/A';
  const uses = (typeof token.currentUses === 'number' && typeof token.maxUses === 'number') ? `${token.currentUses}/${token.maxUses}` : 'N/A';
  const issueDate = token.issueDate || token.createdAt || null;
  const expirationDate = token.expirationDate || token.expiration || null;
  const status = (token.status || '').toLowerCase();
  const redemptions = token.redemptions || [];

  // Format helpers
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return isNaN(d) ? 'N/A' : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Total Business (if available)
  const totalBusiness = typeof token.totalBusiness === 'number' ? token.totalBusiness : (typeof token.billAmount === 'number' ? token.billAmount : null);

  // Add validation for redemption data
  const validateRedemption = (redemption) => {
    return {
      name: redemption.redeemerName || 'N/A',
      phone: redemption.redeemerPhone || 'N/A',
      residence: redemption.redeemerResidence || 'N/A',
      billAmount: typeof redemption.billAmount === 'number' ? redemption.billAmount : 0,
      date: redemption.date || 'N/A'
    };
  };

  const handleShare = () => {
    // Log token and redemptions for debugging
    console.log('Token:', token);
    console.log('Redemptions:', token.redemptions);

    const message = `*KALON SALON & ACADEMY💇‍♂️*\n\n*YOUR B2B-AGENT TOKEN :*\n\n*SERIAL:* ${serial}\n*TOKEN CODE:* ${tokenCode}\n*BUSINESS NAME:* ${businessName}\n*AGENT NAME:* ${agentName}\n*AGENT PHONE NUMBER:* ${phone}\n*TYPE OF BUSINESS:* ${type}\n*REGION/ZONE:* ${region}\n*COMMISSION %:* ${commission}${commission !== 'N/A' ? '%' : ''}\n*MAX USES:* ${uses}\n*STATUS:* ${statusLabel}\n*EXPIRATION DATE:* ${formatDate(expirationDate)}\n*REMAINING DAYS:* ${token.remainingDays}\n\n*BUSINESS SUMMARY:*\n*TOTAL BUSINESS:* ${formatCurrency(totalBusiness)}\n\n${redemptions.length > 0 ? `*REDEMPTION HISTORY:*\n${redemptions.map((redemption, index) => {
      const validatedRedemption = validateRedemption(redemption);
      return `${index + 1}. *REDEEMER NAME:* ${validatedRedemption.name}\n   *REDEEMER PHONE NO.:* ${validatedRedemption.phone}\n   *REDEEMER RESIDENCE:* ${validatedRedemption.residence}\n   *BILL AMOUNT:* ${formatCurrency(validatedRedemption.billAmount)}\n   *REDEMPTION DATE:* ${formatDate(validatedRedemption.date)}`;
    }).join('\n\n')}` : ''}\n\n*FOLLOW US ON INSTAGRAM⬇️*\nhttps://bit.ly/3F7Bv1E\n\n_Thanks for your business💌_`;
    const whatsappUrl = `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleExtend = async () => {
    if (!extensionDays || isNaN(extensionDays) || extensionDays <= 0) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter a valid number of days',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      const response = await fetch(getApiUrl(`api/b2ba/tokens/extend/${token.tokenCode}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: Number(extensionDays) })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to extend token');
      }
      toast({
        title: 'Success',
        description: 'Token extended successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onExtendClose();
      setExtensionDays('');
      if (onExtend) onExtend();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to extend token',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(token.tokenCode);
      toast({
        title: 'Success',
        description: 'Token deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onDeleteClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete token',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Status badge color
  const statusColor = status === 'expired' ? 'red' : 'green';
  const statusLabel = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Active';

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        onClick={() => setIsExpanded(!isExpanded)}
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
          _hover={{
            border: "1px solid rgba(122, 236, 218, 0.4)",
            transform: "translateY(-5px)",
            boxShadow: "0 10px 30px -10px rgba(122, 236, 218, 0.2)"
          }}
        >
          <VStack align="start" spacing={3}>
            <Box display="flex" justifyContent="space-between" width="100%" alignItems="center">
              <Text color="#7aecda" fontSize="xl" fontWeight="bold">
                #{serial} - {tokenCode}
              </Text>
              <Box display="flex" alignItems="center" gap={2}>
                <Badge colorScheme={statusColor} fontSize="md" px={3} py={1}>
                  {statusLabel}
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
              {businessName}
            </Text>

            {/* Expanded Content */}
            <motion.div
              initial={false}
              animate={{ height: isExpanded ? "auto" : 0 }}
              style={{ overflow: "hidden", width: "100%" }}
            >
              {isExpanded && (
                <VStack align="start" spacing={3} pt={4} width="100%">
                  <Text color="gray.300">Agent: {agentName}</Text>
                  <Text color="gray.300">Phone: {phone}</Text>
                  <Text color="gray.300">Type: {type}</Text>
                  <Text color="gray.300">Region/Zone: {region}</Text>
                  <Text color="gray.300">Commission: {commission !== 'N/A' ? `${commission}%` : 'N/A'}</Text>
                  <Text color="gray.300">Uses: {uses}</Text>
                  <Text color="gray.300">Total Business: {formatCurrency(totalBusiness)}</Text>
                  <Text color="gray.300">Issue Date: {formatDate(issueDate)}</Text>
                  <Text color="gray.300">Expiration: {formatDate(expirationDate)}</Text>
                  <Text color="gray.300">Remaining Days: {token.remainingDays}</Text>

                  {redemptions && redemptions.length > 0 && (
                    <VStack align="start" spacing={2} width="100%">
                      <Text color="#7aecda" fontWeight="bold">Redemption History:</Text>
                      {redemptions.map((redemption, idx) => (
                        <Box 
                          key={idx} 
                          p={3} 
                          bg="rgba(0,0,0,0.3)" 
                          borderRadius="md" 
                          width="100%"
                          border="1px solid rgba(122, 236, 218, 0.1)"
                        >
                          <Text color="gray.300">Date: {formatDate(redemption.redemptionDate || redemption.date)}</Text>
                          <Text color="gray.300">Name: {redemption.redeemerName || redemption.name}</Text>
                          <Text color="gray.300">Phone: {redemption.redeemerPhone || redemption.phone}</Text>
                          <Text color="gray.300">Residence: {redemption.redeemerResidence || redemption.residence}</Text>
                          <Text color="gray.300">Bill Amount: {formatCurrency(redemption.billAmount)}</Text>
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
              Are you sure you want to delete token #{serial}? This action cannot be undone.
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
              Enter the number of days to extend token #{serial}
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
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onExtendClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleExtend}
            >
              Extend
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default B2BATokenCard; 