import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';


// Validation avec Yup
const schema = yup.object({
  email: yup.string().required("Email requis").email("Format invalide"),
  password: yup.string().required("Mot de passe requis"),
}).required();

const signIn = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/users/login`, {
        email: data.email,
        mdp: data.password,
      }, {
        withCredentials: true,
      });

      if (response.status === 200) {
        const { username, roleUtilisateur, mustUpdatePassword } = response.data;

        toast.success("Connexion réussie", { position: 'top-center' });

        if (mustUpdatePassword) {
          navigate('/change-password');
          return;
        }
        navigate('/ResetPassword');
      }
    } catch (error) {
      console.error('Erreur login:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message, { position: 'top-center' });
      } else {
        toast.error("Erreur serveur ou réseau.", { position: 'top-center' });
      }
    }
    reset();
  };

  const currentEmail = watch("email");

  return (
    <div className="login-container">
     <img src="assets/img/logo/Image2.png" alt="Logo" width="120" />
      <h2 className="title">Teamwill</h2>
      <h3 className="subtitle">CONNEXION</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="input-group">
          <FaUser className="icon" />
          <input type="text" placeholder="Email" {...register("email")} />
        </div>
        {errors.email && <p className="form_error">{errors.email.message}</p>}
        <div className="input-group">
          {passwordVisible ? (
            <FaEyeSlash className="icon" onClick={togglePasswordVisibility} style={{ cursor: 'pointer' }} />
          ) : (
            <FaEye className="icon" onClick={togglePasswordVisibility} style={{ cursor: 'pointer' }} />
          )}
          <input type={passwordVisible ? 'text' : 'password'} placeholder="Mot de passe" {...register("password")} />
        </div>
        {errors.password && <p className="form_error">{errors.password.message}</p>}
        <button type="submit" className="submit-btn">Valider</button>
      </form>

      <span
        className="forgot-password"
        style={{ opacity: 1, cursor: 'pointer', color: '#007BFF' }}
        onClick={() => navigate('/forgot-password', { state: { email: currentEmail } })}
      >  Mot de passe oublié ?
      </span>
    </div>
  );
};

export default signIn;
