import { Navigate } from "react-router-dom";
import Logo from "../images/logo.png"
import "./topbar.css"


const Topbar = ()=>{

return(
    <>
    
    <div className="top_main">
        <div className="top_submain">
              
        <img className="logo" src={Logo}/>
        <nav className="top_nav">

            <ul className="inside_navigator">
                <li>Find Professionals</li>
                <li>Video Counselling</li>
                <li>How it Works?</li>

            </ul>
            <ul className="outside_navigator">
                
                <li onClick={Navigate("/login")}>Login</li>
                <li onClick={Navigate("/signup")}>Signup</li>

            </ul>
        </nav>
        

        </div>
    



    </div>
    </>
)

}

export default Topbar;