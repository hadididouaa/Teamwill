import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const DashboardReviewTable = () => {
  const [users, setUsers] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/getAll`, {
          withCredentials: true, 
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs", error);
        setErrorMsg("Erreur ou accès refusé");
      }
    };

    fetchUsers();
  }, []);

  if (errorMsg) {
    return <p style={{ color: "red" }}>{errorMsg}</p>;
  }

  return (
    <table className="table table-borderless">
      <thead>
        <tr>
          <th>Username</th>
          <th>Email</th>
          <th>Rôle</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>
              <Link to={`/user/${user.id}`}>{user.username}</Link>
            </td>
            <td>{user.email}</td>
            <td>{user.roleUtilisateur}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DashboardReviewTable;
