
import { supabase } from "@/integrations/supabase/client";
import { City, SupabaseCity } from "../types/cityTypes";
import { transformCityData } from "./transformData";
import { getDefaultCities, getDefaultCityById } from "./defaultCityData";

// Function to get city data from Supabase
export const getSupabaseCities = async (): Promise<{ id: string; name: string; country: string }[]> => {
  try {
    console.log("Fetching cities from Supabase");
    const { data, error } = await supabase
      .from('CityWaterUsage')
      .select('city_name, country');

    if (error) {
      console.error('Error fetching cities from Supabase:', error);
      return getDefaultCities(); 
    }

    if (!data || data.length === 0) {
      console.error('No cities found in Supabase, returning default data');
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
    const cityNameFromId = id.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    console.log(`Looking for city with name: "${cityNameFromId}"`);
    
    // Exact match query
    let { data, error } = await supabase
      .from('CityWaterUsage')
      .select('*')
      .eq('city_name', cityNameFromId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching city data from Supabase:', error);
      return getDefaultCityById(id);
    }
    
    // If exact match found
    if (data) {
      console.log(`Found exact match for: ${cityNameFromId}`, data);
      return transformCityData(data as SupabaseCity);
    }
    
    // Try case-insensitive match
    console.log(`No exact match, trying case-insensitive search for: ${cityNameFromId}`);
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
    
    // Try partial match
    console.log(`No case-insensitive match, trying partial match search`);
    const firstWord = cityNameFromId.split(' ')[0];
    
    const { data: partialMatchData, error: pmError } = await supabase
      .from('CityWaterUsage')
      .select('*')
      .ilike('city_name', `%${firstWord}%`)
      .maybeSingle();
    
    if (pmError) {
      console.error('Error in partial match search:', pmError);
      return getDefaultCityById(id);
    }
    
    if (partialMatchData) {
      console.log(`Found partial match using: ${firstWord}`, partialMatchData);
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
