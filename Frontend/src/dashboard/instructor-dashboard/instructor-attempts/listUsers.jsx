import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import UserDetails from "../profile/UserDetails";


const listUsers = () => {
   const [users, setUsers] = useState([]);
   const [errorMsg, setErrorMsg] = useState("");
   const [selectedUser, setSelectedUser] = useState(null); // stores clicked user
   const [showModal, setShowModal] = useState(false); // toggle modal
   const [confirmDelete, setConfirmDelete] = useState(null); // pour stocker l'ID de l'utilisateur à supprimer
   const navigate = useNavigate(); 

 
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
 
   const handleViewClick = async (userId) => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/getById/${userId}`, {
          withCredentials: true,
        });
        setSelectedUser(res.data);
        setShowModal(true);
      } catch (err) {
        console.error("Erreur lors de la récupération de l'utilisateur", err);
        setErrorMsg("Erreur ou accès refusé");
      }
    };

    const handleEditClick = async (userId) => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/getById/${userId}`, {
          withCredentials: true,
        });
    
        // Navigate to editUser page with userId in the URL
        navigate(`/editUser/${userId}`, { state: { user: res.data } });
      } catch (err) {
        console.error("Erreur lors de la récupération de l'utilisateur", err);
        setErrorMsg("Erreur ou accès refusé");
      }
    };

   // Définition de la fonction handleDeleteClick
   const handleDeleteClick = (userId, username) => {
     // Afficher la confirmation de suppression
     setConfirmDelete({ id: userId, name: username });
   };

   // Fonction pour confirmer la suppression
   const confirmDeleteUser = async () => {
     if (!confirmDelete) return;

     try {
       await axios.delete(`${import.meta.env.VITE_API_URL}/users/delete/${confirmDelete.id}`, {
         withCredentials: true,
       });
       
       // Mettre à jour la liste en retirant l'utilisateur supprimé
       setUsers(users.filter(user => user.id !== confirmDelete.id));
       
       // Réinitialiser l'état de confirmation
       setConfirmDelete(null);
       
     } catch (err) {
       console.error("Erreur lors de la suppression de l'utilisateur", err);
       setErrorMsg("Erreur lors de la suppression: " + (err.response?.data?.message || err.message));
     }
   };

   // Annuler la suppression
   const cancelDelete = () => {
     setConfirmDelete(null);
   };

   const closeModal = () => {
      setShowModal(false);
      setSelectedUser(null);
    };
    
   if (errorMsg) {
     return <p style={{ color: "red" }}>{errorMsg}</p>;
   }
 
   return (
      <div className="col-lg-9">
        <div className="dashboard__content-wrap">
          <div className="dashboard__content-title">
            <h4 className="title">Listes des utilisateurs</h4>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="dashboard__review-table">
                <table className="table table-borderless">
                  <thead>
                    <tr>
                    <th>Utilisateur</th> {/* username, email, photo */}
                    <th>Active</th> 
                    <th>Dérnière connexion</th> 
                    <th>Rôle</th> 
                    <th>password à jour</th> 
                    <th>&nbsp;</th>
                    </tr>
                  </thead>
                  <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="dashboard__quiz-info d-flex align-items-center gap-3">
                          {user.photo && (
                            <img
                            src={`${import.meta.env.VITE_API_URL}${user.photo}`} alt={user.username}
                            style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
                          />                          
                          )}
                          <div>
                            <h6 className="title mb-0">{user.username}</h6>
                            <p className="mb-0">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`dashboard__quiz-result ${user.isActive ? "" : "fail"}`}>
                          {user.isActive ? "Yes" : "No"}
                        </span>
                      </td>
                      <td>
                        <p className="color-black mb-0">
                          {user.derConnx ? new Date(user.derConnx).toLocaleString() : "Jamais"}
                        </p>
                      </td>
                      <td>
                        <span className="dashboard__quiz-result processing">
                          {user.roleUtilisateur}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`dashboard__quiz-result ${
                           user.mustUpdatePassword ? "fail" : "" }`}>
                           {user.mustUpdatePassword ? "No" : "Yes"}
                           <i className="skillgro-verified"></i>
                        </span>
                      </td>
                      <td>
                        <div className="dashboard__review-action">
                          <Link to='#' onClick={() => handleViewClick(user.id)} title="view">
                            <i className="skillgro-book"></i>
                          </Link> 
                          <Link to='#' onClick={() => handleEditClick(user.id)} title="edit">
                            <i className="skillgro-writing"></i>
                          </Link>      
                          <Link to='#' onClick={() => handleDeleteClick(user.id, user.username)} title="delete">

                           <img 
                              src="/assets/img/icons/trash.svg" 
                              alt="Supprimer" 
                              style={{ width: "20px", height: "20px", cursor: "pointer" }} 
                            />
                          </Link>                      
                        </div>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
             {/* MODAL détails utilisateur */}
             {showModal && selectedUser && (
               <div className="modal-overlay">
                  <div className="modal-content" >
                     <UserDetails user={selectedUser} />
                     <button onClick={closeModal} className="close-btn">×</button>
                  </div>
               </div>
               )}
               
             {/* MODAL confirmation de suppression */}
             {confirmDelete && (
               <div className="modal-overlay">
                  <div className="modal-content confirmation-modal">
                     <h5>Confirmer la suppression</h5>
                     <p>Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{confirmDelete.name}</strong>?</p>
                     <p>Cette action est irréversible.</p>
                     <div className="button-group">
                        <button 
                          onClick={confirmDeleteUser} 
                          className="pill-button">
                          Confirmer
                        </button>
                        <button 
                          onClick={cancelDelete} 
                          className="pill-button">
                          Annuler
                        </button>
                     </div>
                  </div>
               </div>
             )}
          </div>
        </div>
      </div>
    );
    
}

export default listUsers;