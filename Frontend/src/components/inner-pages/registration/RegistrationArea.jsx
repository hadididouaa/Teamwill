import RegistrationForm from "../../../forms/RegistrationForm"

const RegistrationArea = () => {
   return (
     
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-xl-6 col-lg-8">
                  <div className="singUp-wrap">
                     <h2 className="title">Add new user</h2>
                     <RegistrationForm />
                  </div>
               </div>
            </div>
         </div>
      
   )
}

export default RegistrationArea
