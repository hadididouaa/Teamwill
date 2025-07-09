import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const InstructorSettingPassword = () => {

   const [currentPassword, setCurrentPassword] = useState('');
   const [newPassword, setNewPassword] = useState('');
   const [rePassword, setRePassword] = useState('');
   const [message, setMessage] = useState('');
   const navigate = useNavigate();

   const handleSubmit = async (e) => {
      e.preventDefault();

      if (newPassword !== rePassword) {
         setMessage("chaeck your new password, it doesn't match.");
         return;
      }

      try {
         const response = await fetch(`${import.meta.env.VITE_API_URL}/users/change-password`, {
            method: 'POST',
            headers: {               
               'Content-Type': 'application/json',
            },
            credentials: 'include', 
            body: JSON.stringify({
               currentPassword,
               newPassword
            })
         });

         const data = await response.json();

         if (response.ok) {
            setMessage("Mot de passe mis à jour avec succès !");
            setCurrentPassword('');
            setNewPassword('');
            setRePassword('');
            
            // Logout the user after password change
            await fetch('http://localhost:4000/users/logout', {
               method: 'POST',
               credentials: 'include'
            });
            
            navigate('/login');

         } else {
            setMessage(data.message || "Erreur lors de la mise à jour.");
         }
      } catch (error) {
         setMessage("Erreur serveur.");
      }
   };

   return (
      <div className="instructor__profile-form-wrap">
         <form onSubmit={handleSubmit}  className="instructor__profile-form">
            <div className="form-grp">
               <label htmlFor="currentpassword">Current Password</label>
               <input id="currentpassword" type="password" placeholder="Current Password" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="form-grp">
               <label htmlFor="newpassword">New Password</label>
               <input id="newpassword" type="password" placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="form-grp">
               <label htmlFor="repassword">Re-Type New Password</label>
               <input id="repassword" type="password" placeholder="Re-Type New Password"
                  value={rePassword}
                  onChange={(e) => setRePassword(e.target.value)} />
            </div>
            {message && (
               <p style={{ color: message.includes("succès") ? "green" : "red" }}>{message}</p>
            )}
            <div className="submit-btn mt-25">
               <button type="submit" className="btn">Update Password</button>
            </div>
         </form>
      </div>
   )
}

export default InstructorSettingPassword
