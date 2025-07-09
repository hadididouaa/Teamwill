import FormationForm from "../../../forms/FormationForm"

const FormationArea = ({ closeModal }) => {
   return (
      <section className="singUp-area section-py-120">
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-xl-6 col-lg-8">
                  <div className="singUp-wrap">
                     <h2 className="title">Add a new formation</h2>
                     <FormationForm closeModal={closeModal}/>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default FormationArea
