import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import SearchResults from '../components/SearchResults';

const Search = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightedToken, setHighlightedToken] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const searchQuery = searchParams.get('q');
    const isNewToken = searchParams.get('new') === 'true';
    const isRedeemed = searchParams.get('redeemed') === 'true';
    
    if (!searchQuery) {
      setIsLoading(false);
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/tokens');
        if (!response.ok) throw new Error('Failed to fetch tokens');
        const data = await response.json();
        
        // Get tokens array from response
        const tokens = data.tokens || [];
        
        // Case-insensitive search
        const query = searchQuery.trim().toLowerCase();
        
        const filteredResults = tokens.filter(token => {
          // If query is a number (serial or phone), do exact match
          if (/^\d+$/.test(query)) {
            // Serial number exact match
            if (token.serial && token.serial.toString() === query) {
              return true;
            }
            
            // Phone number exact match (owner)
            if (token.ownerPhone && token.ownerPhone.replace(/\D/g, '') === query) {
              return true;
            }
            
            // Phone number exact match (redeemer)
            if (token.redemptions && token.redemptions.length > 0) {
              return token.redemptions.some(r => 
                r.redeemerPhone && r.redeemerPhone.replace(/\D/g, '') === query
              );
            }
            
            return false;
          }
          
          // Token code exact match (for newly created/redeemed tokens)
          if (token.token && token.token.toLowerCase() === query.toLowerCase()) {
            if (isNewToken || isRedeemed) {
              setHighlightedToken(token.token);
            }
            return true;
          }
          
          // Name match (owner)
          if (token.ownerName && token.ownerName.toLowerCase().includes(query)) {
            return true;
          }
          
          // Name match (redeemer)
          if (token.redemptions && token.redemptions.length > 0) {
            return token.redemptions.some(r => 
              r.redeemerName && r.redeemerName.toLowerCase().includes(query)
            );
          }
          
          return false;
        });

        setResults(filteredResults);

        if (filteredResults.length === 0) {
          toast({
            title: "No results found",
            description: "Try searching with a different serial number, phone number, or name",
            status: "info",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error('Search error:', error);
        toast({
          title: "Error",
          description: "Failed to load tokens. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [searchParams, toast]);

  return <SearchResults 
    results={results} 
    isLoading={isLoading} 
    highlightedToken={highlightedToken}
  />;
};

export default Search; 