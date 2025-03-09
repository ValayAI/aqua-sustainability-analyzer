
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { City, getCityById, getCities } from '../utils/cityData';

interface CityComparisonProps {
  currentCityId: string;
  className?: string;
}

const CityComparison: React.FC<CityComparisonProps> = ({ currentCityId, className }) => {
  const [compareMetric, setCompareMetric] = useState<'waterUsage' | 'recycling' | 'sustainability'>('waterUsage');
  
  const currentCity = getCityById(currentCityId);
  if (!currentCity) return null;
  
  const comparisonData = getCities().map(({ id, name }) => {
    const city = getCityById(id);
    if (!city) return null;
    
    let value = 0;
    let label = '';
    
    if (compareMetric === 'waterUsage') {
      value = city.waterUsage.perCapita;
      label = 'Per Capita Water Usage (gallons)';
    } else if (compareMetric === 'recycling') {
      value = city.waterRecycling[city.waterRecycling.length - 1].percentage;
      label = 'Water Recycling Rate (%)';
    } else {
      value = city.sustainabilityScore;
      label = 'Sustainability Score';
    }
    
    return {
      name: city.name,
      value,
      id: city.id,
    };
  }).filter(Boolean);
  
  // Sort the data from high to low
  comparisonData.sort((a, b) => (b?.value || 0) - (a?.value || 0));
  
  const getChartLabel = () => {
    switch (compareMetric) {
      case 'waterUsage':
        return 'Per Capita Water Usage (gallons)';
      case 'recycling':
        return 'Water Recycling Rate (%)';
      case 'sustainability':
        return 'Sustainability Score';
      default:
        return '';
    }
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-2 border-none text-sm">
          <p className="font-medium">{`${payload[0].payload.name}`}</p>
          <p>
            {`${getChartLabel()}: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className={`glass-card p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-medium">City Comparison</h3>
        <p className="text-sm text-muted-foreground">
          Compare {currentCity.name} with other major cities
        </p>
      </div>
      
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setCompareMetric('waterUsage')}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            compareMetric === 'waterUsage'
              ? 'bg-water-500 text-white'
              : 'bg-muted hover:bg-muted/80 text-foreground/70'
          }`}
        >
          Water Usage
        </button>
        <button
          onClick={() => setCompareMetric('recycling')}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            compareMetric === 'recycling'
              ? 'bg-eco-500 text-white'
              : 'bg-muted hover:bg-muted/80 text-foreground/70'
          }`}
        >
          Recycling Rate
        </button>
        <button
          onClick={() => setCompareMetric('sustainability')}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            compareMetric === 'sustainability'
              ? 'bg-primary text-white'
              : 'bg-muted hover:bg-muted/80 text-foreground/70'
          }`}
        >
          Sustainability
        </button>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={comparisonData as any}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
          >
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fontSize: 12 }} 
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {comparisonData.map((entry) => (
                <Cell 
                  key={`cell-${entry?.id}`} 
                  fill={entry?.id === currentCityId 
                    ? compareMetric === 'waterUsage' 
                      ? '#0ea5e9' 
                      : compareMetric === 'recycling'
                        ? '#10b981'
                        : '#3b82f6'
                    : '#cbd5e1'
                  } 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-sm text-muted-foreground">
        <p>
          {compareMetric === 'waterUsage' && 'Lower water usage per capita indicates better water efficiency.'}
          {compareMetric === 'recycling' && 'Higher recycling rates indicate better water conservation.'}
          {compareMetric === 'sustainability' && 'Higher sustainability scores indicate better overall water management.'}
        </p>
      </div>
    </div>
  );
};

export default CityComparison;
