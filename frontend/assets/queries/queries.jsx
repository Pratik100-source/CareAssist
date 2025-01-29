import "./queries.css"
import { FaPlus } from "react-icons/fa";

const Queries = () =>{

return(

    <div className="queries_main">
          
          <div className="queries_heading">
             <p>Frequently asked questions</p>
          </div>
          <div className="queries_content">
             
             <div className="one">

              <section className="icons">
              <FaPlus/>
              </section>
              
              <section className="qna">
              <section className="question"><p>What is CareAssit</p> </section>
              <section className="answer">
                    <p>CareAssit is a web based application that allows user to book a home/online consultation at anytime anywhere. </p>
                     </section>
              </section>

             </div>

             <div className="two">

             <section className="icons">
              <FaPlus/>
              </section>
              
              <section className="qna">
              <section className="question"><p>Where is CareAssist</p> </section>
              <section className="answer">
                    <p>CareAssit is not located anywhere, careassist is a platform that builds a gap between patients and medical professionals</p>
                     </section>
              </section>

             </div>
             <div className="three">

             <section className="icons">
              <FaPlus/>
              </section>
              
              <section className="qna">
              <section className="question"><p>What is CareAssit</p> </section>
              <section className="answer">
                    <p>CareAssit is a web based application that allows user to book a home/online consultation at anytime anywhere. </p>
                     </section>
              </section>

             </div>
             <div className="four">
             <section className="icons">
              <FaPlus/>
              </section>
              
              <section className="qna">
              <section className="question"><p>What is CareAssit</p> </section>
              <section className="answer">
                    <p>CareAssit is a web based application that allows user to book a home/online consultation at anytime anywhere. </p>
                     </section>
              </section>
             </div>
          </div>

    </div>
)
}

export default Queries;