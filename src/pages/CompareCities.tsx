
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { getSupabaseCities } from '../utils/supabaseData';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CompareCities = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Fetch all cities from Supabase
  const { data: cities = [], isLoading } = useQuery({
    queryKey: ['cities'],
    queryFn: getSupabaseCities,
    staleTime: 60000, // 1 minute
  });

  useEffect(() => {
    // Add animation delay on initial load
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 200);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);
  
  return (
    <div className="min-h-screen relative">
      <Navbar activePage="compare" />
      
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className={`mb-8 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-2xl font-semibold mb-2">
              Compare Cities
            </h2>
            <p className="text-muted-foreground">
              Explore and compare water usage statistics across different cities
            </p>
          </div>
          
          <div className={`glass-card p-6 transition-all duration-500 delay-100 ${isVisible ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
            <div className="mb-6">
              <h3 className="text-lg font-medium">Compare with Other Cities</h3>
              <p className="text-sm text-muted-foreground">
                Select a city to view its water usage statistics
              </p>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {cities.map((city) => (
                  <Button
                    key={city.id}
                    variant="outline"
                    className="justify-start font-normal h-12"
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
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default CompareCities;
