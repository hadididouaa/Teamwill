import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserSettingPassword = ({ userId }) => {
   const [currentPassword, setCurrentPassword] = useState('');
   const [newPassword, setNewPassword] = useState('');
   const [rePassword, setRePassword] = useState('');
   const [message, setMessage] = useState('');
   const navigate = useNavigate();

   const handleSubmit = async (e) => {
      e.preventDefault();

      if (newPassword !== rePassword) {
         setMessage("Vérifiez votre nouveau mot de passe, il ne correspond pas.");
         return;
      }

      try {
         const response = await fetch(`${import.meta.env.VITE_API_URL}/users/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ currentPassword, newPassword })
         });

         const data = await response.json();

         if (response.ok) {
            setMessage("Mot de passe mis à jour avec succès !");
            setCurrentPassword('');
            setNewPassword('');
            setRePassword('');
            // Déconnexion après mise à jour du mot de passe
            await fetch(`${import.meta.env.VITE_API_URL}/users/logout`, {
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
      <div className="instructor__profile-form-wrap mt-4">
         <form onSubmit={handleSubmit} className="instructor__profile-form">
            <div className="form-grp">
               <label htmlFor="currentpassword">Mot de passe actuel</label>
               <input
                  id="currentpassword"
                  type="password"
                  placeholder="Mot de passe actuel"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
               />
            </div>
            <div className="form-grp">
               <label htmlFor="newpassword">Nouveau mot de passe</label>
               <input
                  id="newpassword"
                  type="password"
                  placeholder="Nouveau mot de passe"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
               />
            </div>
            <div className="form-grp">
               <label htmlFor="repassword">Répéter le nouveau mot de passe</label>
               <input
                  id="repassword"
                  type="password"
                  placeholder="Répéter le nouveau mot de passe"
                  value={rePassword}
                  onChange={(e) => setRePassword(e.target.value)}
               />
            </div>
            {message && (
               <p style={{ color: message.includes("succès") ? "green" : "red" }}>{message}</p>
            )}
            <div className="mt-4 text-end">
               <button type="submit" className="pill-button">
                  Mettre à jour le mot de passe
               </button>
            </div>
         </form>
      </div>
   );
};

export default UserSettingPassword;
