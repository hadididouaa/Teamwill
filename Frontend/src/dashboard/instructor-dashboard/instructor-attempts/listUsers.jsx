import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import UserDetails from "../profile/UserDetails";
import "./UserList.css"; // Create this CSS file for custom styles

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  const getPhotoUrl = (photo) => {
    // Normalize photo values: trim whitespace, avoid duplicate /uploads segments,
    // and handle full URLs or absolute paths returned from various endpoints.
    if (!photo) return null;
    if (typeof photo !== 'string') return null;
    const p = photo.trim();
    if (!p) return null;
    // Full URL
    if (/^https?:\/\//i.test(p)) return p;
    // Absolute path on server
    if (p.startsWith('/')) return `${API_URL}${p}`;
    // Remove any leading slashes just in case
    const cleaned = p.replace(/^\/+/, '');
    // If the cleaned path already contains uploads or assets/uploads, don't add another /uploads prefix
    if (cleaned.startsWith('uploads/') || cleaned.startsWith('assets/uploads/') || cleaned.includes('assets/uploads')) {
      return `${API_URL}/${cleaned}`;
    }
    // Default: assume it's a filename stored in uploads
    return `${API_URL}/uploads/${cleaned}`;
  };

  // Avatar component: tries a normal <img>, and if that fails (likely due to protected route / auth),
  // fetches the image via axios withCredentials and uses a blob URL so cookies are included.
  const UserAvatar = ({ photo, alt, size = 48 }) => {
    const [src, setSrc] = useState(getPhotoUrl(photo) || '/assets/default-avatar.png');
    const [blobUrl, setBlobUrl] = useState(null);

    useEffect(() => {
      const resolved = getPhotoUrl(photo) || '/assets/default-avatar.png';
      setSrc(resolved);
      return () => {
        if (blobUrl) URL.revokeObjectURL(blobUrl);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [photo]);

    const fetchWithCredentials = async () => {
      const url = getPhotoUrl(photo);
      if (!url) return;
      try {
        const res = await axios.get(url, { withCredentials: true, responseType: 'blob' });
        const objectUrl = URL.createObjectURL(res.data);
        setBlobUrl(objectUrl);
        setSrc(objectUrl);
      } catch (e) {
        console.warn('UserAvatar: axios fetch failed for', url, e?.message || e);
        setSrc('/assets/default-avatar.png');
      }
    };

    return (
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
        onError={(e) => {
          // if native load fails, try fetching with credentials once
          e.currentTarget.onerror = null;
          if (src && !src.includes('default-avatar')) {
            fetchWithCredentials();
          } else {
            e.currentTarget.src = '/assets/default-avatar.png';
          }
        }}
      />
    );
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/getAll`, {
          withCredentials: true,
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        setErrorMsg(error.response?.data?.message || "Failed to load users");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleViewClick = async (userId) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/getById/${userId}`, {
        withCredentials: true,
      });
      setSelectedUser(res.data);
      setShowModal(true);
    } catch (err) {
      console.error("Error fetching user details:", err);
      setErrorMsg("Failed to load user details");
    }
  };

  const handleEditClick = (userId) => {
    navigate(`/editUser/${userId}`);
  };

  const handleDeleteClick = (userId, username) => {
    setConfirmDelete({ id: userId, name: username });
  };

  const confirmDeleteUser = async () => {
    if (!confirmDelete) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/users/delete/${confirmDelete.id}`, {
        withCredentials: true,
      });
      
      setUsers(users.filter(user => user.id !== confirmDelete.id));
      setConfirmDelete(null);
      
    } catch (err) {
      console.error("Error deleting user:", err);
      setErrorMsg("Failed to delete user: " + (err.response?.data?.message || err.message));
    }
  };

  // Cancel delete action
  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="error-container">
        <div className="alert alert-danger">{errorMsg}</div>
      </div>
    );
  }

  return (
    <div className="user-list-container">
     

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="thead-light">
                <tr>
                  <th>User</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Role</th>
                  <th>Password Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="user-row">
                      <td>
                        <div className="user-info">
                          <UserAvatar photo={user.photo} alt={user.username} size={48} />
                          <div className="user-details">
                            <h6 className="username">{user.username}</h6>
                            <p className="email">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${user.isActive ? "active" : "inactive"}`}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <span className="last-login">
                          {user.derConnx ? new Date(user.derConnx).toLocaleString() : "Never"}
                        </span>
                      </td>
                      <td>
                        <span className={`role-badge ${(user.roleUtilisateur || '').toLowerCase()}`}>
                          {user.roleUtilisateur}
                        </span>
                      </td>
                      <td>
                        <span className={`password-status ${user.mustUpdatePassword ? "outdated" : "updated"}`}>
                          {user.mustUpdatePassword ? "Needs Update" : "Up to Date"}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            onClick={() => handleViewClick(user.id)}
                            className="btn btn-sm btn-info action-btn"
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            onClick={() => handleEditClick(user.id)}
                            className="btn btn-sm btn-warning action-btn"
                            title="Edit User"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(user.id, user.username)}
                            className="btn btn-sm btn-danger action-btn"
                            title="Delete User"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <UserDetails user={selectedUser} />
            <button onClick={closeModal} className="close-modal-btn">
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal-content confirmation-modal">
            <h5>Confirm Deletion</h5>
            <p>Are you sure you want to delete user <strong>{confirmDelete.name}</strong>?</p>
            <p>This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                onClick={confirmDeleteUser} 
                className="btn btn-danger"
              >
                Confirm Delete
              </button>
              <button 
                onClick={cancelDelete} 
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;