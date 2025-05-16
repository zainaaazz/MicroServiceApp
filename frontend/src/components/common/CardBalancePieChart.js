// src/components/common/CardBalancePieChart.js
import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// a simple color palette
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFE'];

export default function CardBalancePieChart({ cards }) {
  // transform your cards into { name, value } pairs
  const data = cards.map((c, i) => ({
    name: `${c.card_type} •••• ${c.card_number.slice(-4)}`,
    value: Number(c.current_balance)
  }));

  // filter out zero-balance cards if you like
  const filtered = data.filter(d => d.value > 0);

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={filtered}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
          >
            {filtered.map((entry, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={val => `R${val.toFixed(2)}`} 
          />
          <Legend layout="vertical" align="right" verticalAlign="middle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
