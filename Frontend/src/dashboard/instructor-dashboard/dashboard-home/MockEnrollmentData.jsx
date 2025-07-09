import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const MockEnrollmentData = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Can't use 'await' directly here, so define async function inside useEffect
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/stats/countQuiz`, {
          withCredentials: true,
        });
        setData(res.data);
      } catch (err) {
        console.error('Error fetching quiz performance data:', err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="chart-container" style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="titre" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="passed" stackId="a" fill="#48c650" name="Passed" />
          <Bar dataKey="failed" stackId="a" fill="#d16066" name="Failed" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MockEnrollmentData;
