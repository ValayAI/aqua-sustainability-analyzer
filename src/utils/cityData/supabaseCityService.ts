
import { supabase } from "@/integrations/supabase/client";
import { City, SupabaseCity } from "../types/cityTypes";
import { transformCityData } from "./transformData";
import { getDefaultCities, getDefaultCityById } from "./defaultCityData";

// Function to get city data from Supabase
export const getSupabaseCities = async (): Promise<{ id: string; name: string; country: string }[]> => {
  try {
    console.log("Fetching cities from Supabase");
    
    // First, try to get data from Supabase
    const { data, error } = await supabase
      .from('CityWaterUsage')
      .select('id, city_name, country');

    if (error) {
      console.error('Error fetching cities from Supabase:', error);
      return getDefaultCities(); 
    }

    if (!data || data.length === 0) {
      console.log('No cities found in Supabase, using default data');
      return getDefaultCities();
    }

    console.log('Successfully fetched cities from Supabase:', data);
    
    // Transform the data to the required format
    const cities = data.map((city) => ({
      id: city.id || city.city_name.toLowerCase().replace(/\s+/g, '_'),
      name: city.city_name,
      country: city.country || 'Unknown',
    }));
    
    // Add default cities to ensure we always have some data
    const defaultCities = getDefaultCities();
    
    // Combine and deduplicate based on city name (case-insensitive)
    const combinedCities = [...cities];
    
    // Add default cities that aren't already in the list
    defaultCities.forEach(defaultCity => {
      if (!combinedCities.some(city => 
        city.name.toLowerCase() === defaultCity.name.toLowerCase())) {
        combinedCities.push(defaultCity);
      }
    });
    
    console.log('Combined cities list:', combinedCities);
    return combinedCities;
  } catch (err) {
    console.error('Unexpected error in getSupabaseCities:', err);
    return getDefaultCities();
  }
};

// Function to get city data by ID with better error handling
export const getSupabaseCityById = async (id: string): Promise<City | undefined> => {
  try {
    console.log(`Starting fetch for city ID: ${id}`);
    
    // First try to find by ID
    const { data: idData, error: idError } = await supabase
      .from('CityWaterUsage')
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    if (idData) {
      console.log(`Found city with ID: ${id}`, idData);
      return transformCityData(idData as SupabaseCity);
    }
    
    if (idError) {
      console.error('Error fetching city by ID from Supabase:', idError);
    }
    
    // Convert the ID format (underscore) to a potential city name (spaces)
    const cityNameFromId = id.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    console.log(`Looking for city with name: "${cityNameFromId}"`);
    
    // Exact match query with case insensitivity
    const { data, error } = await supabase
      .from('CityWaterUsage')
      .select('*')
      .ilike('city_name', cityNameFromId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching city data from Supabase:', error);
      return getDefaultCityById(id);
    }
    
    // If match found
    if (data) {
      console.log(`Found match for: ${cityNameFromId}`, data);
      return transformCityData(data as SupabaseCity);
    }
    
    // Try partial match if exact match fails
    console.log(`No exact match found, trying partial match for: ${cityNameFromId}`);
    
    // Get first word of the city name for partial matching
    const partialQuery = cityNameFromId.split(' ')[0];
    
    // Partial match with first word
    const { data: partialMatchData, error: pmError } = await supabase
      .from('CityWaterUsage')
      .select('*')
      .ilike('city_name', `%${partialQuery}%`)
      .maybeSingle();
    
    if (pmError) {
      console.error('Error in partial match search:', pmError);
      return getDefaultCityById(id);
    }
    
    if (partialMatchData) {
      console.log(`Found partial match using: ${partialQuery}`, partialMatchData);
      return transformCityData(partialMatchData as SupabaseCity);
    }
    
    // If all searches fail, use default data
    console.log(`No matching city found in Supabase for ID: ${id}`);
    return getDefaultCityById(id);
  } catch (err) {
    console.error('Unexpected error in getSupabaseCityById:', err);
    return getDefaultCityById(id);
  }
};
