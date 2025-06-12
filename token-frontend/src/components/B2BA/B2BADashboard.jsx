import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  Text,
  useColorModeValue,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Badge,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Button,
  Icon,
  Grid,
  GridItem,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Tooltip,
  ScaleFade,
  Fade,
  Center,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Box as ChakraBox
} from '@chakra-ui/react';
import {
  FiSearch,
  FiFilter,
  FiTrendingUp,
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiPlusCircle,
  FiRefreshCw,
  FiList,
  FiFileText,
  FiBarChart2,
  FiSettings,
  FiHelpCircle
} from 'react-icons/fi';
import B2BACreateToken from './B2BACreateToken';
import B2BARedeemToken from './B2BARedeemToken';
import B2BATokenCard from './B2BATokenCard';
import B2BAReports from './B2BAReports';
import Sidebar from '../Sidebar';
import HamburgerButton from '../HamburgerButton';
import Particles from '../Particles';
import '../Dashboard.css';
import { getApiUrl } from '../../services/api';

const MotionBox = motion(Box);

const B2BADashboard = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [tokens, setTokens] = useState([]);
  const [filteredTokens, setFilteredTokens] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showReports, setShowReports] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isParticlesMounted, setIsParticlesMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const fetchTokens = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(getApiUrl('api/b2ba/tokens'), {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch tokens');
      }

      const data = await response.json();
      console.log('Fetched tokens:', data.tokens);
      setTokens(data.tokens);
      setFilteredTokens(data.tokens);
    } catch (error) {
      console.error('Error fetching B2BA tokens:', error);
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
      if (statusFilter !== 'all' && (token.status || '').toLowerCase() !== statusFilter) {
        return false;
      }

      // For numeric queries (like "1", "2", etc.)
      if (!isNaN(query) && query.trim() !== '') {
        // Compare serial as string for loose match
        return (token.serial || '').toString() === query;
      }

      // For text queries, check all fields safely
      return (
        (token.serial || '').toString().includes(query) ||
        ((token.token || '').toLowerCase().includes(query)) ||
        ((token.agentName || '').toLowerCase().includes(query)) ||
        ((token.businessName || '').toLowerCase().includes(query)) ||
        ((token.phone || '').toLowerCase().includes(query)) ||
        ((token.agentLocation || '').toLowerCase().includes(query))
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTokens();
    setIsRefreshing(false);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDeleteToken = async (tokenCode) => {
    try {
      const response = await fetch(getApiUrl(`api/b2ba/tokens/${tokenCode}`), {
        method: 'DELETE'
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete token');
      }
      fetchTokens(); // Refresh the list
    } catch (error) {
      alert(error.message);
    }
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
      {/* Particles Background Layer */}
      <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0 }}>
        <Particles
          particleColors={['#ffffff', '#ffffff']}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>
      {/* Main content above particles */}
      <Box position="fixed" top="20px" left="20px" zIndex={1000}>
        <HamburgerButton onClick={toggleSidebar} />
      </Box>
      <motion.div
        initial={false}
        animate={isSidebarOpen ? "open" : "closed"}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '250px',
          zIndex: 999,
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Sidebar isOpen={isSidebarOpen} />
      </motion.div>
      <div className="dashboard-container" style={{ position: 'relative', zIndex: 1 }}>
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
              MODEL B2B - AGENT
            </motion.h2>
          </motion.div>
        </div>

        {/* Tabs in their own box */}
        <Box
          className="dashboard-tabs"
          bg="rgba(0, 0, 0, 0.3)"
          borderRadius="xl"
          border="1px solid rgba(122, 236, 218, 0.2)"
          p={4}
          mb={6}
          display="flex"
          flexWrap="wrap"
          justifyContent="center"
          alignItems="center"
        >
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
            transition="all 0.3s ease"
          >
            Create Token
          </Button>
          <Button
            leftIcon={<Icon as={FiCheckCircle} />}
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
            transition="all 0.3s ease"
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
            transition="all 0.3s ease"
          >
            Token List
          </Button>
          <Button
            leftIcon={<Icon as={FiBarChart2} />}
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
            transition="all 0.3s ease"
          >
            Reports
          </Button>
        </Box>

        {/* Content in its own box below tabs, now inside dashboard-container */}
        <Box
          className="content-container"
          bg="rgba(0, 0, 0, 0.3)"
          borderRadius="xl"
          border="1px solid rgba(122, 236, 218, 0.2)"
          p={6}
          mb={6}
          minHeight="300px"
          maxWidth="1200px"
          mx="auto"
        >
          <AnimatePresence mode="wait">
            {activeTab === 'create' && (
              <MotionBox
                key="create"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <B2BACreateToken onTokenCreated={fetchTokens} />
              </MotionBox>
            )}

            {activeTab === 'redeem' && (
              <MotionBox
                key="redeem"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <B2BARedeemToken onTokenRedeemed={fetchTokens} />
              </MotionBox>
            )}

            {activeTab === 'tokens' && (
              <MotionBox
                key="tokens"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <VStack spacing={6} align="stretch">
                  {/* Search and Filter Box */}
                  <Box bg="rgba(0, 0, 0, 0.3)" borderRadius="lg" border="1px solid rgba(122, 236, 218, 0.2)" p={4}>
                    <InputGroup size="md" mb={4}>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FiSearch} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        placeholder="Search by serial, token, agent name, phone, or location..."
                        value={searchQuery}
                        onChange={handleSearch}
                        bg="rgba(0, 0, 0, 0.3)"
                        border="1px solid rgba(122, 236, 218, 0.2)"
                        _hover={{ borderColor: 'rgba(122, 236, 218, 0.4)' }}
                        _focus={{ borderColor: '#7aecda', boxShadow: '0 0 0 1px #7aecda' }}
                        color="white"
                      />
                    </InputGroup>
                    <Menu>
                      <MenuButton
                        as={Button}
                        leftIcon={<FiFilter />}
                        variant="outline"
                        bg="rgba(0, 0, 0, 0.3)"
                        border="1px solid rgba(122, 236, 218, 0.2)"
                        _hover={{ borderColor: 'rgba(122, 236, 218, 0.4)' }}
                        color="white"
                      >
                        Filter
                      </MenuButton>
                      <MenuList bg="rgba(0, 0, 0, 0.8)" border="1px solid rgba(122, 236, 218, 0.2)">
                        <MenuItem onClick={() => setStatusFilter('all')} _hover={{ bg: 'rgba(122, 236, 218, 0.1)' }}>All</MenuItem>
                        <MenuItem onClick={() => setStatusFilter('active')} _hover={{ bg: 'rgba(122, 236, 218, 0.1)' }}>Active</MenuItem>
                        <MenuItem onClick={() => setStatusFilter('expired')} _hover={{ bg: 'rgba(122, 236, 218, 0.1)' }}>Expired</MenuItem>
                        <MenuItem onClick={() => setStatusFilter('redeemed')} _hover={{ bg: 'rgba(122, 236, 218, 0.1)' }}>Redeemed</MenuItem>
                      </MenuList>
                    </Menu>
                    <IconButton
                      icon={<Icon as={FiRefreshCw} />}
                      onClick={handleRefresh}
                      isLoading={isRefreshing}
                      variant="outline"
                      bg="rgba(0, 0, 0, 0.3)"
                      border="1px solid rgba(122, 236, 218, 0.2)"
                      _hover={{
                        borderColor: 'rgba(122, 236, 218, 0.4)'
                      }}
                    />
                  </Box>

                  {/* Token List Box */}
                  <Box bg="rgba(0, 0, 0, 0.3)" borderRadius="lg" border="1px solid rgba(122, 236, 218, 0.2)" p={4}>
                    {isLoading ? (
                      <Center py={8}>
                        <Spinner color="#7aecda" size="xl" />
                      </Center>
                    ) : error ? (
                      <Alert status="error" variant="subtle" borderRadius="md">
                        <AlertIcon />
                        <AlertTitle>Error!</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    ) : filteredTokens.length === 0 ? (
                      <Center py={8}>
                        <Text color="gray.400">No tokens found</Text>
                      </Center>
                    ) : (
                      <Grid
                        templateColumns={{
                          base: '1fr',
                          md: 'repeat(2, 1fr)',
                          lg: 'repeat(3, 1fr)'
                        }}
                        gap={4}
                      >
                        {filteredTokens.map((token) => (
                          <GridItem key={token.serial}>
                            <B2BATokenCard
                              key={token.tokenCode || token.token}
                              token={token}
                              onDelete={handleDeleteToken}
                              onExtend={fetchTokens}
                            />
                          </GridItem>
                        ))}
                      </Grid>
                    )}
                  </Box>
                </VStack>
              </MotionBox>
            )}

            {activeTab === 'reports' && (
              <MotionBox
                key="reports"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <B2BAReports tokens={tokens} />
              </MotionBox>
            )}
          </AnimatePresence>
        </Box>
      </div>
    </Box>
  );
};

export default B2BADashboard; 