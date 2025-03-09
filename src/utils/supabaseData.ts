
import { supabase } from "@/integrations/supabase/client";

export interface WaterData {
  year: number;
  value: number;
}

export interface RecyclingData {
  year: number;
  percentage: number;
}

export interface SupabaseCity {
  city_name: string;
  country: string;
  population: string;
  per_capita_usage_gpd: number;
  daily_water_usage_mgd: number;
  "recycling_rate (%)": number; // This matches the actual column name in Supabase
  sustainability_score: number;
  key_challenges: string;
  tier: string;
}

export interface City {
  id: string;
  name: string;
  country: string;
  population: number;
  waterUsage: {
    perCapita: number;
    totalDaily: number;
    unit: string;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  waterSources: {
    source: string;
    percentage: number;
  }[];
  waterConsumption: WaterData[];
  waterRecycling: RecyclingData[];
  sustainabilityScore: number;
  challenges: string[];
  initiatives: {
    name: string;
    description: string;
    year: number;
    impact: string;
  }[];
}

// Function to get city data from Supabase
export const getSupabaseCities = async (): Promise<{ id: string; name: string; country: string }[]> => {
  try {
    console.log("Fetching cities from Supabase");
    const { data, error } = await supabase
      .from('CityWaterUsage')
      .select('city_name, country');

    if (error) {
      console.error('Error fetching cities from Supabase:', error);
      return getDefaultCities(); // Return default cities when fetch fails
    }

    if (!data || data.length === 0) {
      console.warn('No cities found in Supabase, returning default data');
      return getDefaultCities();
    }

    return data.map((city) => ({
      id: city.city_name.toLowerCase().replace(/\s+/g, '_'),
      name: city.city_name,
      country: city.country || 'Unknown',
    }));
  } catch (err) {
    console.error('Unexpected error in getSupabaseCities:', err);
    return getDefaultCities();
  }
};

// Create a set of default cities that match the schema
const getDefaultCities = () => {
  return [
    { id: 'new_york', name: 'New York', country: 'USA' },
    { id: 'london', name: 'London', country: 'UK' },
    { id: 'tokyo', name: 'Tokyo', country: 'Japan' },
    { id: 'paris', name: 'Paris', country: 'France' },
    { id: 'sydney', name: 'Sydney', country: 'Australia' }
  ];
};

// Convert Supabase city data to the format expected by components
export const transformCityData = (supabaseCity: SupabaseCity): City => {
  // Parse challenges from the key_challenges string
  const challenges = supabaseCity.key_challenges 
    ? supabaseCity.key_challenges.split(';').map(challenge => challenge.trim()) 
    : ['Water scarcity', 'Aging infrastructure', 'Climate change impacts'];

  // Generate water consumption trends based on the daily usage
  const baseValue = supabaseCity.daily_water_usage_mgd || 1000;
  const waterConsumption = [
    { year: 2018, value: baseValue * 1.1 },
    { year: 2019, value: baseValue * 1.05 },
    { year: 2020, value: baseValue },
    { year: 2021, value: baseValue * 0.98 },
    { year: 2022, value: baseValue * 0.95 },
  ];

  // Generate recycling trends
  const recyclingRate = supabaseCity["recycling_rate (%)"] || 15;
  const waterRecycling = [
    { year: 2018, percentage: Math.max(5, recyclingRate - 10) },
    { year: 2019, percentage: Math.max(7, recyclingRate - 8) },
    { year: 2020, percentage: Math.max(9, recyclingRate - 5) },
    { year: 2021, percentage: Math.max(11, recyclingRate - 3) },
    { year: 2022, percentage: recyclingRate },
  ];

  // Default water sources
  const waterSources = [
    { source: "Reservoirs", percentage: 70 },
    { source: "Groundwater", percentage: 20 },
    { source: "Other", percentage: 10 },
  ];

  // Sample initiatives data
  const initiatives = [
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
  ];

  // Parse population string to number - make it more readable
  let populationNumber = 0;
  try {
    // Check if population contains "million" or "M" and handle accordingly
    const populationStr = supabaseCity.population || '';
    if (populationStr.toLowerCase().includes('million') || populationStr.includes('M')) {
      // Extract the number part before "million" or "M"
      const match = populationStr.match(/(\d+(\.\d+)?)/);
      populationNumber = match ? parseFloat(match[0]) : 0;
    } else {
      // Convert full population number to millions for display
      populationNumber = parseFloat(populationStr.replace(/[^0-9.]/g, '')) / 1000000;
    }
    
    // Round to 2 decimal places for readability
    populationNumber = Math.round(populationNumber * 100) / 100;
  } catch (error) {
    console.error('Error parsing population:', error);
    populationNumber = 1.0; // Fallback value
  }

  // Determine trend based on tier
  const trend: 'increasing' | 'decreasing' | 'stable' = 
    supabaseCity.tier?.toLowerCase() === 'efficient' ? 'decreasing' :
    supabaseCity.tier?.toLowerCase() === 'growing' ? 'increasing' : 'stable';

  return {
    id: supabaseCity.city_name.toLowerCase().replace(/\s+/g, '_'),
    name: supabaseCity.city_name,
    country: supabaseCity.country || 'Unknown',
    population: populationNumber,
    waterUsage: {
      perCapita: supabaseCity.per_capita_usage_gpd || 100,
      totalDaily: supabaseCity.daily_water_usage_mgd || 1000,
      unit: "gallons",
      trend: trend,
    },
    waterSources: waterSources,
    waterConsumption: waterConsumption,
    waterRecycling: waterRecycling,
    sustainabilityScore: supabaseCity.sustainability_score || 70,
    challenges: challenges,
    initiatives: initiatives,
  };
};

// Function to get city data by ID with better error handling
export const getSupabaseCityById = async (id: string): Promise<City | undefined> => {
  try {
    // Convert id (e.g., 'new_york') to a proper city name format for searching (e.g., 'New York')
    const cityName = id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    console.log(`Searching for city: ${cityName}`);
    
    // First try to fetch the exact city by name
    const { data, error } = await supabase
      .from('CityWaterUsage')
      .select('*')
      .ilike('city_name', cityName)
      .maybeSingle();

    if (error) {
      console.error('Error fetching city from Supabase:', error);
      return getDefaultCityById(id);
    }

    if (!data) {
      console.log(`City not found in Supabase: ${cityName}`);
      
      // If exact match not found, try to fetch any available city
      const { data: anyCity, error: anyCityError } = await supabase
        .from('CityWaterUsage')
        .select('*')
        .limit(1)
        .maybeSingle();
        
      if (anyCityError || !anyCity) {
        console.log('No cities found in Supabase, using default city data');
        return getDefaultCityById(id);
      }
      
      console.log('Using an available city from database:', anyCity.city_name);
      return transformCityData(anyCity as SupabaseCity);
    }

    console.log('Retrieved city data from Supabase:', data);
    return transformCityData(data as SupabaseCity);
  } catch (error) {
    console.error('Unexpected error in getSupabaseCityById:', error);
    return getDefaultCityById(id);
  }
};

// Generate a default city when fetch fails - using data that matches the expected format
const getDefaultCityById = (id: string): City => {
  // Create a friendly name from the ID
  const cityName = id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  // Default cities data that aligns with the database schema
  const defaultCities: Record<string, Partial<City>> = {
    'new_york': {
      name: 'New York',
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
