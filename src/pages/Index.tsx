
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, ExternalLink, ChevronDown } from 'lucide-react';
import Navbar from '../components/Navbar';
import CitySearch from '../components/CitySearch';
import Footer from '../components/Footer';
import { getCityById } from '../utils/cityData';

const Index = () => {
  const [selectedCityId, setSelectedCityId] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Add animation delay on initial load
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 200);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);
  
  // Handle city selection and redirect to dashboard
  const handleCitySelect = (cityId: string) => {
    setSelectedCityId(cityId);
    navigate(`/dashboard?cityId=${cityId}`, { 
      state: { selectedCityId: cityId } 
    });
  };
  
  return (
    <div className="min-h-screen relative">
      <Navbar activePage="home" />
      
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
            <CitySearch onSelect={handleCitySelect} selectedCityId={selectedCityId} />
          </div>
          
          <a 
            href="#about"
            className="flex items-center justify-center mt-12 text-sm text-muted-foreground hover:text-foreground transition-colors animate-slide-down mx-auto"
            style={{ animationDelay: "0.5s" }}
          >
            Learn More
            <ChevronDown className="ml-1 h-4 w-4 animate-bounce" />
          </a>
        </div>
      </section>
      
      {/* About Section */}
      <section id="about" className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Why Water Analytics Matters</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Understanding water usage patterns helps cities develop sustainable water management strategies
              for future generations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="glass-card p-6 text-center">
              <div className="w-12 h-12 bg-water-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Droplet className="h-6 w-6 text-water-600" />
              </div>
              <h3 className="text-xl font-medium mb-2">Conservation</h3>
              <p className="text-muted-foreground">
                Identifying usage patterns helps develop effective conservation strategies and policies.
              </p>
            </div>
            
            <div className="glass-card p-6 text-center">
              <div className="w-12 h-12 bg-water-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-water-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Efficiency</h3>
              <p className="text-muted-foreground">
                Data-driven insights help optimize distribution systems and reduce water waste.
              </p>
            </div>
            
            <div className="glass-card p-6 text-center">
              <div className="w-12 h-12 bg-water-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-water-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Sustainability</h3>
              <p className="text-muted-foreground">
                Understanding current usage helps plan for future sustainability and climate resilience.
              </p>
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
