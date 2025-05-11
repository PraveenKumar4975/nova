const express = require("express");
const multer = require("multer");
const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Multer Storage Configuration (Upload Resumes)
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Resume Upload & AI Parsing Route
router.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const filePath = path.join(__dirname, "../uploads", req.file.filename);

    console.log("📂 Processing resume with AI:", filePath);

    // Run Python AI script
    execFile("python", ["resume_parser.py", filePath], (error, stdout, stderr) => {
      if (error) {
        console.error("❌ Error running Python script:", error);
        return res.status(500).json({ success: false, message: "Error processing resume" });
      }

      console.log("✅ AI-Powered Resume Data:", stdout);

      // Parse JSON output from Python
      const resumeData = JSON.parse(stdout);

      // Send the response to the client (React frontend)
      res.json({ success: true, message: "AI-powered resume parsing successful!", userData: resumeData });

      // Delete the uploaded file after processing
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error("❌ Error processing resume:", error);
    res.status(500).json({ success: false, message: "Error processing resume" });
  }
});

module.exports = router;
