require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const path = require("path");
const nodemailer = require("nodemailer");
const { exec } = require("child_process");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 5000;

app.use(express.json()); // parse JSON requests
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.use(express.static("public"));
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const API_KEY = process.env.API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

// CORS Configuration
const allowedOrigins = [
  "http://localhost:3001",
  
  
];

const corsOptions = { 
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));

// Google OAuth client
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// JWT Middleware
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

    res.status(200).json({
      success: true,
      token: jwtToken,
      user,
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// Resume Upload + Parse
const upload = multer({ dest: "uploads/" });
let storedParsedData = null;

app.post("/upload-resume", verifyToken, upload.single("resume"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const filePath = `${req.file.path}.pdf`;
    fs.renameSync(req.file.path, filePath);

    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));

    const response = await axios.post("https://resumeparser.app/resume/parse", formData, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        ...formData.getHeaders()
      },
    });

    fs.unlinkSync(filePath);
    storedParsedData = response.data;
    res.json({ message: "Resume parsed successfully", parsedData: storedParsedData });
  } catch (err) {
    console.error("Resume parse error:", err.response?.data || err.message);
    res.status(500).json({ error: "Resume parsing failed", details: err.message });
  }
});

// Generate Portfolio
app.post("/generate-portfolio", async (req, res) => {
  if (!storedParsedData) return res.status(400).json({ error: "No resume data found" });

  const prompt = `Generate a fully responsive and modern personal portfolio website using TailwindCSS via CDN. The website must include smooth scrolling and the following sections: Hero, Skills, Projects, Education, and Contact. The design should be visually elegant with clean layout, professional spacing, and subtle animations.

Use the following resume data to personalize the content:
${JSON.stringify(storedParsedData, null, 2)}

Return only a complete standalone HTML file that starts with <!DOCTYPE html>.`;

  try {
    const aiResponse = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-2.0-flash-exp:free",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const html = aiResponse.data.choices[0].message.content;
    const outputPath = path.join(__dirname, "public", "index.html");
    fs.writeFileSync(outputPath, html, "utf8");

    res.json({ message: "Portfolio generated", previewUrl: "https://nova-rioy.onrender.com/index.html" });
  } catch (err) {
    console.error("AI generation error:", err.response?.data || err.message);
    res.status(500).json({ error: "AI generation failed", details: err.message });
  }
});

// Preview Portfolio
app.get("/preview-portfolio", (req, res) => {
  const portfolioPath = path.join(__dirname, "public", "index.html");
  if (fs.existsSync(portfolioPath)) {
    res.sendFile(portfolioPath);
  } else {
    res.status(404).send("No generated portfolio found.");
  }
});

// Customize Portfolio
app.post("/customize-portfolio", async (req, res) => {
  const { userPrompt } = req.body;

  const portfolioPath = path.join(__dirname, "public", "index.html");
  if (!fs.existsSync(portfolioPath)) {
    return res.status(404).json({ error: "No portfolio found to customize." });
  }

  const originalHTML = fs.readFileSync(portfolioPath, "utf8");

  const prompt = `
You are a frontend UI expert. 
Apply ONLY the following customization to this HTML:
"${userPrompt}"

Only update things like colors, font, spacing, animations, styles, background etc.

HTML to customize:
${originalHTML}
`;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-2.0-flash-exp:free",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const cleaned = response.data.choices[0].message.content
      .replace(/```(html)?/g, "")
      .replace(/```/g, "")
      .trim();

    fs.writeFileSync(portfolioPath, cleaned, "utf8");

    res.json({ message: "Customization applied", previewUrl: "/preview-portfolio" });
  } catch (error) {
    console.error("Customization error:", error.message);
    res.status(500).json({ error: "Customization failed", details: error.message });
  }
});

// Deploy to Netlify
app.post("/deploy-portfolio", async (req, res) => {
  const publicDir = path.join(__dirname, "public");
  const deployCommand = `netlify deploy --dir="${publicDir}" --message="Resume-based Portfolio"`;

  exec(deployCommand, (error, stdout) => {
    if (error) {
      console.error("Netlify deploy error:", error.message);
      return res.status(500).json({ error: "Deployment failed", details: error.message });
    }

    const urlMatch = stdout.match(/(https:\/\/[^\s]+\.netlify\.app)/);
    if (!urlMatch) {
      return res.status(500).json({ error: "Deployed, but URL not found" });
    }

    res.json({ message: "Deployed successfully", deployedUrl: urlMatch[1] });
  });
});

// Send Email
app.post("/send-email", async (req, res) => {
  const { to, deployedURL } = req.body;

  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ppb4975@gmail.com",
        pass: "vazdacbubwxlaszr", // app password
      },
    });

    await transporter.sendMail({
      from: '"Portfolio Bot" <ppb4975@gmail.com>',
      to,
      subject: "🚀 Your Portfolio is Ready!",
      html: `<p>Hi! Your portfolio is live: <a href="${deployedURL}">${deployedURL}</a></p>`,
    });

    res.json({ success: true, message: "Email sent!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to send email." });
  }
});

// Subscribe Endpoint (finish here)
app.post("/subscribe", async (req, res) => {
  const { email } = req.body;

  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ppb4975@gmail.com",
        pass: "vazdacbubwxlaszr", // app password
      },
    });

    await transporter.sendMail({
      from: '"Portfolio Bot" <ppb4975@gmail.com>',
      to: "ppb4975@gmail.com", // Receive notifications yourself
      subject: "🔔 New Subscription",
      text: `A new user subscribed: ${email}`,
    });

    res.json({ success: true, message: "Subscribed successfully!" });
  } catch (err) {
    console.error("Subscription error:", err.message);
    res.status(500).json({ success: false, message: "Subscription failed." });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
