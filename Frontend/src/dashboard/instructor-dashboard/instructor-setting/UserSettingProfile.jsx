import { useEffect, useState } from "react";
import axios from "axios";
import { USER_ROLES } from "../../../constants/roles";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

const UserSettingProfile = ({ userId, style }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formValues, setFormValues] = useState({
    username: "",
    roleUtilisateur: "",
    tel: "",
    isActive: false,
    photo: null
  });

  useEffect(() => {
    if (userId) {
      axios
        .get(`${import.meta.env.VITE_API_URL}/users/getById/${userId}`, {
          withCredentials: true,
        })
        .then((res) => {
          setUser(res.data);
          setFormValues({
            username: res.data.username,
            roleUtilisateur: res.data.roleUtilisateur,
            tel: res.data.tel || "",
            isActive: res.data.isActive,
            photo: res.data.photo || null,
          });
        })
        .catch((err) => {
          console.error("Error loading user", err);
        });
    }
  }, [userId]);

  const handleChange = (e) => {
    const { id, value, type, checked, files } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("username", formValues.username);
      formData.append("roleUtilisateur", formValues.roleUtilisateur);
      formData.append("tel", formValues.tel);
      formData.append("isActive", formValues.isActive);
      if (formValues.photo) {
        formData.append("photo", formValues.photo);
      }

      const res = await axios.put(`${import.meta.env.VITE_API_URL}/users/edit/${userId}`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(res.data.message || "User updated successfully!", { position: 'top-center' });
      navigate("/listUsers");

    } catch (err) {
      console.error("Failed to update user", err);
      toast.error(err.response?.data?.error || "Update failed", { position: 'top-center' });
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <>
     
      <div className="instructor__profile-form-wrap mt-4">
        <form onSubmit={handleSubmit} className="instructor__profile-form">
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="username" className="form-label">Username</label>
              <input id="username" type="text" className="form-control" value={formValues.username} onChange={handleChange} />
            </div>

            <div className="col-md-6">
              <label htmlFor="roleUtilisateur" className="form-label">rôle d'utilisateur</label>
              <select id="roleUtilisateur" className="form-select" value={formValues.roleUtilisateur} onChange={handleChange}>
                <option value="">-- choisir rôle --</option>
                {USER_ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label htmlFor="tel" className="form-label">numéro de télephone</label>
              <input id="tel" type="text" className="form-control" value={formValues.tel} onChange={handleChange} />
            </div>

            <div className="col-md-6 d-flex align-items-center mt-4">
              <input id="isActive" type="checkbox" className="form-check-input me-2" checked={formValues.isActive} onChange={handleChange} />
              <label htmlFor="isActive" className="form-check-label">Active Profile</label>
            </div>
          </div>

          <div className="mt-4 text-end">
            <button type="submit" className="pill-button">
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default UserSettingProfile;
