import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  VStack,
  Text,
  Spinner,
  Center,
  Heading,
  SimpleGrid,
  Badge,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
  Button,
  Tooltip,
  Divider
} from '@chakra-ui/react';
import {
  FiTrendingUp,
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiDownload,
  FiPrinter
} from 'react-icons/fi';
import { getApiUrl } from '../../services/api';

const MotionBox = motion(Box);

// StatCard Component for summary statistics
const StatCard = ({ icon: Icon, label, value, helpText }) => (
  <Stat
    px={4}
    py={3}
    bg="rgba(0, 0, 0, 0.3)"
    borderRadius="lg"
    border="1px solid rgba(122, 236, 218, 0.2)"
    _hover={{
      transform: 'translateY(-2px)',
      borderColor: 'rgba(122, 236, 218, 0.4)',
      boxShadow: '0 4px 12px rgba(122, 236, 218, 0.1)'
    }}
    transition="all 0.3s ease"
  >
    <StatLabel color="gray.400" display="flex" alignItems="center" gap={2}>
      <Icon color="#7aecda" />
      {label}
    </StatLabel>
    <StatNumber color="#7aecda" fontSize="2xl">{value}</StatNumber>
    <StatHelpText color="gray.400">{helpText}</StatHelpText>
  </Stat>
);

const B2BAReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // First try to get all tokens
        const response = await fetch(getApiUrl('api/b2ba/tokens'));
        if (!response.ok) {
          throw new Error('Failed to fetch tokens');
        }
        const result = await response.json();
        
        // Calculate summary statistics
        const tokens = result.tokens || [];
        const activeTokens = tokens.filter(t => t.status === 'active').length;
        const expiredTokens = tokens.filter(t => t.status === 'expired').length;
        const totalBusiness = tokens.reduce((sum, t) => sum + (t.totalBusiness || 0), 0);

        setData({
          summary: {
            totalTokens: tokens.length,
            activeTokens,
            expiredTokens,
            totalBusiness
          },
          tokens
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to load reports. Please try again.');
        toast({
          title: "Error",
          description: "Failed to load reports. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top-right"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [toast]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="#7aecda" thickness="4px" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="100vh">
        <Text color="red.500">{error}</Text>
      </Center>
    );
  }

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      padding={6}
    >
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading color="#7aecda" size="lg">B2BA Token Reports</Heading>
          <Flex gap={2}>
            <Tooltip label="Export feature coming soon!" placement="top">
              <Button
                leftIcon={<FiDownload />}
                isDisabled
                variant="outline"
                colorScheme="teal"
                size="sm"
              >
                Export
              </Button>
            </Tooltip>
            <Tooltip label="Print feature coming soon!" placement="top">
              <Button
                leftIcon={<FiPrinter />}
                isDisabled
                variant="outline"
                colorScheme="teal"
                size="sm"
              >
                Print
              </Button>
            </Tooltip>
          </Flex>
        </Flex>

        {/* Summary Statistics */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <StatCard
            icon={FiUsers}
            label="Total Tokens"
            value={data?.summary?.totalTokens || 0}
            helpText="Total tokens issued"
          />
          <StatCard
            icon={FiCheckCircle}
            label="Active Tokens"
            value={data?.summary?.activeTokens || 0}
            helpText="Currently active tokens"
          />
          <StatCard
            icon={FiClock}
            label="Expired Tokens"
            value={data?.summary?.expiredTokens || 0}
            helpText="Total expired tokens"
          />
          <StatCard
            icon={FiTrendingUp}
            label="Total Business"
            value={formatCurrency(data?.summary?.totalBusiness || 0)}
            helpText="Total business generated"
          />
        </SimpleGrid>

        <Divider borderColor="rgba(122, 236, 218, 0.2)" />

        {/* Tokens Table */}
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th color="gray.400">Serial</Th>
                <Th color="gray.400">Business Name</Th>
                <Th color="gray.400">Agent Name</Th>
                <Th color="gray.400">Status</Th>
                <Th color="gray.400">Uses</Th>
                <Th color="gray.400">Total Business</Th>
                <Th color="gray.400">Remaining Days</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data?.tokens?.map((token) => (
                <Tr key={token.serial} _hover={{ bg: 'rgba(122, 236, 218, 0.1)' }}>
                  <Td color="#7aecda">{token.serial}</Td>
                  <Td color="white">{token.businessName}</Td>
                  <Td color="white">{token.agentName}</Td>
                  <Td>
                    <Badge
                      colorScheme={token.status === 'active' ? 'green' : 'red'}
                      px={2}
                      py={1}
                      borderRadius="full"
                    >
                      {token.status}
                    </Badge>
                  </Td>
                  <Td color="white">{token.currentUses}/{token.maxUses}</Td>
                  <Td color="#7aecda">{formatCurrency(token.totalBusiness)}</Td>
                  <Td color="white">{token.remainingDays}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </MotionBox>
  );
};

export default B2BAReports; 