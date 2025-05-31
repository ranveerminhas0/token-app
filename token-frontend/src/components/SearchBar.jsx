import { Box, Input, InputGroup, InputLeftElement, useToast } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

const SearchBar = ({ showInitialAnimation }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Enter search term",
        description: "Please enter a Serial No. or Phone number to search",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      // Navigate to search results with query
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Error",
        description: "Failed to search. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <Box
      as={motion.div}
      className="search-bar-container"
      initial={false}
      animate={isFocused ? { scale: 1.02 } : { scale: 1 }}
      transition={{ duration: 0.2 }}
      position="fixed"
      bottom="20px"
      left="20px"
      zIndex={999}
      pointerEvents="auto"
    >
      <div className="glow-effect" />
      <InputGroup
        size="md"
        width="300px"
      >
        <InputLeftElement
          pointerEvents="none"
          children={<FiSearch color="#7aecda" />}
          h="full"
        />
        <Input
          className="search-bar-input"
          placeholder="Search by Serial No. or Phone..."
          bg="rgba(0, 0, 0, 0.3)"
          border="1px solid rgba(122, 236, 218, 0.3)"
          color="#7aecda"
          _placeholder={{ color: "rgba(122, 236, 218, 0.5)" }}
          _hover={{
            border: "1px solid rgba(122, 236, 218, 0.5)",
          }}
          _focus={{
            border: "1px solid #7aecda",
            bg: "rgba(0, 0, 0, 0.4)"
          }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyPress={handleKeyPress}
          onClick={(e) => e.stopPropagation()}
          isDisabled={isLoading}
          autoComplete="off"
          spellCheck="false"
          style={{ pointerEvents: 'auto' }}
        />
      </InputGroup>
    </Box>
  );
};

export default SearchBar; 