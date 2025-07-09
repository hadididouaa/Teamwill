"use client";
import UserSettingProfile from "./UserSettingProfile";
import { useState } from "react";

const UserSettingContent = ({ userId, style }) => {
   const [activeTab, setActiveTab] = useState(0);

   return (
      <div className="col-lg-9">
         <div className="dashboard__content-wrap">
            <div className="dashboard__content-title">
               <h4 className="title">Modifier utilisateur</h4>
            </div>
            <div className="row">
               <div className="col-lg-12">
                  <div className="dashboard__nav-wrap">
                     <ul className="nav nav-tabs" id="myTab" role="tablist">
                        <li className="nav-item" role="presentation">
                           <button className="nav-link active">Profile</button>
                        </li>
                     </ul>
                  </div>
                  <div className="tab-content" id="myTabContent">
                     <div className="tab-pane fade show active" id="itemOne-tab-pane" role="tabpanel" aria-labelledby="itemOne-tab">
                        <UserSettingProfile userId={userId} style={style} />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default UserSettingContent;
