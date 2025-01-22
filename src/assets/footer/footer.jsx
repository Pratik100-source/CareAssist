import "./footer.css"

import bottom_logo from "../images/logo.png";



const Footer = () => {

return(
    <>
    
    <div className="footer_body">
      
      <section className="section_about">
      <img className="logo" src={bottom_logo} alt="Logo" onClick={() => window.location.reload()} />
      <p>CareAssist connects you with trusted medical professionals, 
        bringing personalized healthcare to your doorstep.</p>
      </section>
      <section className="section_services">

        <p className="heading">Services</p>
          <ul>
            
            <li>Online Consultation</li>
            <li> Home Appointment Booking</li>

          </ul>
      </section>
      <section className="section_quick_links">
       
       <p className="heading">Quick links</p>
       <ul>
       <li><a href="">Find Professionals</a></li>
       <li><a href="">Video Counselling</a></li>
       <li><a href="">How it works</a></li>
       <li><a href="#first_body">Login</a></li>
       <li><a href="./signup">Signup</a></li>
       
       
       </ul>
      </section>
      
      <section className="contact_us">
        <p className="heading">Hello i am contact us</p>
      </section>
      
    </div>
    </>

)
    
}

export default Footer;