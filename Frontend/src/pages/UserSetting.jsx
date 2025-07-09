import UserSettingContent from "../dashboard/instructor-dashboard/instructor-setting/UserSettingContent";
import DashboardLayout from "../layouts/DashboardLayout";
import { useParams  } from "react-router-dom";


const UserSetting = () => {
     
      const { id } = useParams(); 

   return (
      <DashboardLayout pageTitle="User update">
            <UserSettingContent userId={id} style={true}  />
      </DashboardLayout>

   );
};

export default UserSetting;