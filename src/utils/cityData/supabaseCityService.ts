
import { supabase } from "@/integrations/supabase/client";
import { City, SupabaseCity } from "../types/cityTypes";
import { transformCityData } from "./transformData";
import { getDefaultCities, getDefaultCityById } from "./defaultCityData";

// Function to get city data from Supabase
export const getSupabaseCities = async (): Promise<{ id: string; name: string; country: string }[]> => {
  try {
    console.log("Fetching cities from Supabase");
    // Make sure we're explicitly selecting all fields needed
    const { data, error } = await supabase
      .from('CityWaterUsage')
      .select('city_name, country');

    if (error) {
      console.error('Error fetching cities from Supabase:', error);
      return getDefaultCities(); // Return default cities when fetch fails
    }

    // If no data found or empty array, log and return defaults
    if (!data || data.length === 0) {
      console.error('No cities found in Supabase (received empty array), returning default data');
      return getDefaultCities();
    }

    console.log('Successfully fetched cities from Supabase:', data);
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

// Function to get city data by ID with better error handling
export const getSupabaseCityById = async (id: string): Promise<City | undefined> => {
  try {
    console.log(`Starting fetch for city ID: ${id}`);
    
    // Convert the ID format (underscore) to a potential city name (spaces)
    // This handles IDs like "new_york_city" -> search for "New York City"
    const cityNameFromId = id.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    console.log(`Converted ID "${id}" to search name "${cityNameFromId}"`);
    
    // Direct query with exact city name first
    const { data, error } = await supabase
      .from('CityWaterUsage')
      .select('*')
      .eq('city_name', cityNameFromId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching city data from Supabase:', error);
      return getDefaultCityById(id);
    }
    
    if (data) {
      console.log(`Found exact match for city: ${cityNameFromId}`, data);
      return transformCityData(data as SupabaseCity);
    }
    
    // If no exact match, try a case-insensitive search
    console.log(`No exact match found, trying case-insensitive search for: ${cityNameFromId}`);
    const { data: caseInsensitiveData, error: ciError } = await supabase
      .from('CityWaterUsage')
      .select('*')
      .ilike('city_name', cityNameFromId)
      .maybeSingle();
    
    if (ciError) {
      console.error('Error in case-insensitive search:', ciError);
      return getDefaultCityById(id);
    }
    
    if (caseInsensitiveData) {
      console.log(`Found case-insensitive match for: ${cityNameFromId}`, caseInsensitiveData);
      return transformCityData(caseInsensitiveData as SupabaseCity);
    }
    
    // Still no match - try just the first word of the city name
    const firstWord = cityNameFromId.split(' ')[0];
    console.log(`No case-insensitive match, trying first word: ${firstWord}`);
    
    const { data: firstWordData, error: fwError } = await supabase
      .from('CityWaterUsage')
      .select('*')
      .ilike('city_name', `%${firstWord}%`)
      .maybeSingle();
    
    if (fwError) {
      console.error('Error in first word search:', fwError);
      return getDefaultCityById(id);
    }
    
    if (firstWordData) {
      console.log(`Found match using first word for: ${firstWord}`, firstWordData);
      return transformCityData(firstWordData as SupabaseCity);
    }
    
    // If all attempts fail, log and return default
    console.error(`No matching city found in Supabase for ID: ${id}, cityName: ${cityNameFromId}`);
    return getDefaultCityById(id);
  } catch (err) {
    console.error('Unexpected error in getSupabaseCityById:', err);
    return getDefaultCityById(id);
  }
};
