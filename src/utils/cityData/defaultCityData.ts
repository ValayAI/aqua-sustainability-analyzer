
import { City } from "../types/cityTypes";

// Generate a set of default cities that match the schema
export const getDefaultCities = () => {
  return [
    { id: 'new_york_city', name: 'New York City', country: 'USA' },
    { id: 'london', name: 'London', country: 'UK' },
    { id: 'tokyo', name: 'Tokyo', country: 'Japan' },
    { id: 'paris', name: 'Paris', country: 'France' },
    { id: 'sydney', name: 'Sydney', country: 'Australia' }
  ];
};

// Generate a default city when fetch fails - using data that matches the expected format
export const getDefaultCityById = (id: string): City => {
  // Create a friendly name from the ID
  const cityName = id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  // Default cities data that aligns with the database schema
  const defaultCities: Record<string, Partial<City>> = {
    'new_york_city': {
      name: 'New York City',
      country: 'USA',
      population: 8.4,
      waterUsage: {
        perCapita: 100,
        totalDaily: 1000,
        unit: "gallons",
        trend: "decreasing",
      },
      sustainabilityScore: 75,
    },
    'london': {
      name: 'London',
      country: 'UK',
      population: 8.9,
      waterUsage: {
        perCapita: 90,
        totalDaily: 900,
        unit: "gallons",
        trend: "decreasing",
      },
      sustainabilityScore: 80,
    },
    'tokyo': {
      name: 'Tokyo',
      country: 'Japan',
      population: 13.96,
      waterUsage: {
        perCapita: 80,
        totalDaily: 1600,
        unit: "gallons",
        trend: "stable",
      },
      sustainabilityScore: 85,
    },
    'paris': {
      name: 'Paris',
      country: 'France',
      population: 2.16,
      waterUsage: {
        perCapita: 85,
        totalDaily: 400,
        unit: "gallons",
        trend: "decreasing",
      },
      sustainabilityScore: 78,
    },
    'sydney': {
      name: 'Sydney',
      country: 'Australia',
      population: 5.3,
      waterUsage: {
        perCapita: 95,
        totalDaily: 550,
        unit: "gallons",
        trend: "stable",
      },
      sustainabilityScore: 82,
    }
  };
  
  // Get the matching city data or use generic data
  const cityData = defaultCities[id] || {};
  
  return {
    id: id,
    name: cityData.name || cityName,
    country: cityData.country || 'USA',
    population: cityData.population || 1.0,
    waterUsage: cityData.waterUsage || {
      perCapita: 100,
      totalDaily: 1000,
      unit: "gallons",
      trend: 'stable',
    },
    waterSources: [
      { source: "Reservoirs", percentage: 70 },
      { source: "Groundwater", percentage: 20 },
      { source: "Other", percentage: 10 },
    ],
    waterConsumption: [
      { year: 2018, value: 1100 },
      { year: 2019, value: 1050 },
      { year: 2020, value: 1000 },
      { year: 2021, value: 980 },
      { year: 2022, value: 950 },
    ],
    waterRecycling: [
      { year: 2018, percentage: 5 },
      { year: 2019, percentage: 7 },
      { year: 2020, percentage: 9 },
      { year: 2021, percentage: 11 },
      { year: 2022, percentage: 15 },
    ],
    sustainabilityScore: cityData.sustainabilityScore || 70,
    challenges: ['Water scarcity', 'Aging infrastructure', 'Climate change impacts'],
    initiatives: [
      {
        name: "Water Conservation Program",
        description: "Citywide initiative to reduce water usage",
        year: 2019,
        impact: "Reduced per capita consumption by 10%"
      },
      {
        name: "Green Infrastructure Plan",
        description: "Implementation of natural water management systems",
        year: 2020,
        impact: "Improved stormwater management by 15%"
      }
    ],
  };
};
