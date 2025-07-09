import Stepper from "../dashboard/instructor-dashboard/instructor-setting/Stepper";
import DashboardLayout from "../layouts/DashboardLayout";
import { useParams  } from "react-router-dom";


const AddFormation = () => {
     
      const { id } = useParams(); 

   return (
      <DashboardLayout pageTitle={id ? "Modifier formation" : "Ajouter formation"}>
         <Stepper formationId={id} style={true} />
      </DashboardLayout>

   );
};

export default AddFormation;