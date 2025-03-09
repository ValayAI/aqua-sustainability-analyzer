
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
      return getDefaultCities(); // Return default cities when fetch fails
    }

    if (!data || data.length === 0) {
      console.warn('No cities found in Supabase, returning default data');
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
    // Format city name for search - try different formats
    let cityName = id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    // Special case for New York - try both "New York" and "New York City"
    const possibleNames = [cityName];
    if (cityName === "New York") {
      possibleNames.push("New York City");
    } else if (cityName === "New York City") {
      possibleNames.push("New York");
    }
    
    console.log(`Searching for city with possible names:`, possibleNames);
    
    // Try all possible names
    for (const name of possibleNames) {
      const { data, error } = await supabase
        .from('CityWaterUsage')
        .select('*')
        .ilike('city_name', name)
        .maybeSingle();
      
      if (!error && data) {
        console.log(`Found city data for "${name}":`, data);
        return transformCityData(data as SupabaseCity);
      }
    }
    
    // If exact match not found, try a more flexible approach
    console.log(`No exact match found, trying fuzzy search...`);
    const { data: fuzzyData, error: fuzzyError } = await supabase
      .from('CityWaterUsage')
      .select('*')
      .ilike('city_name', `%${cityName.split(' ')[0]}%`) // Search using just the first word
      .limit(1)
      .maybeSingle();
      
    if (fuzzyError || !fuzzyData) {
      console.log('No matching cities found in Supabase, using default city data');
      return getDefaultCityById(id);
    }
    
    console.log('Found similar city in database:', fuzzyData.city_name);
    return transformCityData(fuzzyData as SupabaseCity);
  } catch (error) {
    console.error('Unexpected error in getSupabaseCityById:', error);
    return getDefaultCityById(id);
  }
};
