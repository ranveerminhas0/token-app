import { Box, Heading, SimpleGrid, VStack, Flex, Button, HStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import TokenCard from '../components/TokenCard';

const AllTokens = () => {
  const [tokens, setTokens] = useState([]);
  const [filteredTokens, setFilteredTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState('all');

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await fetch('/tokens');
        if (!response.ok) throw new Error('Failed to fetch tokens');
        const data = await response.json();
        setTokens(data);
        setFilteredTokens(data);
      } catch (error) {
        console.error('Error fetching tokens:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokens();
  }, []);

  const handleFilterChange = (filter) => {
    setCurrentFilter(filter);
    let filtered = [...tokens];

    // Apply status filters
    switch (filter) {
      case 'active':
        filtered = tokens.filter(token => token.status.toLowerCase() === 'active');
        break;
      case 'expired':
        filtered = tokens.filter(token => token.status.toLowerCase() === 'expired');
        break;
      case 'used':
        filtered = tokens.filter(token => token.status.toLowerCase() === 'used');
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.issueDate) - new Date(b.issueDate));
        break;
      default:
        // 'all' - no filtering needed
        break;
    }

    setFilteredTokens(filtered);
  };

  return (
    <Box minH="100vh" bg="black" p={8}>
      <VStack spacing={8} w="100%" maxW="1200px" mx="auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%' }}
        >
          <Heading
            color="#7aecda"
            fontSize="4xl"
            textAlign="center"
            mb={8}
            textShadow="0 0 10px rgba(122, 236, 218, 0.3)"
          >
            ALL TOKENS
          </Heading>

          <HStack spacing={4} justify="center" mb={8}>
            <Button
              variant="ghost"
              color="#7aecda"
              onClick={() => handleFilterChange('all')}
              _hover={{ bg: 'rgba(122, 236, 218, 0.1)' }}
              isActive={currentFilter === 'all'}
            >
              All Tokens
            </Button>
            <Button
              variant="ghost"
              color="green.400"
              onClick={() => handleFilterChange('active')}
              _hover={{ bg: 'rgba(72, 187, 120, 0.1)' }}
              isActive={currentFilter === 'active'}
            >
              Active
            </Button>
            <Button
              variant="ghost"
              color="orange.400"
              onClick={() => handleFilterChange('expired')}
              _hover={{ bg: 'rgba(237, 137, 54, 0.1)' }}
              isActive={currentFilter === 'expired'}
            >
              Expired
            </Button>
            <Button
              variant="ghost"
              color="red.400"
              onClick={() => handleFilterChange('used')}
              _hover={{ bg: 'rgba(245, 101, 101, 0.1)' }}
              isActive={currentFilter === 'used'}
            >
              Used
            </Button>
          </HStack>
        </motion.div>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} width="100%">
          {filteredTokens.map((token) => (
            <TokenCard 
              key={token.serial} 
              token={token}
              onTokenDeleted={(deletedSerial) => {
                const updatedTokens = tokens.filter(t => t.serial !== deletedSerial);
                setTokens(updatedTokens);
                setFilteredTokens(updatedTokens);
              }}
            />
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default AllTokens; 