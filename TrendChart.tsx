// components/charts/TrendChart.tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
  data: any[];
  dataKey: string;
}

const TrendChart: React.FC<Props> = ({ data, dataKey }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
        <LineChart
            data={data}
            margin={{
            top: 20,
            right: 30,
            left: 0,
            bottom: 5,
            }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={dataKey} stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} connectNulls />
        </LineChart>
        </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
