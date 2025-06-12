import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Input, InputGroup, InputLeftElement, VStack, Text, useColorModeValue, HStack, Menu, MenuButton, MenuList, MenuItem, IconButton, Badge, Flex, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Button, Icon } from '@chakra-ui/react';
import { FiSearch, FiFilter, FiTrendingUp, FiUsers, FiClock, FiCheckCircle, FiPlusCircle, FiRefreshCw, FiList, FiFileText } from 'react-icons/fi';
import B2BCreateToken from './B2BCreateToken';
import B2BRedeemToken from './B2BRedeemToken';
import B2BTokenCard from './B2BTokenCard';
import B2BReports from './B2BReports';
import Sidebar from '../Sidebar';
import HamburgerButton from '../HamburgerButton';
import Particles from '../Particles';
import '../Dashboard.css';
import { getApiUrl } from '../../services/api';

const B2BDashboard = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [tokens, setTokens] = useState([]);
  const [filteredTokens, setFilteredTokens] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'expired'
  const [showReports, setShowReports] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isParticlesMounted, setIsParticlesMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTokens = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(getApiUrl('api/b2b/tokens'));
      if (!response.ok) {
        throw new Error('Failed to fetch tokens');
      }
      const data = await response.json();
      console.log('Fetched tokens:', data.tokens);
      setTokens(data.tokens);
      setFilteredTokens(data.tokens);
    } catch (error) {
      console.error('Error fetching B2B tokens:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
    // Mount particles after a short delay to ensure proper initialization
    const timer = setTimeout(() => {
      setIsParticlesMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Update filter effect to include status
  useEffect(() => {
    if (!searchQuery.trim() && statusFilter === 'all') {
      setFilteredTokens(tokens);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    console.log('Search query:', query);

    const filtered = tokens.filter(token => {
      // Status filter
      if (statusFilter !== 'all' && token.status.toLowerCase() !== statusFilter) {
        return false;
      }

      // For numeric queries (like "1", "2", etc.)
      if (!isNaN(query) && query.trim() !== '') {
        // Only match exact serial numbers for numeric queries
        return token.serial === parseInt(query);
      }

      // For text queries, check all fields
      return (
        token.serial.toString().includes(query) ||
        token.token.toLowerCase().includes(query) ||
        token.businessName.toLowerCase().includes(query) ||
        token.businessOwner.toLowerCase().includes(query) ||
        token.businessPhone.includes(query)
      );
    });

    console.log('Filtered tokens:', filtered);
    setFilteredTokens(filtered);
  }, [searchQuery, statusFilter, tokens]);

  // Add stats calculation
  const stats = {
    totalTokens: tokens.length,
    activeTokens: tokens.filter(t => t.status === 'Active').length,
    expiredTokens: tokens.filter(t => t.status === 'Expired').length,
    totalRedemptions: tokens.reduce((sum, t) => sum + (t.redemptions?.length || 0), 0)
  };

  return (
    <Box
      width="100%"
      minHeight="100vh"
      bg="black"
      position="relative"
      overflow="hidden"
      style={{ boxSizing: 'border-box' }}
    >
      {/* Background Layer */}
      {isParticlesMounted && (
        <Box 
          position="fixed" 
          top={0} 
          left={0} 
          right={0} 
          bottom={0} 
          zIndex={0}
          style={{ 
            width: '100%', 
            height: '100%',
            pointerEvents: 'none'
          }}
        >
          <Particles
            particleColors={['#7aecda', '#4079ff']}
            particleCount={200}
            particleSpread={10}
            speed={0.1}
            particleBaseSize={100}
            moveParticlesOnHover={true}
            particleHoverFactor={2}
            alphaParticles={false}
            sizeRandomness={1}
            cameraDistance={20}
            disableRotation={false}
            className="particles-container"
          />
        </Box>
      )}

      {/* Content Layer */}
      <Box 
        position="relative" 
        zIndex={1}
        style={{ 
          pointerEvents: 'auto',
          width: '100%',
          minHeight: '100vh',
          padding: '2rem',
          boxSizing: 'border-box'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="dashboard-container"
        >
          {error ? (
            <Box 
              p={8} 
              textAlign="center" 
              bg="rgba(255, 0, 0, 0.1)" 
              borderRadius="xl"
              border="1px solid rgba(255, 0, 0, 0.2)"
            >
              <Text color="red.400" fontSize="xl" mb={4}>
                Error: {error}
              </Text>
              <Button
                onClick={fetchTokens}
                colorScheme="red"
                variant="outline"
                _hover={{ bg: 'rgba(255, 0, 0, 0.1)' }}
              >
                Retry
              </Button>
            </Box>
          ) : isLoading ? (
            <Box 
              p={8} 
              textAlign="center"
              bg="rgba(0, 0, 0, 0.3)"
              borderRadius="xl"
              border="1px solid rgba(122, 236, 218, 0.2)"
            >
              <Text color="#7aecda" fontSize="xl">
                Loading...
              </Text>
            </Box>
          ) : (
            <>
              <div className="dashboard-header">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="header-content"
                >
                  <motion.h1
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="main-title"
                  >
                    KALON TOKEN SYSTEM
                  </motion.h1>
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "100%" }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="title-underline"
                  />
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="subtitle"
                  >
                    MODEL B2B
                  </motion.h2>
                </motion.div>
              </div>

              <div className="dashboard-tabs">
                <Button
                  leftIcon={<Icon as={FiPlusCircle} />}
                  className={activeTab === 'create' ? 'active' : ''}
                  onClick={() => setActiveTab('create')}
                  variant="ghost"
                  size="lg"
                  px={6}
                  py={4}
                  _hover={{
                    bg: 'rgba(122, 236, 218, 0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 5px 15px rgba(122, 236, 218, 0.2)'
                  }}
                  _active={{
                    bg: 'rgba(122, 236, 218, 0.15)',
                    transform: 'translateY(0)'
                  }}
                >
                  Create Token
                </Button>

                <Button
                  leftIcon={<Icon as={FiRefreshCw} />}
                  className={activeTab === 'redeem' ? 'active' : ''}
                  onClick={() => setActiveTab('redeem')}
                  variant="ghost"
                  size="lg"
                  px={6}
                  py={4}
                  _hover={{
                    bg: 'rgba(122, 236, 218, 0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 5px 15px rgba(122, 236, 218, 0.2)'
                  }}
                  _active={{
                    bg: 'rgba(122, 236, 218, 0.15)',
                    transform: 'translateY(0)'
                  }}
                >
                  Redeem Token
                </Button>

                <Button
                  leftIcon={<Icon as={FiList} />}
                  className={activeTab === 'tokens' ? 'active' : ''}
                  onClick={() => setActiveTab('tokens')}
                  variant="ghost"
                  size="lg"
                  px={6}
                  py={4}
                  _hover={{
                    bg: 'rgba(122, 236, 218, 0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 5px 15px rgba(122, 236, 218, 0.2)'
                  }}
                  _active={{
                    bg: 'rgba(122, 236, 218, 0.15)',
                    transform: 'translateY(0)'
                  }}
                >
                  Token Details
                </Button>

                <Button
                  leftIcon={<Icon as={FiFileText} />}
                  className={activeTab === 'reports' ? 'active' : ''}
                  onClick={() => setActiveTab('reports')}
                  variant="ghost"
                  size="lg"
                  px={6}
                  py={4}
                  _hover={{
                    bg: 'rgba(122, 236, 218, 0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 5px 15px rgba(122, 236, 218, 0.2)'
                  }}
                  _active={{
                    bg: 'rgba(122, 236, 218, 0.15)',
                    transform: 'translateY(0)'
                  }}
                >
                  Generate Report
                </Button>
              </div>

              <div className="dashboard-content">
                {activeTab === 'create' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <B2BCreateToken onTokenCreated={fetchTokens} />
                  </motion.div>
                )}

                {activeTab === 'redeem' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <B2BRedeemToken onTokenRedeemed={fetchTokens} />
                  </motion.div>
                )}

                {activeTab === 'tokens' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="token-details-container"
                  >
                    {/* Search and Filter Bar */}
                    <Box 
                      mb={6} 
                      px={4}
                      position="sticky"
                      top="2rem"
                      zIndex={2}
                      backdropFilter="blur(10px)"
                      bg="rgba(0, 0, 0, 0.8)"
                      py={4}
                      borderRadius="xl"
                      border="1px solid rgba(122, 236, 218, 0.2)"
                    >
                      <VStack spacing={2} align="stretch">
                        <HStack spacing={3}>
                          {/* Search Input - Now smaller */}
                          <InputGroup size="lg" flex="1">
                            <InputLeftElement
                              pointerEvents="none"
                              color="#7aecda"
                              fontSize="1.2em"
                              children={<FiSearch />}
                            />
                            <Input
                              placeholder="Enter exact serial number (e.g. 1) or search business details..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              bg="rgba(0, 0, 0, 0.3)"
                              borderColor="rgba(122, 236, 218, 0.3)"
                              color="#7aecda"
                              _placeholder={{ color: "rgba(122, 236, 218, 0.6)" }}
                              _hover={{ borderColor: "rgba(122, 236, 218, 0.5)" }}
                              _focus={{ 
                                borderColor: "rgba(122, 236, 218, 0.8)",
                                boxShadow: "0 0 0 1px rgba(122, 236, 218, 0.4)"
                              }}
                              size="lg"
                              fontSize="md"
                              py={6}
                            />
                          </InputGroup>

                          {/* Status Filter Button */}
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              icon={<FiFilter />}
                              variant="ghost"
                              color="#7aecda"
                              bg="rgba(0, 0, 0, 0.3)"
                              _hover={{ bg: 'rgba(122, 236, 218, 0.1)' }}
                              _active={{ bg: 'rgba(122, 236, 218, 0.2)' }}
                              sx={{
                                border: '1px solid rgba(122, 236, 218, 0.3)',
                                boxShadow: '0 0 10px rgba(122, 236, 218, 0.1)',
                                backdropFilter: 'blur(10px)',
                              }}
                              size="lg"
                              fontSize="1.2em"
                            />
                            <MenuList 
                              bg="rgba(0, 0, 0, 0.9)"
                              borderColor="rgba(122, 236, 218, 0.3)"
                              boxShadow="0 0 20px rgba(122, 236, 218, 0.1)"
                              backdropFilter="blur(10px)"
                            >
                              <MenuItem 
                                onClick={() => setStatusFilter('all')}
                                bg={statusFilter === 'all' ? 'rgba(122, 236, 218, 0.1)' : 'transparent'}
                                _hover={{ bg: 'rgba(122, 236, 218, 0.1)' }}
                              >
                                <HStack spacing={2}>
                                  <Text>All Tokens</Text>
                                  {statusFilter === 'all' && (
                                    <Badge colorScheme="blue" ml="auto">Active</Badge>
                                  )}
                                </HStack>
                              </MenuItem>
                              <MenuItem 
                                onClick={() => setStatusFilter('active')}
                                bg={statusFilter === 'active' ? 'rgba(122, 236, 218, 0.1)' : 'transparent'}
                                _hover={{ bg: 'rgba(122, 236, 218, 0.1)' }}
                              >
                                <HStack spacing={2}>
                                  <Text>Active Tokens</Text>
                                  {statusFilter === 'active' && (
                                    <Badge colorScheme="green" ml="auto">Active</Badge>
                                  )}
                                </HStack>
                              </MenuItem>
                              <MenuItem 
                                onClick={() => setStatusFilter('expired')}
                                bg={statusFilter === 'expired' ? 'rgba(122, 236, 218, 0.1)' : 'transparent'}
                                _hover={{ bg: 'rgba(122, 236, 218, 0.1)' }}
                              >
                                <HStack spacing={2}>
                                  <Text>Expired Tokens</Text>
                                  {statusFilter === 'expired' && (
                                    <Badge colorScheme="red" ml="auto">Active</Badge>
                                  )}
                                </HStack>
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </HStack>

                        {/* Results Count */}
                        {searchQuery && (
                          <Box>
                            <Text color="gray.400" fontSize="sm" mb={1}>
                              {filteredTokens.length} token{filteredTokens.length !== 1 ? 's' : ''} found
                              {!isNaN(searchQuery) && " (exact serial match)"}
                              {statusFilter !== 'all' && ` (${statusFilter} only)`}
                            </Text>
                            {!isNaN(searchQuery) && filteredTokens.length === 0 && (
                              <Text color="orange.300" fontSize="xs">
                                No token found with serial number {searchQuery}
                              </Text>
                            )}
                          </Box>
                        )}
                      </VStack>
                    </Box>

                    {/* Token Grid */}
                    <div className="token-grid">
                      {filteredTokens.map(token => (
                        <B2BTokenCard
                          key={token._id}
                          token={token}
                          onTokenUpdated={fetchTokens}
                        />
                      ))}
                    </div>

                    {filteredTokens.length === 0 && searchQuery && (
                      <Box textAlign="center" py={8}>
                        <Text color="gray.400" fontSize="lg">
                          No tokens found matching "{searchQuery}"
                        </Text>
                      </Box>
                    )}
                  </motion.div>
                )}

                {activeTab === 'reports' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <B2BReports tokens={tokens} />
                  </motion.div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </Box>

      {/* Navigation Layer - Always on top */}
      <Box 
        position="fixed" 
        top={0} 
        left={0} 
        right={0} 
        bottom={0} 
        zIndex={1000}
        style={{ pointerEvents: 'none' }}
      >
        <Box style={{ pointerEvents: 'auto' }}>
          <HamburgerButton 
            isOpen={isSidebarOpen} 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          />
          <Sidebar isOpen={isSidebarOpen} />
        </Box>
      </Box>
    </Box>
  );
};

export default B2BDashboard; 