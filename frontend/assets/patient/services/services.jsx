import "./services.css";
import { GoSearch } from "react-icons/go";
import { IoMdLaptop } from "react-icons/io";
import { FaHome } from "react-icons/fa";
import { FaMap } from "react-icons/fa";

const Guide = () => {
  return (
    <div className="services_main">
      <div className="services_first">
        <p className="services_heading">Our Services</p>
        <p className="services_sub_heading">
          CareAssist provides a variety of services for those who are in need of
          easy health access.
        </p>
      </div>
      <div className="services_second"> 

      <div className="first">
          <div className="visuals">
            <div className="icon">
              <GoSearch />
            </div>
            <span className="icon_heading">Search Professionals</span>
          </div>
          <div className="written_instructions">
            <p>Choose your medical professionals from thousand of registered ones</p>
          </div>
        </div>

        <div className="second">

        <div className="visuals">
            <div className="icon">
              <IoMdLaptop />
            </div>
            <span className="icon_heading">Online Consultation</span>
          </div>
          <div className="written_instructions">
            <p>Get access to Online Consultation at anytime anywhere</p>
          </div>
        </div>

        <div className="third">
        <div className="visuals">
            <div className="icon">
              <FaHome />
            </div>
            <span className="icon_heading">Home Visit</span>
          </div>
          <div className="written_instructions">
            <p>You can book a home appointment of medical professionals</p>
          </div>
        </div>

        <div className="fourth">
        <div className="visuals">
            <div className="icon">
              <FaMap />
            </div>
            <span className="icon_heading">Tracking</span>
          </div>
          <div className="written_instructions">
            <p>Real time tracking of medical professionals you booked</p>
          </div>
        </div>


      </div>


    
    </div>
  );
};

export default Guide;
