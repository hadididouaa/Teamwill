import { toast } from 'react-toastify';
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import BtnArrow from '../svg/BtnArrow';

const schema = yup
   .object({
      name: yup.string().required("Name is required"),
      email: yup.string().required("Email is required").email("Invalid email"),
      phone: yup
         .number()
         .transform((value, originalValue) =>
            originalValue === '' ? NaN : value
         )
         .typeError('Phone number is required')
         .required('Phone must be a number'),
      topic: yup.string().required("Topic is required"),
      message: yup.string().required("Message is required"),
   })
   .required();

const InstructorForm = () => {
   const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
   } = useForm({
      resolver: yupResolver(schema),
   });

   const onSubmit = () => {
      toast('Message sent successfully', { position: 'top-center' });
      reset();
   };

   return (
      <form onSubmit={handleSubmit(onSubmit)}>
         <div className="form-grp">
            <input type="text" {...register("name")} placeholder="Name" />
            <p className="form_error">{errors.name?.message}</p>
         </div>
         <div className="form-grp">
            <input type="email" {...register("email")} placeholder="E-mail" />
            <p className="form_error">{errors.email?.message}</p>
         </div>
         <div className="form-grp">
            <input type="text" {...register("topic")} placeholder="Topic" />
            <p className="form_error">{errors.topic?.message}</p>
         </div>
         <div className="form-grp">
            <input type="number" {...register("phone")} placeholder="Phone" />
            <p className="form_error">{errors.phone?.message}</p>
         </div>
         <div className="form-grp">
            <textarea {...register("message")} placeholder="Type Message"></textarea>
            <p className="form_error">{errors.message?.message}</p>
         </div>
         <button type="submit" className="btn arrow-btn">
            Send Message <BtnArrow />
         </button>
      </form>
   );
};

export default InstructorForm;
