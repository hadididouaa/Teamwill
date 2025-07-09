import axios from 'axios';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Tooltip, Cell, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#52c41a', '#1890ff', '#ff4d4f', '#ddd'];

const UserRolePie = () => {
 const [userRoleData, setUserRoleData] = useState([]);
  const [error, setError] = useState(null);

   useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/stats/countUsers`, {
          withCredentials: true,
        });

        const formatted = res.data.map(role => ({
          name: role.role,
          value: role.count,
        }));

        setUserRoleData(formatted);
      } catch (err) {
        console.error('Failed to fetch user role distribution:', err);
        setError('Accès non autorisé ou erreur serveur');
      }
    };

    fetchUserRoles();
  }, []);

   if (error) {
    return <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>;
  }

  return (
    <div className="chart-container" style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={userRoleData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {userRoleData.map((entry, index) => (
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

export default UserRolePie;
