import { Box, Container, Heading, Text, VStack, HStack, Button, Image, Input, useToast } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import BlurText from './BlurText'
import Particles from './Particles'
import ScrambledText from './ScrambledText'
import SpotlightCard from './SpotlightCard'
import GooeyNav from './GooeyNav'
import About from './About'
import Contact from './Contact'
import SearchBar from './SearchBar'
import { FiPlusCircle, FiRefreshCw } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import './ButtonEffect.css'
import Sidebar from './Sidebar'
import HamburgerButton from './HamburgerButton'
import { getApiUrl } from '../services/api'

const MotionBox = motion(Box)

const FeatureCard = ({ icon, title, description, to }) => (
  <Link to={to}>
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Box
        p={6}
        bg="rgba(0, 0, 0, 0.3)"
        borderRadius="xl"
        border="1px solid rgba(122, 236, 218, 0.2)"
        cursor="pointer"
        transition="all 0.3s"
        _hover={{
          boxShadow: '0 0 20px rgba(122, 236, 218, 0.2)',
          borderColor: 'rgba(122, 236, 218, 0.4)'
        }}
        height="200px"
        width="300px"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        {icon}
        <Heading size="md" color="#7aecda" mt={4} mb={2}>
          {title}
        </Heading>
        <Text color="rgba(122, 236, 218, 0.8)" textAlign="center">
          {description}
        </Text>
      </Box>
    </motion.div>
  </Link>
)

function Landing() {
  const [showInitialAnimation, setShowInitialAnimation] = useState(true)
  const [currentPage, setCurrentPage] = useState('home')
  const [showContent, setShowContent] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()

  // Create Token Form State
  const [createForm, setCreateForm] = useState({
    ownerName: '',
    ownerPhone: '',
    residence: '',
    ownerBusiness: 0
  })

  // Redeem Token Form State
  const [redeemForm, setRedeemForm] = useState({
    tokenCode: '',
    redeemerName: '',
    redeemerPhone: '',
    amount: 0
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialAnimation(false)
      setTimeout(() => {
        setShowContent(true)
      }, 200)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const handlePageChange = (page) => {
    if (page === 'home') {
      window.location.reload()
    } else {
      setCurrentPage(page)
    }
  }

  // Handle Create Token Form
  const handleCreateSubmit = async () => {
    try {
      // Validate form
      if (!createForm.ownerName || !createForm.ownerPhone || !createForm.residence) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          status: "error",
          duration: 3000,
          isClosable: true
        })
        return
      }

      const response = await fetch(getApiUrl('create-token'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createForm)
      })

      if (!response.ok) throw new Error('Failed to create token')
      const data = await response.json()

      toast({
        title: "Success",
        description: `Token created successfully! Token Code: ${data.token.token}`,
        status: "success",
        duration: 5000,
        isClosable: true
      })

      // Reset form
      setCreateForm({
        ownerName: '',
        ownerPhone: '',
        residence: '',
        ownerBusiness: 0
      })

      // Navigate to search page to show the new token
      navigate(`/search?q=${data.token.token}&new=true`)
    } catch (error) {
      console.error('Error creating token:', error)
      toast({
        title: "Error",
        description: "Failed to create token. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true
      })
    }
  }

  // Handle Redeem Token Form
  const handleRedeemSubmit = async () => {
    try {
      // Validate form
      if (!redeemForm.tokenCode || !redeemForm.redeemerName || !redeemForm.redeemerPhone || !redeemForm.amount) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          status: "error",
          duration: 3000,
          isClosable: true
        })
        return
      }

      const response = await fetch(getApiUrl(`redeem-token/${redeemForm.tokenCode}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          redeemerName: redeemForm.redeemerName,
          redeemerPhone: redeemForm.redeemerPhone,
          amount: parseFloat(redeemForm.amount)
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to redeem token')
      }
      
      const data = await response.json()

      toast({
        title: "Success",
        description: "Token redeemed successfully!",
        status: "success",
        duration: 3000,
        isClosable: true
      })

      // Reset form
      setRedeemForm({
        tokenCode: '',
        redeemerName: '',
        redeemerPhone: '',
        amount: 0
      })

      // Navigate to search page to show the updated token
      navigate(`/search?q=${redeemForm.tokenCode}&redeemed=true`)
    } catch (error) {
      console.error('Error redeeming token:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to redeem token. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true
      })
    }
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'about':
        return <About />
      case 'contact':
        return <Contact />
      default:
        return (
          <>
            <AnimatePresence>
              {showInitialAnimation && (
                <Box
                  position="fixed"
                  top="0"
                  left="0"
                  right="0"
                  bottom="0"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg="black"
                  zIndex={20}
                  m={0}
                  p={0}
                >
                  <Box position="relative">
                    <BlurText
                      text="KALON SALON & ACADEMY"
                      delay={50}
                      animateBy="words"
                      direction="top"
                      stepDuration={0.3}
                      easing={t => t * t * (3 - 2 * t)}
                      style={{
                        fontSize: '72px',
                        fontWeight: 900,
                        color: '#7aecda',
                        textShadow: '0 0 20px rgba(122, 236, 218, 0.3)'
                      }}
                    />
                    <motion.span
                      initial={{ opacity: 0, filter: 'blur(10px)' }}
                      animate={{ opacity: 1, filter: 'blur(0px)' }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      style={{
                        position: 'absolute',
                        right: 0,
                        bottom: '-25px',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#7aecda',
                        textShadow: '0 0 10px rgba(122, 236, 218, 0.3)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                    >
                      VERSION 2
                    </motion.span>
                  </Box>
                </Box>
              )}
            </AnimatePresence>
            
            <Box textAlign="center" mt={20} mb={20}>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: showInitialAnimation ? 0 : 1, 
                  y: showInitialAnimation ? 20 : 0 
                }}
                transition={{ 
                  duration: 0.6,
                  delay: 3.2
                }}
                fontSize={{ base: "5xl", md: "7xl" }}
                fontWeight="900"
                color="#7aecda"
                letterSpacing="2px"
              >
                <ScrambledText
                  radius={100}
                  duration={1.2}
                  speed={0.5}
                  scrambleChars=".:"
                  style={{
                    fontSize: 'inherit',
                    fontWeight: 'inherit',
                    letterSpacing: 'inherit',
                    lineHeight: 1.2,
                    textShadow: '0 0 15px rgba(122, 236, 218, 0.3)'
                  }}
                >
                  KALON TOKEN SYSTEM
                </ScrambledText>
              </MotionBox>
              
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: showInitialAnimation ? 0 : 1, 
                  y: showInitialAnimation ? 20 : 0 
                }}
                transition={{ 
                  duration: 0.6,
                  delay: 3.4
                }}
                fontSize={{ base: "xl", md: "2xl" }}
                fontWeight="500"
                color="#7aecda"
                mt={2}
                letterSpacing="1px"
              >
                <ScrambledText
                  radius={100}
                  duration={1.2}
                  speed={0.5}
                  scrambleChars=".:"
                  style={{
                    fontSize: 'inherit',
                    fontWeight: 'inherit',
                    letterSpacing: 'inherit',
                    lineHeight: 1.2,
                    textShadow: '0 0 15px rgba(122, 236, 218, 0.3)'
                  }}
                >
                  MODEL - B2C
                </ScrambledText>
              </MotionBox>
            </Box>

            {/* Cards Container */}
            <Box
              display="flex"
              justifyContent="center"
              gap={{ base: 8, lg: 12 }}
              px={{ base: 4, lg: 8 }}
              maxW="1200px"
              mx="auto"
              mb={6}
            >
              {/* Create Token Section */}
              <MotionBox
                initial={{ opacity: 0, y: 100 }}
                animate={{ 
                  opacity: showInitialAnimation ? 0 : 1, 
                  y: showInitialAnimation ? 100 : 0 
                }}
                transition={{ 
                  delay: 3.6,
                  duration: 0.6,
                  ease: "easeOut"
                }}
                flex={1}
                maxW="md"
                mx={2}
              >
                <SpotlightCard 
                  className="custom-spotlight-card" 
                  spotlightColor="rgba(122, 236, 218, 0.2)"
                >
                  <VStack spacing={6} align="stretch">
                    {/* Section Title */}
                    <Text 
                      color="#7aecda" 
                      fontSize="2xl" 
                      fontWeight="bold"
                      textAlign="center"
                      textShadow="0 0 5px rgba(122, 236, 218, 0.2)"
                      _hover={{ transform: 'none' }}
                      style={{ transition: 'none' }}
                    >
                      CREATE TOKEN
                    </Text>

                    {/* Token Owner Details */}
                    <VStack 
                      w="100%" 
                      spacing={4}
                      align="start"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: showInitialAnimation ? 0 : 1,
                        y: showInitialAnimation ? 20 : 0 
                      }}
                      transition={{ delay: 3.8, duration: 0.8 }}
                      as={motion.div}
                    >
                      <Text 
                        color="#7aecda" 
                        fontSize="lg" 
                        fontWeight="semibold"
                        textShadow="0 0 3px rgba(122, 236, 218, 0.1)"
                        _hover={{ transform: 'none' }}
                        style={{ transition: 'none' }}
                      >
                        TOKEN OWNER DETAILS
                      </Text>
                      <Input
                        className="tactile-input"
                        placeholder="Token Owner Name"
                        value={createForm.ownerName}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, ownerName: e.target.value }))}
                        bg="rgba(64, 121, 255, 0.1)"
                        color="#7aecda"
                        _placeholder={{ color: "rgba(122, 236, 218, 0.6)" }}
                        size="lg"
                        fontSize="md"
                        py={6}
                      />
                      <Input
                        className="tactile-input"
                        placeholder="Token Owner Phone no."
                        value={createForm.ownerPhone}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, ownerPhone: e.target.value }))}
                        bg="rgba(64, 121, 255, 0.1)"
                        color="#7aecda"
                        _placeholder={{ color: "rgba(122, 236, 218, 0.6)" }}
                        size="lg"
                        fontSize="md"
                        py={6}
                      />
                      <Input
                        className="tactile-input"
                        placeholder="Token Owner Residence"
                        value={createForm.residence}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, residence: e.target.value }))}
                        bg="rgba(64, 121, 255, 0.1)"
                        color="#7aecda"
                        _placeholder={{ color: "rgba(122, 236, 218, 0.6)" }}
                        size="lg"
                        fontSize="md"
                        py={6}
                      />
                      <Input
                        className="tactile-input"
                        placeholder="Bill Amount"
                        value={createForm.ownerBusiness}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, ownerBusiness: parseFloat(e.target.value) || 0 }))}
                        bg="rgba(64, 121, 255, 0.1)"
                        color="#7aecda"
                        _placeholder={{ color: "rgba(122, 236, 218, 0.6)" }}
                        size="lg"
                        fontSize="md"
                        py={6}
                        type="number"
                      />
                    </VStack>

                    {/* Create Token Button */}
                    <MotionBox
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: showInitialAnimation ? 0 : 1,
                        y: showInitialAnimation ? 20 : 0 
                      }}
                      transition={{ delay: 3.8, duration: 0.8 }}
                      width="100%"
                    >
                      <Button
                        className="tactile-button"
                        color="#7aecda"
                        size="lg"
                        w="full"
                        transition="all 0.3s ease"
                        _hover={{ color: "black" }}
                        _active={{ transform: "translateY(3px)" }}
                        bg="transparent"
                        style={{ background: 'transparent' }}
                        onClick={handleCreateSubmit}
                      >
                        Create Token
                      </Button>
                    </MotionBox>
                  </VStack>
                </SpotlightCard>
              </MotionBox>

              {/* Redeem Token Section */}
              <MotionBox
                initial={{ opacity: 0, y: 100 }}
                animate={{ 
                  opacity: showInitialAnimation ? 0 : 1, 
                  y: showInitialAnimation ? 100 : 0 
                }}
                transition={{ 
                  delay: 3.8,
                  duration: 0.6,
                  ease: "easeOut"
                }}
                flex={1}
                maxW="md"
                mx={2}
              >
                <SpotlightCard 
                  className="custom-spotlight-card" 
                  spotlightColor="rgba(122, 236, 218, 0.2)"
                >
                  <VStack spacing={6} align="stretch">
                    {/* Section Title */}
                    <Text 
                      color="#7aecda" 
                      fontSize="2xl" 
                      fontWeight="bold"
                      textAlign="center"
                      textShadow="0 0 5px rgba(122, 236, 218, 0.2)"
                      _hover={{ transform: 'none' }}
                      style={{ transition: 'none' }}
                    >
                      REDEEM TOKEN
                    </Text>

                    {/* Redeemer Details */}
                    <VStack 
                      w="100%" 
                      spacing={4}
                      align="start"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: showInitialAnimation ? 0 : 1,
                        y: showInitialAnimation ? 20 : 0 
                      }}
                      transition={{ delay: 3.8, duration: 0.8 }}
                      as={motion.div}
                    >
                      <Text 
                        color="#7aecda" 
                        fontSize="lg" 
                        fontWeight="semibold"
                        textShadow="0 0 3px rgba(122, 236, 218, 0.1)"
                        _hover={{ transform: 'none' }}
                        style={{ transition: 'none' }}
                      >
                        REDEEMER DETAILS
                      </Text>
                      <Input
                        className="tactile-input"
                        placeholder="Token Code"
                        value={redeemForm.tokenCode}
                        onChange={(e) => setRedeemForm(prev => ({ ...prev, tokenCode: e.target.value.toUpperCase() }))}
                        bg="rgba(64, 121, 255, 0.1)"
                        color="#7aecda"
                        _placeholder={{ color: "rgba(122, 236, 218, 0.6)" }}
                        size="lg"
                        fontSize="md"
                        py={6}
                      />
                      <Input
                        className="tactile-input"
                        placeholder="Redeemer Name"
                        value={redeemForm.redeemerName}
                        onChange={(e) => setRedeemForm(prev => ({ ...prev, redeemerName: e.target.value }))}
                        bg="rgba(64, 121, 255, 0.1)"
                        color="#7aecda"
                        _placeholder={{ color: "rgba(122, 236, 218, 0.6)" }}
                        size="lg"
                        fontSize="md"
                        py={6}
                      />
                      <Input
                        className="tactile-input"
                        placeholder="Redeemer Phone no."
                        value={redeemForm.redeemerPhone}
                        onChange={(e) => setRedeemForm(prev => ({ ...prev, redeemerPhone: e.target.value }))}
                        bg="rgba(64, 121, 255, 0.1)"
                        color="#7aecda"
                        _placeholder={{ color: "rgba(122, 236, 218, 0.6)" }}
                        size="lg"
                        fontSize="md"
                        py={6}
                      />
                      <Input
                        className="tactile-input"
                        placeholder="Bill Amount"
                        value={redeemForm.amount}
                        onChange={(e) => setRedeemForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                        bg="rgba(64, 121, 255, 0.1)"
                        color="#7aecda"
                        _placeholder={{ color: "rgba(122, 236, 218, 0.6)" }}
                        size="lg"
                        fontSize="md"
                        py={6}
                        type="number"
                      />
                    </VStack>

                    {/* Redeem Token Button */}
                    <MotionBox
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: showInitialAnimation ? 0 : 1,
                        y: showInitialAnimation ? 20 : 0 
                      }}
                      transition={{ delay: 4.0, duration: 0.8 }}
                      width="100%"
                    >
                      <Button
                        className="tactile-button"
                        color="#7aecda"
                        size="lg"
                        w="full"
                        transition="all 0.3s ease"
                        _hover={{ color: "black" }}
                        _active={{ transform: "translateY(3px)" }}
                        bg="transparent"
                        style={{ background: 'transparent' }}
                        onClick={handleRedeemSubmit}
                      >
                        Redeem Token
                      </Button>
                    </MotionBox>
                  </VStack>
                </SpotlightCard>
              </MotionBox>
            </Box>
          </>
        )
    }
  }

  return (
    <Box
      width="100vw"
      minHeight="100vh"
      bg="black"
      position="relative"
      overflow="hidden"
      m={0}
      p={0}
    >
      {/* Hamburger Button */}
      <MotionBox
        initial={{ opacity: 0, x: -50 }}
        animate={{ 
          opacity: showContent ? 1 : 0, 
          x: showContent ? 0 : -50 
        }}
        transition={{ 
          duration: 0.6,
          ease: "easeOut",
          delay: 0.2
        }}
      >
        <HamburgerButton 
          isOpen={isSidebarOpen} 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
      </MotionBox>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} />

      {/* Particles Background */}
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

      {/* Content Container */}
      <Box position="relative" zIndex={2} pointerEvents="auto">
        <AnimatePresence>
          {showInitialAnimation && (
            <Box
              position="fixed"
              top="0"
              left="0"
              right="0"
              bottom="0"
              display="flex"
              alignItems="center"
              justifyContent="center"
              bg="black"
              zIndex={20}
              m={0}
              p={0}
            >
              <Box position="relative">
                <BlurText
                  text="KALON SALON & ACADEMY"
                  delay={50}
                  animateBy="words"
                  direction="top"
                  stepDuration={0.3}
                  easing={t => t * t * (3 - 2 * t)}
                  style={{
                    fontSize: '72px',
                    fontWeight: 900,
                    color: '#7aecda',
                    textShadow: '0 0 20px rgba(122, 236, 218, 0.3)'
                  }}
                />
                <motion.span
                  initial={{ opacity: 0, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  style={{
                    position: 'absolute',
                    right: 0,
                    bottom: '-20px',
                    fontSize: '16px',
                    color: '#7aecda',
                    textShadow: '0 0 10px rgba(122, 236, 218, 0.3)'
                  }}
                >
                  version 2
                </motion.span>
              </Box>
            </Box>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showContent && (
            <Container maxW="100%" p={0} m={0}>
              {renderPage()}
            </Container>
          )}
        </AnimatePresence>
      </Box>

      {/* Bottom Navigation and Search Container */}
      <Box
        position="fixed"
        bottom="0"
        left="0"
        right="0"
        zIndex={10}
        pointerEvents="none"
      >
        {/* Navigation */}
        <MotionBox
          initial={{ opacity: 0, y: 100 }}
          animate={{ 
            opacity: showContent ? 1 : 0, 
            y: showContent ? 0 : 100 
          }}
          transition={{ 
            duration: 0.6,
            ease: "easeOut"
          }}
          mb={4}
          display="flex"
          justifyContent="center"
          alignItems="center"
          pointerEvents="auto"
        >
          <GooeyNav
            items={[
              { label: "Home", href: "#", onClick: () => handlePageChange('home') },
              { label: "About", href: "#", onClick: () => handlePageChange('about') },
              { label: "Contact", href: "#", onClick: () => handlePageChange('contact') },
            ]}
            particleCount={15}
            particleDistances={[90, 10]}
            particleR={100}
            initialActiveIndex={0}
            animationTime={600}
            timeVariance={300}
            colors={[1, 2, 3, 1, 2, 3, 1, 4]}
          />
        </MotionBox>

        {/* SearchBar - appears with nav bar */}
        <MotionBox
          initial={{ opacity: 0, y: 50 }}
          animate={{ 
            opacity: showContent ? 1 : 0, 
            y: showContent ? 0 : 50 
          }}
          transition={{ 
            duration: 0.6,
            delay: 0.2,
            ease: "easeOut"
          }}
          position="fixed"
          bottom="20px"
          left="20px"
          pointerEvents="auto"
        >
          <SearchBar showInitialAnimation={!showContent} />
        </MotionBox>
      </Box>
    </Box>
  )
}

export default Landing 