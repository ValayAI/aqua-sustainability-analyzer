import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getSupabaseCities } from '../utils/cityData/supabaseCityService';
import { toast } from 'sonner';

interface CitySearchProps {
  onSelect: (cityId: string) => void;
  selectedCityId: string;
}

const CitySearch: React.FC<CitySearchProps> = ({ onSelect, selectedCityId }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCities, setFilteredCities] = useState<{ id: string; name: string; country: string }[]>([]);
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
  
  // Filter cities based on search query with improved matching
  useEffect(() => {
    if (query.trim() === '') {
      // When query is empty, show all cities (limited to prevent overwhelming the UI)
      setFilteredCities(cities.slice(0, 10));
      return;
    }
    
    console.log("Filtering with query:", query);
    const lowerCaseQuery = query.toLowerCase();
    
    // More permissive matching algorithm
    const matches = cities.filter(city => {
      const cityNameLower = city.name.toLowerCase();
      const countryLower = (city.country || '').toLowerCase();
      
      // Match if any part of the city name or country includes the query
      return cityNameLower.includes(lowerCaseQuery) || 
             countryLower.includes(lowerCaseQuery);
    });
    
    console.log("Matched cities:", matches);
    setFilteredCities(matches.slice(0, 10)); // Limit to 10 results
  }, [query, cities]);
  
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
    // Reset query when opening to show all cities
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
          className="w-full flex items-center justify-between p-3 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <div className="flex items-center">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-gray-700 text-sm font-medium">
              {selectedCity ? `${selectedCity.name}, ${selectedCity.country || 'Unknown'}` : 'Select a city'}
            </span>
          </div>
          <span className="text-xs bg-blue-50 text-blue-600 rounded-full px-2 py-0.5">
            {selectedCity ? 'Selected' : 'Choose'}
          </span>
        </button>
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-sm rounded-lg border border-gray-100 shadow-lg overflow-hidden z-10 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type to search cities..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 text-sm bg-transparent border-b border-gray-100 focus:border-primary/50 focus:outline-none text-gray-700"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-52 overflow-y-auto">
            {isLoading ? (
              <div className="py-3 text-center">
                <div className="w-5 h-5 border-2 border-t-transparent border-blue-500 rounded-full animate-spin mx-auto"></div>
              </div>
            ) : isError ? (
              <div className="p-3 text-center text-gray-500 text-xs">
                Could not load cities. Please try again.
              </div>
            ) : filteredCities.length === 0 ? (
              <div className="p-3 text-center text-gray-500 text-xs">
                No cities match your search
              </div>
            ) : (
              <div className="py-1">
                {filteredCities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleSelectCity(city.id)}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${
                      city.id === selectedCityId ? 'bg-blue-50/50 font-medium text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{city.name}</span>
                      <span className="text-gray-400 text-xs">{city.country || 'Unknown'}</span>
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
