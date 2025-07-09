
const UserDetails = ({ user }) => {
   if (!user) return null;

   return (
      <div className="col-lg-12">
        <div className="dashboard__content-wrap">
          <div className="dashboard__content-title">
            <h4 className="title">User Profile</h4>
          </div>
          <div className="row">
            <div className="col-lg-12">
              <div className="profile__content-wrap">
                <ul className="list-wrap">
                  <li><span>Photo:</span> 
                  <img src={user.photo ? `${import.meta.env.VITE_API_URL}${user.photo}` : '/assets/default-avatar.png'}  alt="User" style={{ width: '80px', borderRadius: '50%' }} />
                    </li>
                  <li><span>Username:</span> {user.username}</li>
                  <li><span>Email:</span> {user.email}</li>
                  <li><span>Phone Number:</span> {user.tel || "not registered"}</li>
                  <li><span>Role:</span> {user.roleUtilisateur}</li>
                  <li><span>Active:</span> {user.isActive ? "Yes" : "No"}</li>
                  <li><span>Must Update Password:</span> {user.mustUpdatePassword ? "Yes" : "No"}</li>
                  <li><span>Last Login:</span> {user.derConnx ? new Date(user.derConnx).toLocaleString() : "Never"}</li>
                  <li><span>Registered At:</span> {user.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A"}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
   );
}

export default UserDetails
