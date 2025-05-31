import { Box, Text, VStack, Heading, HStack, Link } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const Contact = () => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      minH="100vh"
      w="100%"
      bg="black"
      color="#7aecda"
      p={{ base: 4, md: 8 }}
      overflowY="auto"
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      css={{
        '& p, & text, & a': {
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            color: '#7aecda',
            textShadow: '0 0 15px rgba(122, 236, 218, 0.5), 0 0 30px rgba(122, 236, 218, 0.3)',
            transform: 'scale(1.01)'
          }
        },
        '& h2, & h3, & h4': {
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            textShadow: '0 0 20px rgba(122, 236, 218, 0.6), 0 0 40px rgba(122, 236, 218, 0.4)',
            transform: 'scale(1.02)'
          }
        },
        '& a': {
          '&:hover': {
            color: '#7aecda !important',
            textShadow: '0 0 20px rgba(122, 236, 218, 0.6), 0 0 40px rgba(122, 236, 218, 0.4)',
            transform: 'scale(1.02)'
          }
        },
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(0, 0, 0, 0.1)',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(122, 236, 218, 0.5)',
          borderRadius: '4px',
          '&:hover': {
            background: 'rgba(122, 236, 218, 0.7)',
          },
        },
      }}
    >
      <VStack
        spacing={8}
        maxW="1200px"
        mx="auto"
        align="start"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Heading
          fontSize={{ base: "4xl", md: "5xl" }}
          textAlign="center"
          w="full"
          mb={8}
          textShadow="0 0 10px rgba(122, 236, 218, 0.3)"
          _hover={{ textShadow: "0 0 20px rgba(122, 236, 218, 0.5)" }}
          transition="text-shadow 0.3s ease"
        >
          📞 Contact Us
        </Heading>

        <Text fontSize="lg" color="rgba(122, 236, 218, 0.9)">
          We're here to help you with anything related to the Kalon Referral Token System. Whether you have questions, suggestions, or need support, feel free to reach out to our leadership team or visit our head office.
        </Text>

        <Box w="full">
          <Text
            fontSize={{ base: "xl", md: "2xl" }}
            fontWeight="bold"
            mb={4}
            textShadow="0 0 10px rgba(122, 236, 218, 0.3)"
            _hover={{ textShadow: "0 0 20px rgba(122, 236, 218, 0.5)" }}
            transition="text-shadow 0.3s ease"
          >
            🧑‍💼 Leadership Contacts
          </Text>
          <VStack align="start" spacing={3}>
            <Box>
              <Text 
                fontWeight="bold" 
                color="#7aecda"
                _hover={{ 
                  textShadow: "0 0 10px rgba(122, 236, 218, 0.3)"
                }}
                transition="all 0.3s ease"
              >
                CEO – Rakesh Anand
              </Text>
              <Link 
                href="tel:+919815209299" 
                color="rgba(122, 236, 218, 0.9)" 
                _hover={{ 
                  color: "#7aecda", 
                  textShadow: "0 0 10px rgba(122, 236, 218, 0.3)"
                }}
                transition="all 0.3s ease"
              >
                📱 98152-09299
              </Link>
            </Box>
            <Box>
              <Text fontWeight="bold" color="#7aecda">President / COO – Misha Anand</Text>
              <Link href="tel:+918360201680" color="rgba(122, 236, 218, 0.9)" _hover={{ color: "#7aecda", textShadow: "0 0 10px rgba(122, 236, 218, 0.3)" }}>
                📱 83602-01680
              </Link>
            </Box>
            <Box>
              <Text fontWeight="bold" color="#7aecda">Chairperson – Kimti Anand</Text>
              <Link href="tel:+919815929455" color="rgba(122, 236, 218, 0.9)" _hover={{ color: "#7aecda", textShadow: "0 0 10px rgba(122, 236, 218, 0.3)" }}>
                📱 98159-29455
              </Link>
            </Box>
          </VStack>
        </Box>

        <Box w="full">
          <Text
            fontSize={{ base: "xl", md: "2xl" }}
            fontWeight="bold"
            mb={4}
            textShadow="0 0 10px rgba(122, 236, 218, 0.3)"
            _hover={{ textShadow: "0 0 20px rgba(122, 236, 218, 0.5)" }}
            transition="text-shadow 0.3s ease"
          >
            🏢 Head Office
          </Text>
          <VStack align="start" spacing={2} color="rgba(122, 236, 218, 0.9)">
            <Text fontWeight="bold" color="#7aecda">Kalon Salon & Academy</Text>
            <Text>📍 Kailash Tower, 1st Floor</Text>
            <Text>Near HDFC Bank, NH 3</Text>
            <Text>Adampur, District Jalandhar</Text>
            <Text>Punjab – 144102</Text>
          </VStack>
        </Box>

        <Box w="full">
          <Text
            fontSize={{ base: "xl", md: "2xl" }}
            fontWeight="bold"
            mb={4}
            textShadow="0 0 10px rgba(122, 236, 218, 0.3)"
            _hover={{ textShadow: "0 0 20px rgba(122, 236, 218, 0.5)" }}
            transition="text-shadow 0.3s ease"
          >
            📬 Email
          </Text>
          <Link 
            href="mailto:info@kalonsalonacademy.com"
            color="rgba(122, 236, 218, 0.9)"
            _hover={{ color: "#7aecda", textShadow: "0 0 10px rgba(122, 236, 218, 0.3)" }}
          >
            ✉️ info@kalonsalonacademy.com
          </Link>
        </Box>

        <Box w="full">
          <Text
            fontSize={{ base: "xl", md: "2xl" }}
            fontWeight="bold"
            mb={4}
            textShadow="0 0 10px rgba(122, 236, 218, 0.3)"
            _hover={{ textShadow: "0 0 20px rgba(122, 236, 218, 0.5)" }}
            transition="text-shadow 0.3s ease"
          >
            📩 Complaints & Feedback
          </Text>
          <Text fontSize="lg" color="rgba(122, 236, 218, 0.9)" mb={4}>
            We value your experience with us. If you have any complaints, concerns, or suggestions, please don't hesitate to contact us directly via WhatsApp. Your feedback helps us grow and serve you better.
          </Text>
          <Text fontWeight="bold" color="#7aecda" mb={2}>WhatsApp Support:</Text>
          <VStack align="start" spacing={2}>
            <Link 
              href="https://wa.me/919815209299"
              color="rgba(122, 236, 218, 0.9)"
              _hover={{ color: "#7aecda", textShadow: "0 0 10px rgba(122, 236, 218, 0.3)" }}
            >
              📲 98152-09299
            </Link>
            <Link 
              href="https://wa.me/918360201680"
              color="rgba(122, 236, 218, 0.9)"
              _hover={{ color: "#7aecda", textShadow: "0 0 10px rgba(122, 236, 218, 0.3)" }}
            >
              📲 83602-01680
            </Link>
          </VStack>
        </Box>

        <Box w="full">
          <Text
            fontSize={{ base: "xl", md: "2xl" }}
            fontWeight="bold"
            mb={4}
            textShadow="0 0 10px rgba(122, 236, 218, 0.3)"
            _hover={{ textShadow: "0 0 20px rgba(122, 236, 218, 0.5)" }}
            transition="text-shadow 0.3s ease"
          >
            🕒 Office Hours
          </Text>
          <Text color="rgba(122, 236, 218, 0.9)">
            Monday – Sunday : 09:00 AM – 7:00 PM
          </Text>
        </Box>
      </VStack>
    </MotionBox>
  );
};

export default Contact; 