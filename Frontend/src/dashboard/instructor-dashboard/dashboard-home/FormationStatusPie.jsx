import axios from 'axios';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Tooltip, Cell, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ddd'];

const FormationStatusPie = () => {
  const [statusData, setStatusData] = useState([]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/formations/status-count`, {
          withCredentials: true,
        });

        const formatted = Object.entries(res.data).map(([status, value]) => ({
          name: status.replace('_', ' '),
          value,
        }));

        setStatusData(formatted);
      } catch (err) {
        console.error('Failed to fetch formation status data:', err);
      }
    };

    fetchStatus();
  }, []);

  return (
    <div className="chart-container" style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={statusData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {statusData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FormationStatusPie;
