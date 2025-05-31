import { Box, Text, VStack, Heading } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionText = motion(Text);

const About = () => {
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
        '& p, & text': {
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
          ABOUT
        </Heading>

        <Text
          fontSize={{ base: "xl", md: "2xl" }}
          fontWeight="bold"
          color="#7aecda"
          textShadow="0 0 10px rgba(122, 236, 218, 0.3)"
          _hover={{ textShadow: "0 0 20px rgba(122, 236, 218, 0.5)" }}
          transition="text-shadow 0.3s ease"
        >
          🌟 Welcome to the Kalon Referral Token System!
        </Text>
        <Text fontSize="lg" color="rgba(122, 236, 218, 0.9)">
          At Kalon Salon & Academy, we believe in celebrating loyalty and growing through trust. Our Referral Token System is designed to reward our valued clients and empower them to become ambassadors of beauty. This system not only enhances customer engagement but also ensures smooth and transparent reward tracking – all in one sleek, smart interface.
        </Text>

        <Text
          fontSize={{ base: "xl", md: "2xl" }}
          fontWeight="bold"
          color="#7aecda"
          textShadow="0 0 10px rgba(122, 236, 218, 0.3)"
          _hover={{ textShadow: "0 0 20px rgba(122, 236, 218, 0.5)" }}
          transition="text-shadow 0.3s ease"
        >
          💡 What is the Kalon Referral Token System?
        </Text>
        <Text 
          fontSize="lg" 
          color="rgba(122, 236, 218, 0.9)"
          _hover={{ 
            color: "#7aecda",
            textShadow: "0 0 10px rgba(122, 236, 218, 0.3)"
          }}
          transition="all 0.3s ease"
        >
          The Referral Token System is a powerful tool that allows us to issue digital tokens to our clients, track their usage, and reward them based on performance. Built with precision and care, it simplifies referral management and adds a touch of tech to our beauty culture.
        </Text>

        <Text
          fontSize={{ base: "xl", md: "2xl" }}
          fontWeight="bold"
          color="#7aecda"
          textShadow="0 0 10px rgba(122, 236, 218, 0.3)"
          _hover={{ textShadow: "0 0 20px rgba(122, 236, 218, 0.5)" }}
          transition="text-shadow 0.3s ease"
        >
          🔑 Key Features:
        </Text>

        <VStack spacing={4} align="start" w="full">
          {[
            ["🧾 Token Issuance with Auto Serial Number", "Each token issued is uniquely identified with an auto-incremented serial number. Just enter the owner's name, phone number, residence, and bill amount — the system handles the rest."],
            ["⏰ Valid Dates & Token Status", "Tokens come with issue and expiration dates. The system shows active, expired, or redeemed status along with remaining days, so you always stay updated."],
            ["🔍 Search & Filter Made Easy", "Find any token instantly using the search bar by serial number or use filters to view only active or expired tokens — effortless and efficient."],
            ["🔄 Redemption & Business Tracking", "Redeem tokens with full tracking. Enter the redeemer's name, phone, and bill amount — the system logs it and calculates the redeemer contribution automatically."],
            ["💰 Total Business Tracking", "Every token shows the initial owner's business amount plus the redeemer's total contribution, giving you a total performance score — ideal for issuing Silver Cards or other rewards."],
            ["📲 WhatsApp Integration", "Send beautifully formatted token details via WhatsApp with one click! The message includes all key data, redemption history, and status — styled for clarity and impact."],
            ["🏠 Owner Residence Included", "Track the owner's residence to make local engagement and territory planning even easier."],
            ["✏️ Edit & Delete with Confirmation", "Tokens can be edited or deleted anytime through a secure UI with confirmation prompts to avoid mistakes."],
            ["🔁 Reissue Tokens", "Easily reissue a token, increasing its max uses while preserving its full redemption history — perfect for high-performing referrers."],
            ["📄 PDF Reports", "Generate detailed reports (full, expired, active, or custom) in just a click — perfect for business reviews and performance tracking."]
          ].map(([title, desc]) => (
            <Box key={title}>
              <Text
                fontSize="lg"
                fontWeight="bold"
                color="#7aecda"
                textShadow="0 0 10px rgba(122, 236, 218, 0.3)"
                _hover={{ textShadow: "0 0 20px rgba(122, 236, 218, 0.5)" }}
                transition="text-shadow 0.3s ease"
              >
                {title}
              </Text>
              <Text fontSize="lg" color="rgba(122, 236, 218, 0.9)">
                {desc}
              </Text>
            </Box>
          ))}
        </VStack>

        <Text
          fontSize={{ base: "xl", md: "2xl" }}
          fontWeight="bold"
          color="#7aecda"
          textShadow="0 0 10px rgba(122, 236, 218, 0.3)"
          _hover={{ textShadow: "0 0 20px rgba(122, 236, 218, 0.5)" }}
          transition="text-shadow 0.3s ease"
          mt={8}
        >
          🌟 In the Spirit of Growth
        </Text>
        <Text fontSize="lg" color="rgba(122, 236, 218, 0.9)">
          The Kalon Referral Token System is more than a tool — it's a bridge between trust and growth. Built locally, used globally (or almost 😄), it reflects our commitment to excellence in service, technology, and customer experience.
        </Text>

        <Text
          fontSize="xl"
          fontWeight="bold"
          color="#7aecda"
          textAlign="center"
          w="full"
          mt={8}
          textShadow="0 0 10px rgba(122, 236, 218, 0.3)"
          _hover={{ textShadow: "0 0 20px rgba(122, 236, 218, 0.5)" }}
          transition="text-shadow 0.3s ease"
        >
          Thank you for being a part of our journey. Let's grow beautifully — together.
        </Text>
      </VStack>
    </MotionBox>
  );
};

export default About; 