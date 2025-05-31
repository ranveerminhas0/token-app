import { Box, Flex, Button, Heading, useColorModeValue } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Link as RouterLink } from 'react-router-dom'

const MotionBox = motion(Box)

const Navbar = () => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <MotionBox
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      position="sticky"
      top="0"
      zIndex="sticky"
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      shadow="sm"
    >
      <Flex
        maxW="7xl"
        mx="auto"
        px={4}
        py={4}
        align="center"
        justify="space-between"
      >
        <Heading
          as={RouterLink}
          to="/"
          size="lg"
          bgGradient="linear(to-r, purple.500, pink.500)"
          bgClip="text"
          _hover={{
            bgGradient: "linear(to-r, purple.600, pink.600)",
            transform: "scale(1.05)",
          }}
          transition="all 0.3s ease"
        >
          Kalon Tokens
        </Heading>

        <Flex gap={4}>
          <Button
            as={RouterLink}
            to="/tokens"
            variant="ghost"
            colorScheme="purple"
            _hover={{
              bg: 'purple.50',
              transform: 'translateY(-2px)',
            }}
            transition="all 0.3s ease"
          >
            View Tokens
          </Button>
          <Button
            as={RouterLink}
            to="/create"
            colorScheme="purple"
            _hover={{
              transform: 'translateY(-2px)',
              shadow: 'lg',
            }}
            transition="all 0.3s ease"
          >
            Create Token
          </Button>
        </Flex>
      </Flex>
    </MotionBox>
  )
}

export default Navbar 