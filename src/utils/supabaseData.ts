
// This file is maintained for backward compatibility
// It re-exports all the city data functions and types from the new modular structure
export type { City, WaterData, RecyclingData, SupabaseCity } from './types/cityTypes';
export { getSupabaseCities, getSupabaseCityById } from './cityData/supabaseCityService';
export { transformCityData } from './cityData/transformData';
export { getDefaultCities, getDefaultCityById } from './cityData/defaultCityData';
