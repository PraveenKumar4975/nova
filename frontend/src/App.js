import { Routes, Route } from "react-router-dom"
import "./App.css"
import Header from "./components/Header"
import Footer from "./components/Footer"
import HomePage from "./components/HomePage"

function App() {
  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
