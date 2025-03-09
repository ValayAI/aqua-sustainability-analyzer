
import React, { useState } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { City } from '../utils/types/cityTypes';

interface WaterUsageChartProps {
  city: City;
  className?: string;
}

const COLORS = ['#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-2 border-none text-sm">
        <p className="font-medium">{`Year: ${label}`}</p>
        <p className="text-water-600">
          {`Usage: ${Number(payload[0].value).toLocaleString()} million gallons/day`}
        </p>
      </div>
    );
  }

  return null;
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-2 border-none text-sm">
        <p className="font-medium">{`${payload[0].name}: ${payload[0].value}%`}</p>
      </div>
    );
  }

  return null;
};

const WaterUsageChart: React.FC<WaterUsageChartProps> = ({ city, className }) => {
  const [activeView, setActiveView] = useState<'trends' | 'sources'>('trends');
  
  // Make sure we have valid data to display
  if (!city) {
    return (
      <div className={`glass-card p-5 ${className}`}>
        <div className="mb-4">
          <h3 className="text-lg font-medium">Water Consumption Trends</h3>
          <p className="text-sm text-muted-foreground">No city data available</p>
        </div>
      </div>
    );
  }
  
  // Get the chart data
  const chartData = city.waterConsumption || [];
  const sourcesData = city.waterSources || [];
  
  return (
    <div className={`glass-card p-5 ${className}`}>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">
            {activeView === 'trends' ? 'Water Consumption Trends' : 'Water Sources'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {activeView === 'trends' 
              ? 'Daily water usage (million gallons per day)'
              : 'Distribution of water supply by source'
            }
          </p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setActiveView('trends')} 
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeView === 'trends' 
                ? 'bg-water-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Trends
          </button>
          <button 
            onClick={() => setActiveView('sources')} 
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeView === 'sources' 
                ? 'bg-water-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sources
          </button>
        </div>
      </div>
      
      {activeView === 'trends' ? (
        <>
          {chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">No consumption data available</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
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
                    tickFormatter={(value) => `${value < 1000 ? value : `${(value / 1000).toFixed(1)}k`}`}
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
          )}
          
          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              {city.waterUsage.trend === 'decreasing' && 'Water usage has been decreasing over recent years.'}
              {city.waterUsage.trend === 'increasing' && 'Water usage has been increasing over recent years.'}
              {city.waterUsage.trend === 'stable' && 'Water usage has remained relatively stable over recent years.'}
            </p>
          </div>
        </>
      ) : (
        <>
          {sourcesData.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">No water sources data available</p>
            </div>
          ) : (
            <div className="h-64 flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourcesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="percentage"
                    nameKey="source"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {sourcesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          
          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              {city.name}'s primary water source is {
                sourcesData.length > 0 
                  ? sourcesData.sort((a, b) => b.percentage - a.percentage)[0].source
                  : 'not available'
              }.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default WaterUsageChart;
