import { Box, Text, VStack, Badge, Heading, Menu, MenuButton, MenuList, MenuItem, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, Input, useToast, SimpleGrid, Container } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FiMoreVertical, FiEdit2, FiShare2, FiTrash2 } from 'react-icons/fi';
import './SearchResults.css';
import TokenCard from './TokenCard';

const SearchResults = ({ results = [], isLoading = false, highlightedToken = null }) => {
  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Heading
          color="#7aecda"
          fontSize="4xl"
          textAlign="center"
          mb={8}
          textShadow="0 0 20px rgba(122, 236, 218, 0.3)"
        >
          Searching...
        </Heading>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Heading
        color="#7aecda"
        fontSize="4xl"
        textAlign="center"
        mb={8}
        textShadow="0 0 20px rgba(122, 236, 218, 0.3)"
      >
        Search Results ({results.length})
      </Heading>
      {results.length === 0 ? (
        <Box textAlign="center">
          <Text color="gray.300" fontSize="lg">
            No tokens found. Try searching with a different term.
          </Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
          {results.map((token) => (
            <TokenCard 
              key={token.serial} 
              token={token} 
              highlight={token.token === highlightedToken}
              autoExpand={token.token === highlightedToken}
            />
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
};

export default SearchResults; 