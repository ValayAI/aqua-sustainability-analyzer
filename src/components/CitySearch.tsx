
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
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Fetch cities from Supabase with better error handling
  const { data: cities = [], isLoading, isError } = useQuery({
    queryKey: ['cities'],
    queryFn: () => {
      return getSupabaseCities().catch(error => {
        console.error('Failed to fetch cities:', error);
        toast.error('Could not load cities. Please try again later.');
        throw error;
      });
    },
    staleTime: 60000, // 1 minute
    retry: 2
  });
  
  // Find the currently selected city name
  const selectedCity = cities.find(city => city.id === selectedCityId);
  
  useEffect(() => {
    if (query.trim() === '') {
      // When query is empty, show a limited set of cities or none
      setFilteredCities([]);
    } else {
      const lowerCaseQuery = query.toLowerCase();
      setFilteredCities(
        cities.filter(
          (city) =>
            city.name.toLowerCase().includes(lowerCaseQuery) ||
            city.country.toLowerCase().includes(lowerCaseQuery)
        )
      );
    }
  }, [query, cities]);
  
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
    onSelect(cityId);
    setIsOpen(false);
    setQuery('');
  };
  
  return (
    <div className="w-full max-w-md mx-auto relative" ref={searchRef}>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 glass-card focus-ring"
        >
          <div className="flex items-center">
            <Search className="w-4 h-4 text-muted-foreground mr-2" />
            <span>{selectedCity ? `${selectedCity.name}, ${selectedCity.country}` : 'Select a city'}</span>
          </div>
          <span className="text-xs bg-water-100 text-water-800 rounded-full px-2 py-0.5">
            {selectedCity ? 'Selected' : 'Choose'}
          </span>
        </button>
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card overflow-hidden z-10 animate-slide-down">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Type to search cities..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2 text-sm bg-transparent border-b border-border focus:border-primary/50 focus:outline-none"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="w-6 h-6 border-2 border-t-transparent border-water-500 rounded-full animate-spin mx-auto"></div>
              </div>
            ) : isError ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Could not load cities. Please try again.
              </div>
            ) : query.trim() === '' ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Start typing to search for cities
              </div>
            ) : filteredCities.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No cities match your search
              </div>
            ) : (
              <div className="py-2">
                {filteredCities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleSelectCity(city.id)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors ${
                      city.id === selectedCityId ? 'bg-muted/30 font-medium' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{city.name}</span>
                      <span className="text-muted-foreground text-xs">{city.country}</span>
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
