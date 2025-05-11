"use client"

import { useState, useRef } from "react"
import "./Contact.css"
import emailjs from "@emailjs/browser";

const Contact = () => {
  const formRef = useRef();

  // const [formData, setFormData] = useState({
  //   name: "",
  //   email: "",
  //   subject: "",
  //   message: "",
  // });

  // const [focused, setFocused] = useState({
  //   name: false,
  //   email: false,
  //   subject: false,
  //   message: false,
  // });

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({ ...prev, [name]: value }));
  // };

  // const handleFocus = (e) => {
  //   const { name } = e.target;
  //   setFocused((prev) => ({ ...prev, [name]: true }));
  // };

  // const handleBlur = (e) => {
  //   const { name, value } = e.target;
  //   if (!value) {
  //     setFocused((prev) => ({ ...prev, [name]: false }));
  //   }
  // };

  const handleSubmit = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        "service_tc3gkl3",      // Replace with your EmailJS service ID
        "template_yq378fh",     // Replace with your EmailJS template ID
        formRef.current,
        "j0L2VqTwOpV5CWdBY"  // Replace with your EmailJS public key
      )
      .then(
        (result) => {
          console.log("Message sent:", result.text);
          alert("Message sent successfully!");
        },
        (error) => {
          console.log("Error:", error.text);
          alert("Failed to send message.");
        }
      );

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });

    setFocused({
      name: false,
      email: false,
      subject: false,
      message: false,
    });
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const [focused, setFocused] = useState({
    name: false,
    email: false,
    subject: false,
    message: false,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFocus = (e) => {
    const { name } = e.target
    setFocused((prev) => ({
      ...prev,
      [name]: true,
    }))
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    if (!value) {
      setFocused((prev) => ({
        ...prev,
        [name]: false,
      }))
    }
  }

  // const handleSubmit = (e) => {
  //   e.preventDefault()
  //   // Handle form submission
  //   console.log(formData)
  //   // Reset form
  //   setFormData({
  //     name: "",
  //     email: "",
  //     subject: "",
  //     message: "",
  //   })
  //   setFocused({
  //     name: false,
  //     email: false,
  //     subject: false,
  //     message: false,
  //   })
  //}

  return (
    <>
      <section id="contact" className="contact">
        <div className="contact-container">
          <div className="section-header">
            <h2>
              Get In <span className="highlight">Touch</span>
            </h2>
            <p>Have questions or need assistance? We're here to help!</p>
          </div>

          <div className="contact-content">
            <div className="contact-info">
              <div className="contact-card">
                <div className="contact-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <div className="contact-details">
                  <h3>Call Us</h3>
                  <p>+91 87546 61074</p>
                  <p>Mon-Fri, 9am-5pm EST</p>
                </div>
              </div>

              <div className="contact-card">
                <div className="contact-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div className="contact-details">
                  <h3>Email Us</h3>
                  <p>Novax4975@gmail.com</p>
                  <p>We respond within 24 hours</p>
                </div>
              </div>

              <div className="contact-card">
                <div className="contact-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div className="contact-details">
                  <h3>Visit Us</h3>
                  <p>123 Tech Avenue</p>
                  <p>Miami, Florida</p>
                </div>
              </div>

              <div className="social-links">
                <h3>Connect With Us</h3>
                <div className="social-icons">
                  <a href="#" className="social-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </a>
                  <a href="#" className="social-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                    </svg>
                  </a>
                  <a href="www.linkedin.com/in/praveen-kumar-b-615b5924a" className="social-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect x="2" y="9" width="4" height="12"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  </a>
                  <a href="https://www.instagram.com/praveen.pb.526?igsh=aGI4bWY3b3p1OWxu" className="social-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <form className="contact-form" ref={formRef} onSubmit={handleSubmit}>
              <div className="form-group">
                <div className={`form-field ${focused.name || formData.name ? "focused" : ""}`}>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    required
                  />
                  <label htmlFor="name">Your Name</label>
                  <div className="field-highlight"></div>
                </div>

                <div className={`form-field ${focused.email || formData.email ? "focused" : ""}`}>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    required
                  />
                  <label htmlFor="email">Your Email</label>
                  <div className="field-highlight"></div>
                </div>
              </div>

              <div className={`form-field ${focused.subject || formData.subject ? "focused" : ""}`}>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  required
                />
                <label htmlFor="subject">Subject</label>
                <div className="field-highlight"></div>
              </div>

              <div className={`form-field ${focused.message || formData.message ? "focused" : ""}`}>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  required
                ></textarea>
                <label htmlFor="message">Your Message</label>
                <div className="field-highlight"></div>
              </div>

              <button type="submit" className="btn btn-primary btn-large">
                Send Message
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}


export default Contact
