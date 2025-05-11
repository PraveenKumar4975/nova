import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./ResumeUpload.css"

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  //const [parsedData, setParsedData] = useState(null);
  //const [previewURL, setPreviewURL] = useState(null);
  //const [deployedURL, setDeployedURL] = useState(null);
  // const [loading, setLoading] = useState(false);
  //const [customPrompt, setCustomPrompt] = useState("");

  const [loading, setLoading] = useState(false)
  const [parsedData, setParsedData] = useState(null)
  const [previewURL, setPreviewURL] = useState("")
  const [customPrompt, setCustomPrompt] = useState("")
  const [deployedURL, setDeployedURL] = useState("")
  const [fileName, setFileName] = useState("")
  const [activeStep, setActiveStep] = useState(1)
  const [animatePreview, setAnimatePreview] = useState(false)

  const previewRef = useRef(null)

  useEffect(() => {
    if (previewURL && previewRef.current) {
      setTimeout(() => {
        setAnimatePreview(true)
      }, 100)
    }
  }, [previewURL])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
  if (selectedFile) {
    console.log("Selected file:", selectedFile.name);
    setFileName(selectedFile.name);
    setFile(selectedFile);
  }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a PDF file.");
  
    const formData = new FormData();
    formData.append("resume", file);
  
    const token = localStorage.getItem("token"); // Retrieve the JWT token from localStorage
  
    if (!token) {
      alert("You are not logged in. Please log in first.");
      return;
    }
  
    try {
      setLoading(true);
      const res = await axios.post(
        "https://nova-rioy.onrender.com/upload-resume", 
        formData, 
        {
          headers: {
            "Authorization": `Bearer ${token}`, // Add the token to the Authorization header
          },
        }
      );
      setParsedData(res.data.parsedData);
      setPreviewURL(null);
      setDeployedURL(null);
    } catch (err) {
      console.error("Error uploading resume:", err);
      alert("Resume upload failed.");
    } finally {
      setLoading(false);
    }
  };
  

  const generatePortfolio = async () => {
    setLoading(true);
    try {
      await axios.post("https://nova-rioy.onrender.com/generate-portfolio");
      setPreviewURL("https://nova-rioy.onrender.com/preview-portfolio?" + Date.now());
    } catch (err) {
      alert("Portfolio generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const applyCustomization = async () => {
    if (!customPrompt.trim()) return;
    setLoading(true);
    try {
      await axios.post("https://nova-rioy.onrender.com/customize-portfolio", {
        userPrompt: customPrompt,
      });
      setPreviewURL("https://nova-rioy.onrender.com/preview-portfolio?" + Date.now());
    } catch (err) {
      alert("Customization failed.");
    } finally {
      setLoading(false);
    }
  };

  const deployPortfolio = async () => {
    setLoading(true);
    try {
      const res = await axios.post("https://nova-rioy.onrender.com/deploy-portfolio");
      setDeployedURL(res.data.deployedUrl);
    } catch (err) {
      alert("Deployment failed.");
    } finally {
      setLoading(false);
    }
  };
  //mail
  const sendEmail = async () => {
    try {
      await axios.post("https://nova-rioy.onrender.com/send-email", {
        to: parsedData?.parsed?.contact?.email,
        deployedURL: deployedURL,
      });
      alert("Email sent successfully!");
    } catch (err) {
      alert("Failed to send email.");
    }
  };

  return (
    <section className="portfolio-generator">
      <div className="generator-container">
        <div className="section-header">
          <h2>
            Resume to <span className="highlight">Portfolio</span> Generator
          </h2>
          <p>Upload your resume and let our AI transform it into a stunning portfolio website</p>
        </div>

        <div className="generator-content">
          {/* Resume Upload */}
          <div className="upload-section section-titles">
            <div className="section-title display-flex">
              <div className="icon-wrapper">
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
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h3>Upload Resume</h3>
            </div>

            <div className="upload-controls">
              <div className="file-input-wrapper">
                
                <div>
                  <label htmlFor="resume-file choosepdf">Choose PDF File</label>
                <input type="file" onChange={handleFileChange} accept="application/pdf" id="resume-file" />
                </div>
                <div>
                {fileName && (
                  <p style={{ marginTop: "20px", color: "#333" }}>
                    Selected file: <strong>{fileName}</strong>
                  </p>
                )}</div>              
              </div>
              <button
                onClick={handleUpload}
                disabled={loading}
                className={`upload-btn btn btn-primary btn-large ${loading ? "loading" : ""}`}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Uploading...
                  </>
                ) : (
                  "Upload Resume"
                )}
              </button>
            </div>
          </div>


          {/* Parsed and Actions */}
          {parsedData && (
            <div className="action-section">
              <div className="section-title">
                <div className="icon-wrapper">
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
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </div>
                <h3>Generate Portfolio</h3>
              </div>
              <button
                onClick={generatePortfolio}
                className={`btn ${loading ? "btn-loading" : "btn-accent"}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Generating...
                  </>
                ) : (
                  "Generate Portfolio"
                )}
              </button>
              <div className="contact-info">
                {parsedData?.parsed?.contact?.email && (
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{parsedData.parsed.contact.email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preview + Customize */}
          {previewURL && (
            <>
              <div className="customize-section">
                <div className="section-title">
                  <div className="icon-wrapper">
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
                      <circle cx="12" cy="12" r="10"></circle>
                      <circle cx="12" cy="12" r="4"></circle>
                      <line x1="21.17" y1="8" x2="12" y2="8"></line>
                      <line x1="3.95" y1="6.06" x2="8.54" y2="14"></line>
                      <line x1="10.88" y1="21.94" x2="15.46" y2="14"></line>
                    </svg>
                  </div>
                  <h3>Customize Portfolio</h3>
                </div>
                <div className="customize-controls">
                  <textarea
                    rows="3"
                    className="customize-input"
                    placeholder="e.g. Change font to Inter and background to blue"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                  ></textarea>
                  <button
                    onClick={applyCustomization}
                    disabled={loading}
                    className={`btn ${loading ? "btn-loading" : "btn-secondary"}`}
                  >
                    {loading ? (
                      <>
                        <span className="loading-spinner"></span>
                        Applying...
                      </>
                    ) : (
                      "Apply Customization"
                    )}
                  </button>
                </div>
              </div>

              <div className="preview-section">
                <div className="section-title">
                  <div className="icon-wrapper">
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
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </div>
                  <h3>Live Portfolio Preview</h3>
                </div>
                <div className="preview-frame">
                  <iframe src={previewURL} width="100%" height="600" title="Portfolio Preview"></iframe>
                </div>
                <div className="deploy-controls">
                  <button
                    onClick={deployPortfolio}
                    className={`btn ${loading ? "btn-loading" : "btn-primary"} btn-large`}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="loading-spinner"></span>
                        Deploying...
                      </>
                    ) : (
                      <>
                        Deploy to Netlify
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
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Final deployed URL */}
          {deployedURL && (
            <div className="deployed-section">
              <div className="section-title">
                <div className="icon-wrapper">
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
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <h3>Deployed Portfolio</h3>
              </div>
              <div className="deployed-info">
                <a href={deployedURL} target="_blank" rel="noopener noreferrer" className="deployed-link">
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
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  View Live Portfolio
                </a>
                <span className="deployed-url">{deployedURL}</span>
              </div>
              {parsedData?.parsed?.contact?.phone && (
                <div className="share-controls">
                  <button onClick={sendEmail} className="btn btn-secondary">
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
                    Send to Email
                  </button>
                  {/* <button onClick={sendEmail} className="btn btn-whatsapp">
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
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                    Share via WhatsApp
                  </button> */}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ResumeUpload;