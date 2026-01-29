const UserDetails = ({ user }) => {
  if (!user) return null;

  const infoStyle = {
    background: "#f9fafb",
    padding: "14px 16px",
    borderRadius: "10px",
    marginBottom: "16px",
  };

  const labelStyle = {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "4px",
    display: "block",
  };

  const valueStyle = {
    fontSize: "15px",
    fontWeight: "500",
    color: "#111827",
  };

  return (
    <div className="col-lg-12">
      <div className="dashboard__content-wrap">

        {/* Header */}
        <div
          className="dashboard__content-title"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <img
            src={
              user.photo
                ? `${import.meta.env.VITE_API_URL}${user.photo}`
                : "/assets/default-avatar.png"
            }
            alt="User"
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #e5e7eb",
            }}
          />

          <div>
            <h4 className="title" style={{ marginBottom: "6px" }}>
              {user.username}
            </h4>
            <span className="badge bg-primary">{user.roleUtilisateur}</span>
          </div>
        </div>

        {/* Content */}
        <div className="row">

          <div className="col-md-6">
            <div style={infoStyle}>
              <span style={labelStyle}>Email</span>
              <span style={valueStyle}>{user.email}</span>
            </div>
          </div>

          <div className="col-md-6">
            <div style={infoStyle}>
              <span style={labelStyle}>Phone Number</span>
              <span style={valueStyle}>{user.tel || "Not registered"}</span>
            </div>
          </div>

          <div className="col-md-6">
            <div style={infoStyle}>
              <span style={labelStyle}>Account Status</span>
              <span
                className={`badge ${
                  user.isActive ? "bg-success" : "bg-danger"
                }`}
              >
                {user.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <div className="col-md-6">
            <div style={infoStyle}>
              <span style={labelStyle}>Password Update Required</span>
              <span style={valueStyle}>
                {user.mustUpdatePassword ? "Yes" : "No"}
              </span>
            </div>
          </div>

          <div className="col-md-6">
            <div style={infoStyle}>
              <span style={labelStyle}>Last Login</span>
              <span style={valueStyle}>
                {user.derConnx
                  ? new Date(user.derConnx).toLocaleString()
                  : "Never"}
              </span>
            </div>
          </div>

          <div className="col-md-6">
            <div style={infoStyle}>
              <span style={labelStyle}>Registered At</span>
              <span style={valueStyle}>
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleString()
                  : "N/A"}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserDetails;
