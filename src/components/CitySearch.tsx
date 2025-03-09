
import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getSupabaseCities } from '../utils/supabaseData';
import { toast } from 'sonner';

interface CitySearchProps {
  onSelect: (cityId: string) => void;
  selectedCityId: string;
}

const CitySearch: React.FC<CitySearchProps> = ({ onSelect, selectedCityId }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCities, setFilteredCities] = useState<{ id: string; name: string; country: string }[]>([]);
  const [majorCities, setMajorCities] = useState<{ id: string; name: string; country: string }[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Fetch cities from Supabase with better error handling
  const { data: cities = [], isLoading, isError } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      try {
        console.log("Fetching cities from getSupabaseCities");
        const citiesData = await getSupabaseCities();
        console.log("Cities fetched:", citiesData);
        return citiesData;
      } catch (error) {
        console.error('Failed to fetch cities:', error);
        toast.error('Could not load cities. Please try again later.');
        throw error;
      }
    },
    staleTime: 60000, // 1 minute
    retry: 2
  });
  
  // Find the currently selected city name
  const selectedCity = cities.find(city => city.id === selectedCityId);
  
  // Set major cities when cities data is loaded
  useEffect(() => {
    if (cities.length > 0) {
      console.log("Setting major cities from available cities:", cities);
      // Define major cities to show by default (these are large, well-known cities from our dataset)
      const majorCityNames = ['New York', 'Tokyo', 'London', 'Shanghai', 'Los Angeles', 'Delhi', 'Beijing'];
      const foundMajorCities = cities
        .filter(city => majorCityNames.includes(city.name))
        .slice(0, 3); // Limit to 3 major cities
      
      console.log("Found major cities:", foundMajorCities);
      setMajorCities(foundMajorCities);
    }
  }, [cities]);
  
  // Filter cities based on search query with improved matching
  useEffect(() => {
    if (query.trim() === '') {
      // When query is empty, show major cities
      setFilteredCities(majorCities);
    } else {
      console.log("Filtering with query:", query);
      const lowerCaseQuery = query.toLowerCase();
      
      // Improve matching by making it more flexible
      const matched = cities.filter(city => {
        // Make sure we have values before trying to use them
        const cityNameLower = city.name ? city.name.toLowerCase() : '';
        const countryLower = city.country ? city.country.toLowerCase() : '';
        
        return cityNameLower.includes(lowerCaseQuery) || countryLower.includes(lowerCaseQuery);
      });
      
      console.log("Matched cities:", matched);
      setFilteredCities(matched);
    }
  }, [query, cities, majorCities]);
  
  // Handle clicks outside the component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSelectCity = (cityId: string) => {
    console.log("Selected city:", cityId);
    onSelect(cityId);
    setIsOpen(false);
    setQuery('');
  };
  
  const handleOpenDropdown = () => {
    setIsOpen(true);
    // Reset query when opening to show major cities
    setQuery('');
    // Focus the input field after opening
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 10);
  };
  
  return (
    <div className="w-full max-w-md mx-auto relative" ref={searchRef}>
      <div className="relative">
        <button
          onClick={handleOpenDropdown}
          className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <div className="flex items-center">
            <Search className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-gray-800">{selectedCity ? `${selectedCity.name}, ${selectedCity.country}` : 'Select a city'}</span>
          </div>
          <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
            {selectedCity ? 'Selected' : 'Choose'}
          </span>
        </button>
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg overflow-hidden z-10 animate-in fade-in slide-in-from-top-2">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type to search cities..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2 text-sm bg-transparent border-b border-gray-200 focus:border-primary/50 focus:outline-none text-gray-800"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="w-6 h-6 border-2 border-t-transparent border-blue-500 rounded-full animate-spin mx-auto"></div>
              </div>
            ) : isError ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                Could not load cities. Please try again.
              </div>
            ) : filteredCities.length === 0 ? (
              query.trim() === '' ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No major cities found. Try typing to search.
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No cities match your search
                </div>
              )
            ) : (
              <div className="py-2">
                {query.trim() === '' && (
                  <div className="px-4 py-2 text-xs text-gray-500">
                    Major Cities
                  </div>
                )}
                {filteredCities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleSelectCity(city.id)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                      city.id === selectedCityId ? 'bg-gray-50 font-medium' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-gray-800">{city.name}</span>
                      <span className="text-gray-500 text-xs">{city.country}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CitySearch;
