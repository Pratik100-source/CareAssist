import "./footer.css"

import bottom_logo from "../images/logo.png";
const Footer = () => {
  const year = new Date().getFullYear();
return(
    <>
    
    <div className="footer_main">

      <div className="footer_submain">

      <section className="section_about">
      <img className="logo" src={bottom_logo} alt="Logo"/>
      <p>CareAssist connects you with trusted medical professionals, 
        bringing personalized healthcare to your doorstep.</p>
      </section>
      <section className="section_services">

        <p className="heading">Services</p>
          <ul>
            
          <li>Online Consultation</li>
          <li>Home Booking</li>

          </ul>
      </section>
      <section className="section_quick_links">
       
       <p className="heading">Quick links</p>
       <ul>
       <li><a href="/showhomedoctors">Find Professionals</a></li>
       <li><a href="/showdoctors">Video Counselling</a></li>
       
       </ul>
      </section>
      
      <section className="contact_us">
        <p className="heading">Get in touch</p>
        <ul>
       <li>Sorakhutte, kathmandu</li>
       <li>9866969746</li>
       <li>01-4544400</li>
       <li>panthipratik100@gmail.com</li>
       </ul>
      </section>



      </div>

      <div className="footer_copyright_section">

        <p>© Copyright {year} CareAssist | All Rights Reserved. Handcrafted By Pratik Panthi</p>
        
      </div>

    </div>
    </>

)
    
}

export default Footer;