
import { City, SupabaseCity } from "../types/cityTypes";

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
