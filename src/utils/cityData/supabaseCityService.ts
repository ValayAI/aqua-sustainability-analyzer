
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
      
      // Try searching with a more flexible approach
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
    }

    console.log('Retrieved city data from Supabase:', data);
    return transformCityData(data as SupabaseCity);
  } catch (error) {
    console.error('Unexpected error in getSupabaseCityById:', error);
    return getDefaultCityById(id);
  }
};
