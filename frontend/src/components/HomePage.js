// HomePage.jsx
import { useRef, useEffect } from "react"
import Hero from "./Hero"
import WorkflowProcess from "./WorkflowProcess"
import ResumeUpload from "./ResumeUpload"
import Contact from "./Contact"
import { useLocation } from "react-router-dom"

function HomePage() {
  const heroRef = useRef(null)
  const workflowRef = useRef(null)
  const uploadRef = useRef(null)
  const contactRef = useRef(null)

  const location = useLocation()

  // scroll to section when hash changes (like /#upload)
  useEffect(() => {
    const hash = location.hash
    if (hash === "#workflow" && workflowRef.current) {
      workflowRef.current.scrollIntoView({ behavior: "smooth" })
    } else if (hash === "#upload" && uploadRef.current) {
      uploadRef.current.scrollIntoView({ behavior: "smooth" })
    } else if (hash === "#contact" && contactRef.current) {
      contactRef.current.scrollIntoView({ behavior: "smooth" })
    } else if (hash === "#hero" && heroRef.current) {
      heroRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [location])

  return (
    <>
      <section ref={heroRef}><Hero /></section>
      <section ref={workflowRef}><WorkflowProcess /></section>
      <section ref={uploadRef}><ResumeUpload /></section>
      <section ref={contactRef}><Contact /></section>
    </>
  )
}

export default HomePage
