import React from 'react';
import { Box, SimpleGrid, Heading, Container } from '@chakra-ui/react';
import TokenCard from './TokenCard';

const TokenGrid = ({ tokens = [], title, loading = false }) => {
  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Heading
          color="#7aecda"
          fontSize="4xl"
          textAlign="center"
          mb={8}
          textShadow="0 0 20px rgba(122, 236, 218, 0.3)"
        >
          Loading...
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
        {title} ({tokens.length})
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
        {tokens.map((token, index) => (
          <TokenCard key={token.serial} token={token} />
        ))}
      </SimpleGrid>
    </Container>
  );
};

export default TokenGrid; 