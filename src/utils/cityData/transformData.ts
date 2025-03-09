
import { City, SupabaseCity, SupabaseWaterConsumptionTrend, SupabaseWaterSource, SupabaseSustainabilityInitiative } from "../types/cityTypes";
import { supabase } from "@/integrations/supabase/client";

// Convert Supabase city data to the format expected by components
export const transformCityData = async (supabaseCity: SupabaseCity): Promise<City> => {
  console.log("Transforming Supabase city data:", supabaseCity);
  
  // Parse challenges from the key_challenges string
  let challenges = ['Water scarcity'];
  if (supabaseCity.key_challenges) {
    challenges = supabaseCity.key_challenges.split(',').map(challenge => challenge.trim());
  }

  // Fetch water consumption trends from WaterConsumptionTrend table
  let waterConsumption = [
    { year: 2018, value: Math.round((supabaseCity.daily_water_usage_mgd || 100) * 1.1) },
    { year: 2019, value: Math.round((supabaseCity.daily_water_usage_mgd || 100) * 1.05) },
    { year: 2020, value: Math.round(supabaseCity.daily_water_usage_mgd || 100) },
    { year: 2021, value: Math.round((supabaseCity.daily_water_usage_mgd || 100) * 0.98) },
    { year: 2022, value: Math.round((supabaseCity.daily_water_usage_mgd || 100) * 0.95) },
  ];
  
  try {
    const { data: consumptionData, error: consumptionError } = await supabase
      .from('WaterConsumptionTrend')
      .select('*')
      .eq('city_id', supabaseCity.id)
      .order('year', { ascending: true });
      
    if (consumptionData && consumptionData.length > 0 && !consumptionError) {
      waterConsumption = consumptionData.map((item: SupabaseWaterConsumptionTrend) => ({
        year: item.year,
        value: Number(item.value)
      }));
      console.log("Fetched water consumption trends:", waterConsumption);
    } else if (consumptionError) {
      console.error("Error fetching water consumption trends:", consumptionError);
    }
  } catch (err) {
    console.error("Error in water consumption trends fetch:", err);
  }

  // Generate recycling trends - using the actual recycling rate
  const recyclingRate = supabaseCity["recycling_rate (%)"] || 10;
  const waterRecycling = [
    { year: 2018, percentage: Math.max(5, Math.round(recyclingRate * 0.7)) },
    { year: 2019, percentage: Math.max(7, Math.round(recyclingRate * 0.8)) },
    { year: 2020, percentage: Math.max(9, Math.round(recyclingRate * 0.9)) },
    { year: 2021, percentage: Math.max(11, Math.round(recyclingRate * 0.95)) },
    { year: 2022, percentage: Math.round(recyclingRate) },
  ];

  // Fetch water sources from WaterSources table
  let waterSources = [
    { source: "Reservoirs", percentage: 70 },
    { source: "Groundwater", percentage: 20 },
    { source: "Other", percentage: 10 },
  ];
  
  try {
    const { data: sourcesData, error: sourcesError } = await supabase
      .from('WaterSources')
      .select('*')
      .eq('city_id', supabaseCity.id);
      
    if (sourcesData && sourcesData.length > 0 && !sourcesError) {
      waterSources = sourcesData.map((item: SupabaseWaterSource) => ({
        source: item.source_name,
        percentage: Number(item.percentage)
      }));
      console.log("Fetched water sources:", waterSources);
    } else if (sourcesError) {
      console.error("Error fetching water sources:", sourcesError);
    }
  } catch (err) {
    console.error("Error in water sources fetch:", err);
  }

  // Fetch sustainability initiatives from SustainabilityInitiatives table
  let initiatives = [
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
  
  try {
    const { data: initiativesData, error: initiativesError } = await supabase
      .from('SustainabilityInitiatives')
      .select('*')
      .eq('city_id', supabaseCity.id)
      .order('year', { ascending: false });
      
    if (initiativesData && initiativesData.length > 0 && !initiativesError) {
      initiatives = initiativesData.map((item: SupabaseSustainabilityInitiative) => ({
        name: item.name,
        description: item.description,
        year: item.year,
        impact: item.impact || "Impact data not available"
      }));
      console.log("Fetched sustainability initiatives:", initiatives);
    } else if (initiativesError) {
      console.error("Error fetching sustainability initiatives:", initiativesError);
    }
  } catch (err) {
    console.error("Error in sustainability initiatives fetch:", err);
  }

  // Parse population string to number (in millions)
  let populationNumber = 1.0; // Default fallback
  try {
    const populationStr = supabaseCity.population || '';
    
    if (populationStr.toLowerCase().includes('million') || populationStr.includes('M')) {
      // Extract the number part before "million" or "M"
      const match = populationStr.match(/(\d+(\.\d+)?)/);
      populationNumber = match ? parseFloat(match[0]) : 1.0;
    } else {
      // Try to parse as a number with commas and convert to millions
      const cleanedNumber = populationStr.replace(/,/g, '');
      populationNumber = parseFloat(cleanedNumber) / 1000000;
    }
    
    // Round to 2 decimal places for readability
    populationNumber = Math.round(populationNumber * 100) / 100;
    
    // Fallback if parsing failed
    if (isNaN(populationNumber) || populationNumber === 0) {
      populationNumber = 1.0;
    }
  } catch (error) {
    console.error('Error parsing population:', error);
    populationNumber = 1.0;
  }

  // Determine trend based on tier or other indicators
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (supabaseCity.tier) {
    if (supabaseCity.tier.toLowerCase().includes('1')) {
      trend = 'decreasing';
    } else if (supabaseCity.tier.toLowerCase().includes('3')) {
      trend = 'increasing';
    } else {
      trend = 'stable';
    }
  }

  // Build the transformed city object
  const transformedCity: City = {
    id: supabaseCity.id,
    name: supabaseCity.city_name,
    country: supabaseCity.country || 'Unknown',
    population: populationNumber,
    waterUsage: {
      perCapita: supabaseCity.per_capita_usage_gpd || 100,
      totalDaily: supabaseCity.daily_water_usage_mgd || 100,
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
