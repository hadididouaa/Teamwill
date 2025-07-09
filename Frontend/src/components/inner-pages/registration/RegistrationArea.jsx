import RegistrationForm from "../../../forms/RegistrationForm"

const RegistrationArea = () => {
   return (
      <section className="singUp-area section-py-120">
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-xl-6 col-lg-8">
                  <div className="singUp-wrap">
                     <h2 className="title">ajouter un nouveau utilisateur</h2>
                     <RegistrationForm />
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default RegistrationArea
