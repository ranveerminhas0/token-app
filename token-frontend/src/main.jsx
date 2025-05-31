import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import App from './App'
import './index.css'

const theme = extendTheme({
  styles: {
    global: {
      'html, body': {
        margin: 0,
        padding: 0,
        width: '100%',
        height: '100%',
        background: 'black',
      },
      '#root': {
        width: '100%',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
      },
    },
  },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <BrowserRouter>
    <App />
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
)
