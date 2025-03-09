
export interface WaterData {
  year: number;
  value: number;
}

export interface RecyclingData {
  year: number;
  percentage: number;
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

export const cities: City[] = [
  {
    id: "nyc",
    name: "New York",
    country: "United States",
    population: 8.4,
    waterUsage: {
      perCapita: 100,
      totalDaily: 1000,
      unit: "gallons",
      trend: "decreasing",
    },
    waterSources: [
      { source: "Reservoirs", percentage: 90 },
      { source: "Groundwater", percentage: 10 },
    ],
    waterConsumption: [
      { year: 2018, value: 1100 },
      { year: 2019, value: 1050 },
      { year: 2020, value: 1000 },
      { year: 2021, value: 980 },
      { year: 2022, value: 950 },
    ],
    waterRecycling: [
      { year: 2018, percentage: 5 },
      { year: 2019, percentage: 7 },
      { year: 2020, percentage: 10 },
      { year: 2021, percentage: 12 },
      { year: 2022, percentage: 15 },
    ],
    sustainabilityScore: 75,
    challenges: [
      "Aging infrastructure",
      "Population growth",
      "Climate change impacts",
    ],
    initiatives: [
      {
        name: "Water Conservation Program",
        description: "Citywide initiative to reduce water usage",
        year: 2019,
        impact: "Reduced per capita consumption by 10%",
      },
      {
        name: "Green Infrastructure Plan",
        description: "Implementation of natural water management systems",
        year: 2020,
        impact: "Improved stormwater management by 15%",
      },
    ],
  },
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    population: 13.96,
    waterUsage: {
      perCapita: 80,
      totalDaily: 1600,
      unit: "gallons",
      trend: "stable",
    },
    waterSources: [
      { source: "Rivers", percentage: 70 },
      { source: "Reservoirs", percentage: 30 },
    ],
    waterConsumption: [
      { year: 2018, value: 1620 },
      { year: 2019, value: 1610 },
      { year: 2020, value: 1600 },
      { year: 2021, value: 1605 },
      { year: 2022, value: 1600 },
    ],
    waterRecycling: [
      { year: 2018, percentage: 12 },
      { year: 2019, percentage: 15 },
      { year: 2020, percentage: 18 },
      { year: 2021, percentage: 20 },
      { year: 2022, percentage: 23 },
    ],
    sustainabilityScore: 85,
    challenges: [
      "Urban density",
      "Limited natural resources",
      "Natural disasters",
    ],
    initiatives: [
      {
        name: "Advanced Water Recycling",
        description:
          "Implementation of cutting-edge water recycling technologies",
        year: 2018,
        impact: "Increased recycled water usage by 10%",
      },
      {
        name: "Smart Water Management",
        description:
          "IoT-based monitoring and management of water distribution systems",
        year: 2020,
        impact: "Reduced water leakage by 25%",
      },
    ],
  },
  {
    id: "london",
    name: "London",
    country: "United Kingdom",
    population: 8.9,
    waterUsage: {
      perCapita: 90,
      totalDaily: 900,
      unit: "gallons",
      trend: "decreasing",
    },
    waterSources: [
      { source: "Thames River", percentage: 70 },
      { source: "Groundwater", percentage: 30 },
    ],
    waterConsumption: [
      { year: 2018, value: 950 },
      { year: 2019, value: 930 },
      { year: 2020, value: 920 },
      { year: 2021, value: 910 },
      { year: 2022, value: 900 },
    ],
    waterRecycling: [
      { year: 2018, percentage: 8 },
      { year: 2019, percentage: 10 },
      { year: 2020, percentage: 12 },
      { year: 2021, percentage: 15 },
      { year: 2022, percentage: 18 },
    ],
    sustainabilityScore: 80,
    challenges: [
      "Historical infrastructure",
      "Urban growth",
      "Climate unpredictability",
    ],
    initiatives: [
      {
        name: "Thames Tideway Tunnel",
        description: "Major sewage and stormwater management project",
        year: 2016,
        impact: "Will reduce sewage overflow by 95% when completed",
      },
      {
        name: "Water Efficiency Campaign",
        description: "Public awareness and education program",
        year: 2019,
        impact: "Reduced household water usage by 8%",
      },
    ],
  },
  {
    id: "singapore",
    name: "Singapore",
    country: "Singapore",
    population: 5.7,
    waterUsage: {
      perCapita: 85,
      totalDaily: 500,
      unit: "gallons",
      trend: "decreasing",
    },
    waterSources: [
      { source: "Imported", percentage: 40 },
      { source: "Reservoirs", percentage: 30 },
      { source: "NEWater (Recycled)", percentage: 30 },
    ],
    waterConsumption: [
      { year: 2018, value: 530 },
      { year: 2019, value: 520 },
      { year: 2020, value: 510 },
      { year: 2021, value: 505 },
      { year: 2022, value: 500 },
    ],
    waterRecycling: [
      { year: 2018, percentage: 25 },
      { year: 2019, percentage: 27 },
      { year: 2020, percentage: 30 },
      { year: 2021, percentage: 32 },
      { year: 2022, percentage: 35 },
    ],
    sustainabilityScore: 90,
    challenges: ["Limited land area", "Water dependency", "Climate change"],
    initiatives: [
      {
        name: "NEWater",
        description: "Advanced water purification and recycling system",
        year: 2003,
        impact: "Supplies up to 40% of Singapore's water needs",
      },
      {
        name: "ABC Waters Programme",
        description:
          "Integration of canals and reservoirs into public spaces",
        year: 2006,
        impact: "Enhanced water quality and public awareness",
      },
    ],
  },
];

export const getCityById = (id: string): City | undefined => {
  return cities.find((city) => city.id === id);
};

export const getCities = (): { id: string; name: string; country: string }[] => {
  return cities.map(({ id, name, country }) => ({ id, name, country }));
};
