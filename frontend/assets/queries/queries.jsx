import { useState } from "react";
import "./queries.css";
import { FaPlus } from "react-icons/fa";

const Queries = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "What is CareAssit?",
      answer: "CareAssit is a web based application that allows user to book a home/online consultation at anytime anywhere."
    },
    {
      question: "Where is CareAssist?",
      answer: "CareAssit is not located anywhere, careassist is a platform that builds a gap between patients and medical professionals"
    },
    {
      question: "How do I book an appointment?",
      answer: "You can book appointments through our website by selecting your preferred professional and time slot."
    },
    {
      question: "Is online consultation secure?",
      answer: "Yes, all our online consultations are encrypted and comply with healthcare privacy standards."
    }
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="queries_main">
      <div className="queries_heading">
        <p>Frequently asked questions</p>
      </div>
      <div className="queries_content">
        {faqs.map((faq, index) => (
          <div 
            key={index}
            className={`faq-item ${activeIndex === index ? 'active' : ''}`}
            onClick={() => toggleFAQ(index)}
          >
            <section className="icons">
              <FaPlus className={`plus-icon ${activeIndex === index ? 'rotate' : ''}`} />
            </section>
            
            <section className="qna">
              <section className="question">
                <p>{faq.question}</p>
              </section>
              <section className="answer">
                <p>{faq.answer}</p>
              </section>
            </section>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Queries;