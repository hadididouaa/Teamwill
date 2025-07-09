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

    if (editableUser.tel && !/^[2459]\d{7}$/.test(editableUser.tel)) {
      setPhoneError("Phone number must start with 2, 4, 5, or 9 and contain 8 digits.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("username", editableUser.username || "");
      formData.append("email", editableUser.email || "");
      formData.append("tel", editableUser.tel || "");
      if (selectedImage) {
        formData.append("photo", selectedImage);
      }

      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/users/UpdateUser/${user.id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      setUser(res.data.user);
      setEditableUser(res.data.user);
      setIsEditing(false);
      setSelectedImage(null);
      window.location.reload();
    } catch (err) {
      console.error("Error updating user:", err);
      const msg =
        err.response?.data?.message || "Failed to update profile.";
      setErrorMsg(msg);
    }
  };

  return (
    <div className="dashboard__content-wrap" style={{ maxWidth: "900px", ...style }}>
      <div className="dashboard__content-title">
        <h4 className="title">My Profile</h4>
        <button className="pill-button" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>
      <br />
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      <div className="row">
        <div className="col-lg-12">
          <div className="profile__content-wrap">
            <ul className="list-wrap">
              <li>
                <span>Username</span>{" "}
                {isEditing ? (
                  <input
                    name="username"
                    value={editableUser.username || ""}
                    onChange={handleChange}
                  />
                ) : (
                  user?.username || "N/A"
                )}
              </li>
              <li>
                <span>Email</span>{" "}
                {isEditing ? (
                  <input
                    name="email"
                    value={editableUser.email || ""}
                    onChange={handleChange}
                  />
                ) : (
                  user?.email || "example@gmail.com"
                )}
              </li>
              <li>
                <span>Phone</span>
                {isEditing ? (
                  <div>
                    <input
                      name="tel"
                      value={editableUser.tel || ""}
                      onChange={handleChange}
                      placeholder="Ex: 24567890"
                    />
                    {phoneError && (
                      <p style={{ color: "red", margin: 0 }}>{phoneError}</p>
                    )}
                  </div>
                ) : (
                  user?.tel || "N/A"
                )}
              </li>
              <li>
                <span>Profile Picture</span>
                {isEditing ? (
                  <>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                    {selectedImage && <p>{selectedImage.name}</p>}
                  </>
                ) : (
                  <img
                    src={
                      user?.photo
                        ? user.photo  // ✅ already a full URL from backend
                        : "http://localhost:3000/assets/uploads/1746128922729-855346037.png"
                    }
                    alt="profile"
                    width="100"
                    style={{ borderRadius: "50px", objectFit: "cover" }}
                  />
                )}
              </li>
            </ul>
            {isEditing && (
              <button className="pill-button" onClick={handleSave}>
                Save
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileContent;