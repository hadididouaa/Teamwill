import { useEffect, useState } from "react";
import axios from "axios";
import "./Profile.css";

const ProfileContent = ({ style }) => {
  const [user, setUser] = useState(null);
  const [editableUser, setEditableUser] = useState({});
  const [errorMsg, setErrorMsg] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [phoneError, setPhoneError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  const getPhotoUrl = (photo) => {
    if (!photo) return "http://localhost:3000/assets/uploads/1746128922729-855346037.png";
    if (typeof photo !== 'string') return "http://localhost:3000/assets/uploads/1746128922729-855346037.png";
    if (photo.startsWith('http')) return photo;
    if (photo.startsWith('/')) return `${API_URL}${photo}`;
    return `${API_URL}/uploads/${photo}`;
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/users/auth`,
          { withCredentials: true }
        );
        setUser(res.data);
        setEditableUser(res.data);
      } catch (err) {
        console.error("Error fetching user:", err);
        setErrorMsg("An error occurred or access was denied.");
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    setEditableUser({ ...editableUser, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

const handleSave = async () => {
  setPhoneError("");
  setErrorMsg("");

  // Validation
  if (editableUser.tel && !/^\d{8,15}$/.test(editableUser.tel)) {
    setPhoneError("Le numéro doit contenir entre 8 et 15 chiffres");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("username", editableUser.username || "");
    formData.append("email", editableUser.email || "");
    formData.append("tel", editableUser.tel || ""); // Important
    
    if (selectedImage) {
      formData.append("photo", selectedImage);
    }

    console.log("Données envoyées:", {
      tel: editableUser.tel,
      username: editableUser.username,
      email: editableUser.email
    });

    const res = await axios.put(
      `${import.meta.env.VITE_API_URL}/users/UpdateUser/${user.id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      }
    );

    console.log("Réponse du serveur:", res.data);

    // Mise à jour optimisée de l'état
    setUser(prev => ({
      ...prev,
      username: editableUser.username,
      email: editableUser.email,
      tel: editableUser.tel, // Utilise la valeur locale plutôt que la réponse
      photo: res.data.user?.photo || prev.photo
    }));

    setIsEditing(false);
    setSelectedImage(null);
    
  } catch (err) {
    console.error("Erreur:", err.response?.data || err);
    setErrorMsg(err.response?.data?.message || "Erreur lors de la mise à jour");
  }
};

  return (
    <div className="dashboard__content-wrap" style={{ maxWidth: "900px", ...style }}>
      <div className="profile-header">
        <div className="profile-title-container">
          <h2 className="profile-title">My Profile</h2>
          <button 
            className={`profile-edit-btn ${isEditing ? 'cancel' : 'edit'}`}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <>
                <i className="fas fa-times"></i> Cancel
              </>
            ) : (
              <>
                <i className="fas fa-edit"></i> Edit Profile
              </>
            )}
          </button>
        </div>

        {errorMsg && <div className="error-message">{errorMsg}</div>}
      </div>

      <div className="profile-content">
        <div className="profile-picture-section">
          <div className="profile-avatar-container">
            <img
              src={getPhotoUrl(user?.photo)}
              alt="profile"
              className="profile-avatar"
            />
            {isEditing && (
              <div className="avatar-upload">
                <label htmlFor="file-upload" className="upload-btn">
                  <i className="fas fa-camera"></i> Change Photo
                </label>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                {selectedImage && (
                  <div className="file-name">{selectedImage.name}</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="profile-details">
          <div className="profile-detail-item">
            <label>Username</label>
            {isEditing ? (
              <input
                className="profile-input"
                name="username"
                value={editableUser.username || ""}
                onChange={handleChange}
              />
            ) : (
              <div className="profile-value">{user?.username || "N/A"}</div>
            )}
          </div>

          <div className="profile-detail-item">
            <label>Email</label>
            {isEditing ? (
              <input
                className="profile-input"
                name="email"
                value={editableUser.email || ""}
                onChange={handleChange}
              />
            ) : (
              <div className="profile-value">{user?.email || "example@gmail.com"}</div>
            )}
          </div>

          <div className="profile-detail-item">
            <label>Phone</label>
            {isEditing ? (
              <div className="phone-input-container">
                <input
                  className="profile-input"
                  name="tel"
                  value={editableUser.tel || ""}
                  onChange={handleChange}
                  placeholder="Ex: 24567890"
                />
                {phoneError && <div className="error-message">{phoneError}</div>}
              </div>
            ) : (
              <div className="profile-value">{user?.tel || "N/A"}</div>
            )}
          </div>

          {isEditing && (
            <div className="profile-actions">
              <button className="save-btn" onClick={handleSave}>
                <i className="fas fa-save"></i> Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileContent;