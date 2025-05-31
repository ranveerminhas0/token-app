import { Box } from '@chakra-ui/react'
import { useState, useRef, useEffect } from 'react'
import "./SpotlightCard.css";

const SpotlightCard = ({ children, className = '', spotlightColor = 'rgba(122, 236, 218, 0.1)' }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setPosition({ x, y })
    setOpacity(1)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
    setOpacity(1)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setOpacity(0)
  }

  return (
    <Box
      ref={cardRef}
      className={`spotlight-card ${className}`}
      position="relative"
      overflow="hidden"
      bg="rgba(0, 0, 0, 0.3)"
      backdropFilter="blur(10px)"
      borderRadius="xl"
      p={6}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      border="1px solid rgba(122, 236, 218, 0.1)"
      transition="all 0.3s ease"
      _hover={{
        border: "1px solid rgba(122, 236, 218, 0.3)",
        transform: "translateY(-5px)",
        boxShadow: "0 10px 30px -10px rgba(122, 236, 218, 0.3)"
      }}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        pointerEvents="none"
        style={{
          opacity,
          background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
          transition: 'opacity 0.15s ease'
        }}
      />
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        pointerEvents="none"
        style={{
          opacity: isHovered ? 1 : 0,
          boxShadow: 'inset 0 0 20px rgba(122, 236, 218, 0.2)',
          transition: 'opacity 0.3s ease'
        }}
      />
      {children}
    </Box>
  )
}

export default SpotlightCard 