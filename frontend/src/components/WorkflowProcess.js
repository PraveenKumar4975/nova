"use client"

import { useEffect, useRef } from "react"
import "./WorkflowProcess.css"

const WorkflowProcess = () => {
  const sectionRef = useRef(null)
  const stepsRef = useRef([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible")
          }
        })
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    stepsRef.current.forEach((step) => {
      if (step) {
        observer.observe(step)
      }
    })

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
      stepsRef.current.forEach((step) => {
        if (step) {
          observer.unobserve(step)
        }
      })
    }
  }, [])

  // Add to ref array
  const addToRefs = (el) => {
    if (el && !stepsRef.current.includes(el)) {
      stepsRef.current.push(el)
    }
  }

  const steps = [
    {
      title: "Upload Resume",
      description: "Upload your resume or CV to our secure platform",
      icon: "📄",
    },
    {
      title: "AI Analysis",
      description: "Our AI analyzes your skills, experience, and achievements",
      icon: "🧠",
    },
    {
      title: "Portfolio Generation",
      description: "AI generates a personalized portfolio structure",
      icon: "⚙️",
    },
    {
      title: "Customize Design",
      description: "Choose from premium templates and customize colors",
      icon: "🎨",
    },
    {
      title: "Content Review",
      description: "Review and edit the AI-generated content",
      icon: "✏️",
    },
    {
      title: "Publish & Share",
      description: "Publish your portfolio and share it with the world",
      icon: "🚀",
    },
  ]

  return (
    <section id="process" className="workflow-process" ref={sectionRef}>
      <div className="workflow-container">
        <div className="section-header">
          <h2>
            How It <span className="highlight">Works</span>
          </h2>
          <p>Our streamlined process takes you from resume to professional portfolio in 6 simple steps</p>
        </div>

        <div className="workflow-steps">
          {steps.map((step, index) => (
            <div key={index} className={`workflow-step step-${index + 1}`} ref={addToRefs}>
              <div className="step-content">
                <div className="step-icon">{step.icon}</div>
                <div className="step-number">{index + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>

              {index < steps.length - 1 && (
                <div className="step-connector">
                  <svg width="40" height="40" viewBox="0 0 40 40">
                    <path d="M20 0 L40 20 L20 40" fill="none" stroke="var(--accent-color)" strokeWidth="2" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WorkflowProcess
