import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import axios from 'axios'; 
const schema = yup
   .object({
      email: yup.string().required("Email is required").email("Invalid email format"),
      password: yup.string().required("Password is required"),
   })
   .required();

const LoginForm = () => {
   const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
   } = useForm({ resolver: yupResolver(schema) });

   const navigate = useNavigate();

   const onSubmit = async (data) => {
      try {
         const response = await axios.post('http://localhost:3000/users/login', {
            email: data.email,
            mdp: data.password,
         }, { withCredentials: true });
   
         localStorage.setItem('username', response.data.username); 
         localStorage.setItem('roleUtilisateur', response.data.roleUtilisateur);

         if (response.status === 200) {
            const { mustUpdatePassword } = response.data;
   
            toast.success('Login successful', { position: 'top-center' });
   
            if (mustUpdatePassword) {
               navigate('/change-password');
               return;
            }
   
            // ✅ Redirect to welcome page first, then it will auto-navigate to dashboard
            navigate('/welcome');
         }
   
      } catch (error) {
         console.error('Login error:', error);
         toast.error('Login failed. Please check your credentials.', { position: 'top-center' });
      }
    }
   
  return (
    <div className="login-wrapper">
      <div className="login-container">
        <img src="assets/img/logo/Logoo.png" alt="Logo" className="logo" />
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

        <span className="forgot-password" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
          Mot de passe oublié
        </span>
      </div>
    </div>
  );
};

export default LoginForm;
