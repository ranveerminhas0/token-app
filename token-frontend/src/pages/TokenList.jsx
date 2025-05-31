import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import TokenGrid from '../components/TokenGrid';
import Particles from '../components/Particles';
import Sidebar from '../components/Sidebar';
import HamburgerButton from '../components/HamburgerButton';

const TokenList = () => {
  const { type } = useParams();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const titleMap = {
    all: 'ALL TOKENS',
    active: 'ACTIVE TOKENS',
    reissued: 'REISSUED TOKENS',
    expired: 'EXPIRED TOKENS'
  };

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await fetch('/tokens');
        const data = await response.json();
        
        // Filter tokens based on type
        let filteredTokens = data.tokens || [];
        switch (type) {
          case 'active':
            filteredTokens = filteredTokens.filter(token => token.status === 'Active');
            break;
          case 'expired':
            filteredTokens = filteredTokens.filter(token => token.status === 'Expired');
            break;
          case 'reissued':
            filteredTokens = filteredTokens.filter(token => token.maxUses > 5);
            break;
          // 'all' case - no filtering needed
          default:
            break;
        }
        
        setTokens(filteredTokens);
      } catch (error) {
        console.error('Error fetching tokens:', error);
        setTokens([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, [type]);

  return (
    <Box
      width="100vw"
      minHeight="100vh"
      bg="black"
      position="relative"
      overflow="hidden"
    >
      {/* Background Layer */}
      <Box position="fixed" top={0} left={0} right={0} bottom={0} zIndex={0}>
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
        />
      </Box>

      {/* Content Layer */}
      <Box position="relative" zIndex={1}>
        <Box pt={20}>
          <TokenGrid tokens={tokens} title={titleMap[type]} loading={loading} />
        </Box>
      </Box>

      {/* Navigation Layer - Always on top */}
      <Box position="fixed" top={0} left={0} right={0} bottom={0} zIndex={1000}>
        <HamburgerButton 
          isOpen={isSidebarOpen} 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
        <Sidebar isOpen={isSidebarOpen} />
      </Box>
    </Box>
  );
};

export default TokenList; 