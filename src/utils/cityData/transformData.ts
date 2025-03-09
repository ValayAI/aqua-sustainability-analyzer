
import { City, SupabaseCity } from "../types/cityTypes";

// Convert Supabase city data to the format expected by components
export const transformCityData = (supabaseCity: SupabaseCity): City => {
  console.log("Raw Supabase city data:", supabaseCity);
  
  // Parse challenges from the key_challenges string
  let challenges = ['Water scarcity', 'Aging infrastructure', 'Climate change impacts']; // Default
  if (supabaseCity.key_challenges) {
    challenges = supabaseCity.key_challenges.split(',').map(challenge => challenge.trim());
  }

  // Generate water consumption trends based on the daily usage
  const baseValue = supabaseCity.daily_water_usage_mgd || 1000;
  const waterConsumption = [
    { year: 2018, value: Math.round(baseValue * 1.1) },
    { year: 2019, value: Math.round(baseValue * 1.05) },
    { year: 2020, value: Math.round(baseValue) },
    { year: 2021, value: Math.round(baseValue * 0.98) },
    { year: 2022, value: Math.round(baseValue * 0.95) },
  ];

  // Generate recycling trends - using the actual recycling rate
  const recyclingRate = supabaseCity["recycling_rate (%)"] || 15;
  const waterRecycling = [
    { year: 2018, percentage: Math.max(5, Math.round(recyclingRate * 0.7)) },
    { year: 2019, percentage: Math.max(7, Math.round(recyclingRate * 0.8)) },
    { year: 2020, percentage: Math.max(9, Math.round(recyclingRate * 0.9)) },
    { year: 2021, percentage: Math.max(11, Math.round(recyclingRate * 0.95)) },
    { year: 2022, percentage: Math.round(recyclingRate) },
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
      // Try to parse as a number with commas and convert to millions
      const cleanedNumber = populationStr.replace(/,/g, '');
      populationNumber = parseFloat(cleanedNumber) / 1000000;
    }
    
    // Round to 2 decimal places for readability
    populationNumber = Math.round(populationNumber * 100) / 100;
    
    // For safety, default to 1.0 if parsing failed
    if (isNaN(populationNumber) || populationNumber === 0) {
      populationNumber = 1.0;
    }
  } catch (error) {
    console.error('Error parsing population:', error);
    populationNumber = 1.0; // Fallback value
  }

  // Determine trend based on tier or other indicators
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (supabaseCity.tier) {
    trend = supabaseCity.tier.toLowerCase().includes('1') ? 'decreasing' :
           supabaseCity.tier.toLowerCase().includes('3') ? 'increasing' : 'stable';
  }

  // Build the transformed city object with actual data from Supabase
  const transformedCity: City = {
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

  console.log("Transformed city data:", transformedCity);
  return transformedCity;
};
