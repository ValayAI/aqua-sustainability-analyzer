
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { City } from '../utils/supabaseData';

interface WaterUsageChartProps {
  city: City;
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-2 border-none text-sm">
        <p className="font-medium">{`Year: ${label}`}</p>
        <p className="text-water-600">{`Usage: ${payload[0].value} million gallons/day`}</p>
      </div>
    );
  }

  return null;
};

const WaterUsageChart: React.FC<WaterUsageChartProps> = ({ city, className }) => {
  return (
    <div className={`glass-card p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-medium">Water Consumption Trends</h3>
        <p className="text-sm text-muted-foreground">
          Daily water usage (million gallons per day)
        </p>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={city.waterConsumption}
            margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="year" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#0ea5e9" 
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorWater)"
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-sm text-muted-foreground">
        <p>
          {city.waterUsage.trend === 'decreasing' && 'Water usage has been decreasing over recent years.'}
          {city.waterUsage.trend === 'increasing' && 'Water usage has been increasing over recent years.'}
          {city.waterUsage.trend === 'stable' && 'Water usage has remained relatively stable over recent years.'}
        </p>
      </div>
    </div>
  );
};

export default WaterUsageChart;
