const express = require("express");
const Resume = require("../models/Resume");

const router = express.Router(); // ✅ Define Express Router

router.get("/portfolio/:name", async (req, res) => {
  try {
    const resume = await Resume.findOne({ name: req.params.name });

    if (!resume) {
      return res.status(404).send("Portfolio not found");
    }

    // Generate HTML Portfolio
    const portfolioHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>${resume.name}'s Portfolio</title>
          <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f4; }
              .container { max-width: 800px; margin: 20px auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
              h1 { color: #333; }
              ul { list-style: none; padding: 0; }
              li { background: #007bff; color: white; margin: 5px; padding: 10px; border-radius: 5px; display: inline-block; }
              .experience, .education, .projects, .contact { font-size: 18px; color: #555; }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Welcome to ${resume.name}'s Portfolio</h1>
              <h2>Skills</h2>
              <ul>
                  ${resume.skills.map(skill => `<li>${skill}</li>`).join('')}
              </ul>
              <h2>Experience</h2>
              <p class="experience">${resume.experience}</p>
              <h2>Education</h2>
              <p class="education">${resume.education}</p>
              <h2>Projects</h2>
              <ul>
                  ${resume.projects.map(project => `<li>${project}</li>`).join('')}
              </ul>
              <h2>Contact</h2>
              <p class="contact">${resume.contact}</p>
          </div>
      </body>
      </html>
    `;

    res.send(portfolioHTML);
  } catch (error) {
    console.error("Error generating portfolio:", error);
    res.status(500).send("Error generating portfolio");
  }
});

module.exports = router; // ✅ Export the router
