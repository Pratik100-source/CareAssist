
import { useParams } from "react-router-dom";

const patientProfile = ()=>{
const {userType} = useParams();
console.log(userType);
    return(
 

    
        <p>Welcome to the {userType} dashboard</p>
        



    );

}


export default patientProfile;