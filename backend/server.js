require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const axios = require("axios");
const FormData = require("form-data");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const { OAuth2Client } = require("google-auth-library");
const nodemailer = require("nodemailer");
const { exec } = require("child_process");
const path = require("path");

const app = express();
const PORT = 5000;

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const conn = mongoose.connection;

let gfs;
conn.once("open", () => {
  gfs = new GridFSBucket(conn.db, { bucketName: "uploads" });
  console.log("MongoDB connected & GridFS ready");
});

// Models
const ResumeSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
  uploadDate: Date,
  userId: String,
  parsedData: Object,
  html: String,
});
const Resume = mongoose.model("Resume", ResumeSchema);

// Middlewares
app.use(express.json());
app.use(bodyParser.json());
app.use(cors({
  origin: [
    "https://nova-1-iw3i.onrender.com",
    "http://localhost:3000"
  ],
  credentials: true
}));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// JWT Middleware
const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid token" });
  }
};

// AUTH: Google OAuth
app.post('/auth/google/callback', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const user = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    };
    const jwtToken = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ success: true, token: jwtToken, user });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// Multer setup (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Upload resume and parse (PROTECTED)
app.post("/upload-resume", verifyToken, upload.single("resume"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  try {
    // Store PDF in GridFS
    const uploadStream = gfs.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
      metadata: { userId: req.user.email }
    });
    uploadStream.end(req.file.buffer);

    uploadStream.on('finish', async (file) => {
      // Parse the resume using the external API
      const formData = new FormData();
      formData.append("file", Buffer.from(req.file.buffer), req.file.originalname);

      const response = await axios.post("https://resumeparser.app/resume/parse", formData, {
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
          ...formData.getHeaders(),
        },
      });

      // Store parsed data in MongoDB
      const resumeDoc = await Resume.create({
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        uploadDate: new Date(),
        userId: req.user.email,
        parsedData: response.data,
      });

      res.json({
        message: "Resume parsed successfully",
        parsedData: response.data,
        resumeId: resumeDoc._id,
      });
    });
  } catch (err) {
    res.status(500).json({ error: "Resume parsing failed", details: err.message });
  }
});

// Generate Portfolio based on parsed resume (PROTECTED)
app.post("/generate-portfolio", verifyToken, async (req, res) => {
  const { resumeId } = req.body;
  if (!resumeId) return res.status(400).json({ error: "Missing 'resumeId' in request body" });

  const resumeDoc = await Resume.findById(resumeId);
  if (!resumeDoc) return res.status(404).json({ error: "Resume not found" });

  try {
    const prompt = `...Personalize all content using the provided resume data: ${JSON.stringify(resumeDoc.parsedData, null, 2)}. Return only a complete standalone HTML file starting with <!DOCTYPE html>, without any backticks or extra formatting.`;

    const aiResponse = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-prover-v2:free",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const html = aiResponse.data?.choices?.[0]?.message?.content;
    if (!html) return res.status(500).json({ error: "AI did not return expected HTML output" });

    // Save HTML in MongoDB
    resumeDoc.html = html;
    await resumeDoc.save();

    res.json({
      message: "Portfolio generated successfully",
      previewUrl: `/preview/${resumeDoc._id}`,
      resumeId: resumeDoc._id
    });
  } catch (err) {
    res.status(500).json({ error: "AI portfolio generation failed", details: err.message });
  }
});

// Serve preview of generated HTML
app.get("/preview/:resumeId", async (req, res) => {
  const { resumeId } = req.params;
  const resumeDoc = await Resume.findById(resumeId);
  if (!resumeDoc || !resumeDoc.html) {
    return res.status(404).send("Portfolio preview not available.");
  }
  res.setHeader("Content-Type", "text/html");
  res.send(resumeDoc.html);
});

// Customize Portfolio (PROTECTED)
app.post("/customize-portfolio", verifyToken, async (req, res) => {
  const { resumeId, userPrompt } = req.body;
  if (!resumeId || !userPrompt) {
    return res.status(400).json({ error: "Missing 'resumeId' or 'userPrompt' in request body" });
  }
  const resumeDoc = await Resume.findById(resumeId);
  if (!resumeDoc || !resumeDoc.html) {
    return res.status(404).json({ error: "No portfolio found to customize." });
  }

  const prompt = `
You are a frontend UI expert. 
Apply ONLY the following customization to this HTML:
"${userPrompt}"

Only update things like colors, font, spacing, animations, styles, background etc.

HTML to customize:
${resumeDoc.html}
`;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-prover-v2:free",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    const newHTML = response.data?.choices?.[0]?.message?.content;
    resumeDoc.html = newHTML;
    await resumeDoc.save();
    res.json({ message: "Customization applied", previewUrl: `/preview/${resumeDoc._id}` });
  } catch (error) {
    res.status(500).json({ error: "Customization failed", details: error.message });
  }
});

// Efficiently delete after portfolio generation (PROTECTED)
app.delete("/cleanup/:resumeId", verifyToken, async (req, res) => {
  const { resumeId } = req.params;
  try {
    await Resume.findByIdAndDelete(resumeId);
    res.json({ success: true, message: "Data deleted from MongoDB." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete data." });
  }
});

// ... (Other endpoints: deploy, email, subscribe, unchanged except references to local files)

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
