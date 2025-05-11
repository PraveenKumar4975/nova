"use client"

import { useEffect, useRef } from "react"
import { Link } from 'react-router-dom';
import "./Hero.css"

const Hero = () => {
  const titleRef = useRef(null)
  const descriptionRef = useRef(null)
  const ctaRef = useRef(null)
  const imageRef = useRef(null)

  useEffect(() => {
    const title = titleRef.current
    const description = descriptionRef.current
    const cta = ctaRef.current
    const image = imageRef.current

    title.classList.add("animate-in")

    setTimeout(() => {
      description.classList.add("animate-in")
    }, 300)

    setTimeout(() => {
      cta.classList.add("animate-in")
    }, 600)

    setTimeout(() => {
      image.classList.add("animate-in")
    }, 900)
  }, [])

  return (
    <section id="home" className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <h1 ref={titleRef} className="hero-title">
            Generate <span className="highlight">Professional Portfolios</span> with the Power of AI
          </h1>
          <p ref={descriptionRef} className="hero-description">
            Transform your resume into a stunning portfolio website in minutes. Our AI-powered platform analyzes your
            experience and skills to create a personalized, professional portfolio that showcases your unique talents.
          </p>
          <div ref={ctaRef} className="hero-cta">
            
              <Link to="#upload">
                <button className="btn btn-primary">Create Your Portfolio</button>
              </Link>
              <Link to="www.google.com">
                <button className="btn btn-secondary">See Examples</button>
              </Link>
            

          </div>
        </div>
        <div ref={imageRef} className="hero-image rounded-xl border p-4 shadow-md">
          <div className="image-container rounded-xl border p-4 shadow-md">
            {/* <div className="floating-element code-block "></div> */}
            {/* <div className="floating-element portfolio-card"></div> */}
            <div className="floating-element ai-icon"></div>
            <div className="main-image rounded-xl border p-4 shadow-md" >
              <img src="/hero.jfif" alt="Main visual" className="w-full h-auto rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      </div>
      <div className="hero-shape-divider">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="shape-fill"
          ></path>
        </svg>
      </div>
    </section>
  )
}

export default Hero
