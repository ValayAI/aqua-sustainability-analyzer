import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Droplet, BarChart3, Recycle, Gauge } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import Navbar from '../components/Navbar';
import MetricsCard from '../components/MetricsCard';
import WaterUsageChart from '../components/WaterUsageChart';
import CityComparison from '../components/CityComparison';
import Footer from '../components/Footer';
import { getSupabaseCityById } from '../utils/supabaseData';
import { City } from '../utils/supabaseData';
import { useQuery } from '@tanstack/react-query';

const Dashboard = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get the city ID from the URL params or state
  const searchParams = new URLSearchParams(location.search);
  const cityIdFromUrl = searchParams.get('cityId');
  const cityIdFromState = location.state?.selectedCityId;
  const [selectedCityId, setSelectedCityId] = useState(cityIdFromUrl || cityIdFromState || 'new_york');
  
  // Fetch city data from Supabase using React Query
  const { data: selectedCity, isLoading, error } = useQuery({
    queryKey: ['city', selectedCityId],
    queryFn: () => getSupabaseCityById(selectedCityId),
    staleTime: 60000, // 1 minute
    retry: 2,
    retryDelay: 1000
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

  // Only update URL after component mounts to avoid state updates during render
  useEffect(() => {
    if (selectedCityId) {
      const newPath = `/dashboard?cityId=${selectedCityId}`;
      // Only update if different from current path to avoid unnecessary history entries
      if (location.search !== `?cityId=${selectedCityId}`) {
        navigate(newPath, { 
          replace: true,
          state: { selectedCityId }
        });
      }
    }
  }, [selectedCityId, navigate, location.search]);
  
  // Show toast notification if there's an error
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading city data",
        description: "Could not fetch water data for this city. Please try again later.",
        variant: "destructive",
      });
      console.error("Error fetching city data:", error);
    }
  }, [error, toast]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        <Navbar activePage="dashboard" />
        <div className="pt-32 pb-8 px-6 flex justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 w-full max-w-7xl">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass-card p-5 h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Return fallback UI if city is not found
  if (!selectedCity) {
    return (
      <div className="min-h-screen relative">
        <Navbar activePage="dashboard" />
        <div className="pt-32 pb-8 px-6 flex justify-center">
          <div className="glass-card p-8 max-w-lg w-full">
            <h2 className="text-xl font-semibold mb-4">City Data Not Available</h2>
            <p className="mb-4">We couldn't find water data for the requested city.</p>
            <button 
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-water-500 text-white rounded-md hover:bg-water-600 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Get trend indicators for metrics cards
  const consumptionTrend = selectedCity.waterUsage.trend === 'decreasing' 
    ? 'down' 
    : selectedCity.waterUsage.trend === 'increasing' 
      ? 'up' 
      : 'neutral';
  
  // Calculate recycling trend by comparing the first and last data points
  const recyclingData = selectedCity.waterRecycling;
  const firstRecyclingValue = recyclingData[0].percentage;
  const lastRecyclingValue = recyclingData[recyclingData.length - 1].percentage;
  const recyclingTrend = lastRecyclingValue > firstRecyclingValue ? 'up' : lastRecyclingValue < firstRecyclingValue ? 'down' : 'neutral';
  
  return (
    <div className="min-h-screen relative">
      <Navbar activePage="dashboard" />
      
      {/* City Overview */}
      <section id="insights" className="pt-32 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className={`text-2xl font-semibold mb-2 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
              Water Analysis: {selectedCity.name}, {selectedCity.country}
            </h2>
            <p className={`text-muted-foreground transition-all duration-500 delay-100 ${isVisible ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
              Population: {typeof selectedCity.population === 'number' ? selectedCity.population.toLocaleString() : selectedCity.population} million | Latest data as of 2022
            </p>
          </div>
          
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <MetricsCard 
              title="Daily Water Usage"
              value={`${selectedCity.waterUsage.totalDaily}`}
              subtitle={`Million ${selectedCity.waterUsage.unit}/day`}
              icon={<Droplet className="h-5 w-5" />}
              trend={consumptionTrend === 'up' ? 'down' : consumptionTrend === 'down' ? 'up' : 'neutral'}
              className={`transition-all duration-500 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            />
            
            <MetricsCard 
              title="Per Capita Usage"
              value={`${selectedCity.waterUsage.perCapita}`}
              subtitle={`${selectedCity.waterUsage.unit}/person/day`}
              icon={<BarChart3 className="h-5 w-5" />}
              trend={consumptionTrend === 'up' ? 'down' : consumptionTrend === 'down' ? 'up' : 'neutral'}
              className={`transition-all duration-500 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            />
            
            <MetricsCard 
              title="Recycling Rate"
              value={`${lastRecyclingValue}%`}
              subtitle="Of total water recycled"
              icon={<Recycle className="h-5 w-5" />}
              trend={recyclingTrend}
              className={`transition-all duration-500 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            />
            
            <MetricsCard 
              title="Sustainability Score"
              value={selectedCity.sustainabilityScore}
              subtitle="Out of 100"
              icon={<Gauge className="h-5 w-5" />}
              trend={selectedCity.sustainabilityScore > 70 ? 'up' : selectedCity.sustainabilityScore < 50 ? 'down' : 'neutral'}
              className={`transition-all duration-500 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            />
          </div>
          
          {/* Charts and Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <WaterUsageChart 
              city={selectedCity} 
              className={`transition-all duration-500 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            />
            
            <CityComparison 
              currentCityId={selectedCityId} 
              className={`transition-all duration-500 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            />
          </div>
          
          {/* Water Sources */}
          <div className={`glass-card p-5 mb-8 transition-all duration-500 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="mb-4">
              <h3 className="text-lg font-medium">Water Sources</h3>
              <p className="text-sm text-muted-foreground">
                Distribution of {selectedCity.name}'s water supply by source
              </p>
            </div>
            
            <div className="space-y-5">
              {selectedCity.waterSources.map((source, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{source.source}</span>
                    <span className="font-medium">{source.percentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-water-500" 
                      style={{ 
                        width: `${source.percentage}%`,
                        transition: 'width 1s ease-in-out',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Challenges and Initiatives */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className={`glass-card p-5 transition-all duration-500 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="mb-4">
                <h3 className="text-lg font-medium">Key Challenges</h3>
                <p className="text-sm text-muted-foreground">
                  Current water management challenges in {selectedCity.name}
                </p>
              </div>
              
              <ul className="space-y-3">
                {selectedCity.challenges.map((challenge, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-water-500 mt-1.5 mr-2" />
                    <span>{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className={`glass-card p-5 transition-all duration-500 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="mb-4">
                <h3 className="text-lg font-medium">Sustainability Initiatives</h3>
                <p className="text-sm text-muted-foreground">
                  Notable water conservation programs in {selectedCity.name}
                </p>
              </div>
              
              <div className="space-y-4">
                {selectedCity.initiatives.map((initiative, index) => (
                  <div key={index} className="border-l-2 border-eco-500 pl-4 py-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{initiative.name}</h4>
                      <span className="text-xs bg-eco-100 text-eco-800 px-2 py-0.5 rounded-full">
                        {initiative.year}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{initiative.description}</p>
                    <p className="text-xs text-eco-600 mt-1">{initiative.impact}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
