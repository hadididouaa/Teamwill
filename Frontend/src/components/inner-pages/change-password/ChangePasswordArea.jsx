// // ../components/inner-pages/login/LoginArea.jsx
import InstructorSettingPassword from "../../../dashboard/instructor-dashboard/instructor-setting/InstructorSettingPassword"

const ChangePasswordArea = () => {
   return (
      <section className="singUp-area section-py-120">
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-xl-6 col-lg-8">
                  <div className="singUp-wrap">
                     <h2 className="title">Welcome</h2>
                        <InstructorSettingPassword />
                     <div className="account__switch">
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default ChangePasswordArea
