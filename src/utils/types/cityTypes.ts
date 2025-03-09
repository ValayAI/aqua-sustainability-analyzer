
// Data types for city information
export interface WaterData {
  year: number;
  value: number;
}

export interface RecyclingData {
  year: number;
  percentage: number;
}

export interface SupabaseWaterConsumptionTrend {
  id: string;
  city_id: string;
  year: number;
  value: number;
  created_at: string;
}

export interface SupabaseWaterSource {
  id: string;
  city_id: string;
  source_name: string;
  percentage: number;
  created_at: string;
}

export interface SupabaseSustainabilityInitiative {
  id: string;
  city_id: string;
  name: string;
  description: string;
  year: number;
  impact: string | null;
  created_at: string;
}

export interface SupabaseCity {
  city_name: string;
  country: string;
  population: string;
  per_capita_usage_gpd: number;
  daily_water_usage_mgd: number;
  "recycling_rate (%)": number; // This matches the actual column name in Supabase
  sustainability_score: number;
  key_challenges: string;
  tier: string;
  id: string;
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
