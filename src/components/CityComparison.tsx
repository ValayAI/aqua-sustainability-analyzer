
import React from 'react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getSupabaseCities } from '../utils/supabaseData';

interface CityComparisonProps {
  currentCityId: string;
  className?: string;
}

const CityComparison: React.FC<CityComparisonProps> = ({ currentCityId, className }) => {
  // Fetch all cities from Supabase
  const { data: cities = [], isLoading } = useQuery({
    queryKey: ['cities'],
    queryFn: getSupabaseCities,
    staleTime: 60000, // 1 minute
  });

  // Filter out the current city
  const otherCities = cities.filter(city => city.id !== currentCityId);
  
  return (
    <div className={`glass-card p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-medium">Compare with Other Cities</h3>
        <p className="text-sm text-muted-foreground">
          Select a city to view its water usage statistics
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {otherCities.slice(0, 6).map((city) => (
            <Button
              key={city.id}
              variant="outline"
              className="justify-start font-normal"
              onClick={() => {
                window.location.href = `/dashboard?cityId=${city.id}`;
              }}
            >
              {city.name}, {city.country}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CityComparison;
