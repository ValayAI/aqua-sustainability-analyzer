
import React, { useState, useEffect } from 'react';
import { Droplet, BarChart3, Recycle, Gauge, ExternalLink, ChevronDown } from 'lucide-react';
import Navbar from '../components/Navbar';
import CitySearch from '../components/CitySearch';
import MetricsCard from '../components/MetricsCard';
import WaterUsageChart from '../components/WaterUsageChart';
import CityComparison from '../components/CityComparison';
import Footer from '../components/Footer';
import { getCityById } from '../utils/cityData';

const Index = () => {
  const [selectedCityId, setSelectedCityId] = useState('nyc');
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  const selectedCity = getCityById(selectedCityId);
  
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Add animation delay on initial load
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 200);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);
  
  if (!selectedCity) return null;
  
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
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-28 pb-16 px-6 relative overflow-hidden">
        <div 
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-water-200/50 to-transparent -z-10 blur-3xl animate-float"
          style={{ animationDelay: "0.2s" }}
        />
        <div 
          className="absolute bottom-10 left-10 w-64 h-64 bg-gradient-radial from-eco-200/30 to-transparent -z-10 blur-3xl animate-float"
          style={{ animationDelay: "1.5s" }}
        />
        
        <div className="max-w-4xl mx-auto text-center">
          <div 
            className="inline-block px-3 py-1 rounded-full bg-water-100 text-water-800 text-xs font-medium mb-5 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            Water Sustainability Analytics
          </div>
          
          <h1 
            className="text-4xl md:text-5xl font-bold leading-tight mb-4 animate-slide-down"
            style={{ animationDelay: "0.2s" }}
          >
            Analyzing Water Usage & Recycling in Major Cities
          </h1>
          
          <p 
            className="text-lg text-muted-foreground mb-8 animate-slide-down"
            style={{ animationDelay: "0.3s" }}
          >
            Explore comprehensive data on water consumption, conservation, and sustainability
            initiatives across the world's most populous urban centers.
          </p>
          
          <div 
            className="animate-slide-down"
            style={{ animationDelay: "0.4s" }}
          >
            <CitySearch onSelect={setSelectedCityId} selectedCityId={selectedCityId} />
          </div>
          
          <a 
            href="#insights"
            className="flex items-center justify-center mt-12 text-sm text-muted-foreground hover:text-foreground transition-colors animate-slide-down mx-auto"
            style={{ animationDelay: "0.5s" }}
          >
            Explore Insights
            <ChevronDown className="ml-1 h-4 w-4 animate-bounce" />
          </a>
        </div>
      </section>
      
      {/* City Overview */}
      <section id="insights" className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className={`text-2xl font-semibold mb-2 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
              Water Analysis: {selectedCity.name}, {selectedCity.country}
            </h2>
            <p className={`text-muted-foreground transition-all duration-500 delay-100 ${isVisible ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
              Population: {selectedCity.population} million | Latest data as of 2022
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
      
      {/* CTA Section */}
      <section className="py-16 px-6 my-16 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div 
            className="absolute inset-0 bg-gradient-radial from-water-50 to-transparent -z-10"
          />
          
          <h2 className="text-2xl md:text-3xl font-bold mb-4 animate-fade-in">
            Want to learn more about water conservation?
          </h2>
          
          <p className="text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Discover how cities around the world are implementing innovative solutions
            to address water scarcity and promote sustainable usage.
          </p>
          
          <a 
            href="#" 
            className="inline-flex items-center justify-center glass-card px-6 py-3 text-water-700 hover:text-water-800 hover:shadow-md transition-all animate-fade-in focus-ring"
            style={{ animationDelay: "0.2s" }}
          >
            Explore Resources
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
