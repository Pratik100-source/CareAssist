import { useSelector } from "react-redux";
import "./PersonalInfo.css";

const PersonalInfo = () => {
  const user = useSelector((state) => state.user); // Access the 'user' state slice
  console.log("Redux User State:", user); // Debugging purpose

  const birthdate = user.birthdate;
  let modified_birthdate;
  if (birthdate) {
    modified_birthdate = birthdate.split("T")[0];
  }

  return (
    <div className="personal_info_container">
      <h2 className="section_header">Personal Information</h2>
      <div className="user_name">
        <span className="label">Name:</span>{" "}
        {user.firstname ? `${user.firstname} ${user.lastname}` : "Not Available"}
      </div>
      <div className="user_number">
        <span className="label">Phone:</span> {user.number || "Not Available"}
      </div>
      <div className="user_gender">
        <span className="label">Gender:</span> {user.gender || "Not Available"}
      </div>
      <div className="user_birthdate">
        <span className="label">Birthdate:</span>{" "}
        {modified_birthdate || "Not Available"}
      </div>
    </div>
  );
};

export default PersonalInfo;