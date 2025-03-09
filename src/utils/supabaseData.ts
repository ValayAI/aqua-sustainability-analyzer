
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
  "recycling_rate (%)": number; // Updated to match the actual column name in Supabase
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

  return data.map((city, index) => ({
    id: city.city_name.toLowerCase().replace(/\s+/g, '_'),
    name: city.city_name,
    country: city.country || 'Unknown',
  }));
};

// Default cities to fall back on if Supabase fetch fails
const getDefaultCities = () => {
  return [
    { id: 'new_york', name: 'New York', country: 'USA' },
    { id: 'london', name: 'London', country: 'UK' },
    { id: 'tokyo', name: 'Tokyo', country: 'Japan' },
    { id: 'paris', name: 'Paris', country: 'France' },
    { id: 'sydney', name: 'Sydney', country: 'Australia' }
  ];
};

// Convert Supabase city data to the format expected by existing components
export const transformCityData = (supabaseCity: SupabaseCity): City => {
  // Parse challenges from the key_challenges string
  const challenges = supabaseCity.key_challenges 
    ? supabaseCity.key_challenges.split(';').map(challenge => challenge.trim()) 
    : ['Data not available'];

  // Generate sample data for consumption trends based on the daily usage
  const baseValue = supabaseCity.daily_water_usage_mgd || 1000;
  const waterConsumption = [
    { year: 2018, value: baseValue * 1.1 },
    { year: 2019, value: baseValue * 1.05 },
    { year: 2020, value: baseValue },
    { year: 2021, value: baseValue * 0.98 },
    { year: 2022, value: baseValue * 0.95 },
  ];

  // Generate sample data for recycling trends
  // Use the correct property name with the brackets notation to access the recycling rate
  const recyclingRate = supabaseCity["recycling_rate (%)"] || 10;
  const waterRecycling = [
    { year: 2018, percentage: Math.max(5, recyclingRate - 10) },
    { year: 2019, percentage: Math.max(7, recyclingRate - 8) },
    { year: 2020, percentage: Math.max(9, recyclingRate - 5) },
    { year: 2021, percentage: Math.max(11, recyclingRate - 3) },
    { year: 2022, percentage: recyclingRate },
  ];

  // Default water sources if we don't have this data in Supabase
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

  // Parse population string to number
  let populationNumber = 0;
  try {
    populationNumber = supabaseCity.population 
      ? parseFloat(supabaseCity.population.replace(/[^0-9.]/g, '')) 
      : 0;
  } catch (error) {
    console.error('Error parsing population:', error);
  }

  // Determine trend based on data
  const trend: 'increasing' | 'decreasing' | 'stable' = 
    supabaseCity.tier === 'efficient' ? 'decreasing' :
    supabaseCity.tier === 'growing' ? 'increasing' : 'stable';

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

// Function to get a specific city by ID with robust error handling
export const getSupabaseCityById = async (id: string): Promise<City | undefined> => {
  try {
    // Convert id (e.g., 'new_york') to a proper city name (e.g., 'New York')
    const cityName = id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    const { data, error } = await supabase
      .from('CityWaterUsage')
      .select('*')
      .ilike('city_name', cityName)
      .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no data is found

    if (error) {
      console.error('Error fetching city from Supabase:', error);
      return getDefaultCity(id);
    }

    if (!data) {
      console.log('City not found in Supabase:', cityName);
      return getDefaultCity(id);
    }

    return transformCityData(data as unknown as SupabaseCity);
  } catch (error) {
    console.error('Unexpected error in getSupabaseCityById:', error);
    return getDefaultCity(id);
  }
};

// Generate a default city when fetch fails
const getDefaultCity = (id: string): City => {
  // Create a friendly name from the ID
  const cityName = id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  return {
    id: id,
    name: cityName,
    country: 'Default Country',
    population: 1000000,
    waterUsage: {
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
    sustainabilityScore: 70,
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
