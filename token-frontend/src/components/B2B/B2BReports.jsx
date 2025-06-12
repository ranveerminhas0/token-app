import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  Grid, 
  GridItem, 
  Text, 
  VStack, 
  HStack, 
  Stat, 
  StatLabel, 
  StatNumber, 
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Icon,
  Flex,
  Select,
  Button,
  useToast
} from '@chakra-ui/react';
import { 
  FaChartBar, 
  FaBusinessTime, 
  FaCheckCircle, 
  FaTimesCircle,
  FaDownload,
  FaCalendarAlt,
  FaChartLine,
  FaChartPie,
  FaUsers,
  FaRupeeSign
} from 'react-icons/fa';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import '../Reports.css';

const COLORS = ['#7aecda', '#4079ff', '#ff6b6b', '#4ecdc4', '#45b7d1'];

const B2BReports = ({ tokens }) => {
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();

  // Set loading to false when tokens are available
  useEffect(() => {
    if (tokens) {
      setLoading(false);
    }
  }, [tokens]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!tokens || tokens.length === 0) {
      setLoading(false);
      return null;
    }

    try {
      const activeTokens = tokens.filter(t => t.status.toLowerCase() === 'active');
      const expiredTokens = tokens.filter(t => t.status.toLowerCase() === 'expired');
      const totalBusiness = tokens.reduce((sum, t) => sum + (t.totalBusiness || 0), 0);
      const uniqueBusinesses = new Set(tokens.map(t => t.businessName)).size;
      const totalRedemptions = tokens.reduce((sum, t) => sum + (t.redemptions?.length || 0), 0);
      const avgRedemptions = totalRedemptions / tokens.length;

      // Calculate month-over-month growth
      const currentMonth = new Date().getMonth();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const currentMonthTokens = tokens.filter(t => new Date(t.issueDate).getMonth() === currentMonth);
      const lastMonthTokens = tokens.filter(t => new Date(t.issueDate).getMonth() === lastMonth);
      const growthRate = lastMonthTokens.length === 0 ? 100 : 
        ((currentMonthTokens.length - lastMonthTokens.length) / lastMonthTokens.length) * 100;

      return {
        totalTokens: tokens.length,
        activeTokens: activeTokens.length,
        expiredTokens: expiredTokens.length,
        totalBusiness,
        uniqueBusinesses,
        totalRedemptions,
        avgRedemptions,
        growthRate
      };
    } catch (err) {
      console.error('Error calculating stats:', err);
      setError('Error calculating statistics');
      return null;
    }
  }, [tokens]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!tokens || tokens.length === 0) return {
      creationTrend: [],
      businessTypes: [],
      redemptionTrend: []
    };

    try {
      // Token creation trend
      const creationTrend = tokens.reduce((acc, token) => {
        const date = new Date(token.issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      // Business type distribution
      const businessTypes = tokens.reduce((acc, token) => {
        if (token.businessType) {
          acc[token.businessType] = (acc[token.businessType] || 0) + 1;
        }
        return acc;
      }, {});

      // Redemption trend
      const redemptionTrend = tokens.reduce((acc, token) => {
        token.redemptions?.forEach(redemption => {
          const date = new Date(redemption.redemptionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          acc[date] = (acc[date] || 0) + 1;
        });
        return acc;
      }, {});

      return {
        creationTrend: Object.entries(creationTrend)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => new Date(a.date) - new Date(b.date)),
        businessTypes: Object.entries(businessTypes)
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count),
        redemptionTrend: Object.entries(redemptionTrend)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => new Date(a.date) - new Date(b.date))
      };
    } catch (err) {
      console.error('Error preparing chart data:', err);
      setError('Error preparing chart data');
      return {
        creationTrend: [],
        businessTypes: [],
        redemptionTrend: []
      };
    }
  }, [tokens]);

  const handleExport = () => {
    // TODO: Implement PDF export
    toast({
      title: "Export Coming Soon!",
      description: "PDF export functionality will be available in the next update.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  if (loading) return (
    <Box 
      textAlign="center" 
      py={10}
      bg="rgba(0, 0, 0, 0.3)"
      borderRadius="xl"
      border="1px solid rgba(122, 236, 218, 0.2)"
      backdropFilter="blur(10px)"
    >
      <Text color="#7aecda" fontSize="xl">Loading analytics...</Text>
      <Text color="gray.400" fontSize="sm" mt={2}>Preparing your business insights</Text>
    </Box>
  );

  if (error) return (
    <Box 
      textAlign="center" 
      py={10}
      bg="rgba(0, 0, 0, 0.3)"
      borderRadius="xl"
      border="1px solid rgba(255, 107, 107, 0.2)"
      backdropFilter="blur(10px)"
    >
      <Text color="red.300" fontSize="xl">{error}</Text>
      <Text color="gray.400" fontSize="sm" mt={2}>Please try refreshing the page</Text>
    </Box>
  );

  if (!stats || !chartData) return (
    <Box 
      textAlign="center" 
      py={10}
      bg="rgba(0, 0, 0, 0.3)"
      borderRadius="xl"
      border="1px solid rgba(122, 236, 218, 0.2)"
      backdropFilter="blur(10px)"
    >
      <Text color="#7aecda" fontSize="xl">No Data Available</Text>
      <Text color="gray.400" fontSize="sm" mt={2}>Create some tokens to see analytics</Text>
    </Box>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="reports-container"
    >
      {/* Header with Controls */}
      <Box 
        mb={6} 
        p={4} 
        borderRadius="xl"
        bg="rgba(0, 0, 0, 0.3)"
        border="1px solid rgba(122, 236, 218, 0.2)"
        backdropFilter="blur(10px)"
      >
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <VStack align="start" spacing={1}>
            <Text color="#7aecda" fontSize="2xl" fontWeight="bold">Analytics Dashboard</Text>
            <Text color="gray.400">Real-time business insights and token analytics</Text>
          </VStack>
          <HStack spacing={4}>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              bg="rgba(0, 0, 0, 0.3)"
              borderColor="rgba(122, 236, 218, 0.3)"
              color="#7aecda"
              _hover={{ borderColor: "rgba(122, 236, 218, 0.5)" }}
              _focus={{ borderColor: "rgba(122, 236, 218, 0.8)" }}
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last 12 Months</option>
            </Select>
            <Button
              leftIcon={<FaDownload />}
              onClick={handleExport}
              bg="rgba(122, 236, 218, 0.1)"
              color="#7aecda"
              _hover={{ bg: "rgba(122, 236, 218, 0.2)" }}
              border="1px solid rgba(122, 236, 218, 0.3)"
            >
              Export Report
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Key Metrics */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6} mb={8}>
        <GridItem>
          <StatCard
            icon={FaChartBar}
            label="Total Tokens"
            value={stats.totalTokens}
            helpText={`${stats.growthRate > 0 ? '+' : ''}${stats.growthRate.toFixed(1)}% from last month`}
            trend={stats.growthRate > 0 ? 'increase' : 'decrease'}
          />
        </GridItem>
        <GridItem>
          <StatCard
            icon={FaBusinessTime}
            label="Active Tokens"
            value={stats.activeTokens}
            helpText={`${((stats.activeTokens / stats.totalTokens) * 100).toFixed(1)}% of total`}
          />
        </GridItem>
        <GridItem>
          <StatCard
            icon={FaRupeeSign}
            label="Total Business"
            value={`₹${stats.totalBusiness.toLocaleString()}`}
            helpText={`₹${(stats.totalBusiness / stats.totalTokens).toLocaleString()} per token`}
          />
        </GridItem>
        <GridItem>
          <StatCard
            icon={FaUsers}
            label="Unique Businesses"
            value={stats.uniqueBusinesses}
            helpText={`${stats.totalRedemptions} total redemptions`}
          />
        </GridItem>
      </Grid>

      {/* Charts */}
      <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
        {/* Token Creation Trend */}
        <GridItem>
          <ChartCard
            title="Token Creation Trend"
            icon={FaChartLine}
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.creationTrend}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7aecda" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#7aecda" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(122, 236, 218, 0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="#7aecda"
                  tick={{ fill: '#7aecda' }}
                />
                <YAxis 
                  stroke="#7aecda"
                  tick={{ fill: '#7aecda' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid rgba(122, 236, 218, 0.3)',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#7aecda' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#7aecda" 
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </GridItem>

        {/* Business Type Distribution */}
        <GridItem>
          <ChartCard
            title="Business Type Distribution"
            icon={FaChartPie}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.businessTypes}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {chartData.businessTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid rgba(122, 236, 218, 0.3)',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#7aecda' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span style={{ color: '#7aecda' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </GridItem>

        {/* Redemption Trend */}
        <GridItem>
          <ChartCard
            title="Token Redemption Trend"
            icon={FaCheckCircle}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.redemptionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(122, 236, 218, 0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="#7aecda"
                  tick={{ fill: '#7aecda' }}
                />
                <YAxis 
                  stroke="#7aecda"
                  tick={{ fill: '#7aecda' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid rgba(122, 236, 218, 0.3)',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#7aecda' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#7aecda"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </GridItem>

        {/* Token Status Distribution */}
        <GridItem>
          <ChartCard
            title="Token Status Overview"
            icon={FaChartBar}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: 'Active', value: stats.activeTokens },
                  { name: 'Expired', value: stats.expiredTokens }
                ]}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(122, 236, 218, 0.1)" />
                <XAxis 
                  type="number"
                  stroke="#7aecda"
                  tick={{ fill: '#7aecda' }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name"
                  stroke="#7aecda"
                  tick={{ fill: '#7aecda' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid rgba(122, 236, 218, 0.3)',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#7aecda' }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#7aecda"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </GridItem>
      </Grid>
    </motion.div>
  );
};

// Stat Card Component
const StatCard = ({ icon, label, value, helpText, trend }) => (
  <Box
    p={6}
    borderRadius="xl"
    bg="rgba(0, 0, 0, 0.3)"
    border="1px solid rgba(122, 236, 218, 0.2)"
    backdropFilter="blur(10px)"
    transition="all 0.3s ease"
    _hover={{
      transform: "translateY(-5px)",
      borderColor: "rgba(122, 236, 218, 0.4)",
      boxShadow: "0 10px 30px -10px rgba(122, 236, 218, 0.2)"
    }}
  >
    <Stat>
      <HStack spacing={2} mb={2}>
        <Icon as={icon} color="#7aecda" boxSize={5} />
        <StatLabel color="gray.400">{label}</StatLabel>
      </HStack>
      <StatNumber color="#7aecda" fontSize="2xl">{value}</StatNumber>
      <StatHelpText color="gray.400">
        {trend && <StatArrow type={trend} />}
        {helpText}
      </StatHelpText>
    </Stat>
  </Box>
);

// Chart Card Component
const ChartCard = ({ title, icon, children }) => (
  <Box
    p={6}
    borderRadius="xl"
    bg="rgba(0, 0, 0, 0.3)"
    border="1px solid rgba(122, 236, 218, 0.2)"
    backdropFilter="blur(10px)"
    transition="all 0.3s ease"
    _hover={{
      borderColor: "rgba(122, 236, 218, 0.4)",
      boxShadow: "0 10px 30px -10px rgba(122, 236, 218, 0.2)"
    }}
  >
    <HStack spacing={2} mb={4}>
      <Icon as={icon} color="#7aecda" boxSize={5} />
      <Text color="#7aecda" fontSize="lg" fontWeight="bold">{title}</Text>
    </HStack>
    {children}
  </Box>
);

export default B2BReports; 