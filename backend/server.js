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
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

// Middlewares
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.use(express.urlencoded({ extended: true }));

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
  "https://nova-1-iw3i.onrender.com",
  "http://localhost:3000"
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
    res.status(200).json({ success: true, token: jwtToken, user });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Upload resume and parse (PROTECTED)
app.post("/upload-resume", verifyToken, upload.single("resume"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  try {
    const filePath = req.file.path;
    const renamedFilePath = filePath.endsWith('.pdf') ? filePath : `${filePath}.pdf`;
    if (filePath !== renamedFilePath) {
      fs.renameSync(filePath, renamedFilePath);
    }
    const formData = new FormData();
    formData.append("file", fs.createReadStream(renamedFilePath));
    const response = await axios.post("https://resumeparser.app/resume/parse", formData, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        ...formData.getHeaders(),
      },
    });
    fs.unlinkSync(renamedFilePath);
    const parsedDataDir = path.join(__dirname, "parsedData");
    if (!fs.existsSync(parsedDataDir)) {
      fs.mkdirSync(parsedDataDir, { recursive: true });
    }
    const parsedDataPath = path.join(parsedDataDir, `${req.file.filename}_parsed.json`);
    fs.writeFileSync(parsedDataPath, JSON.stringify(response.data, null, 2));
    res.json({
      message: "Resume parsed successfully",
      parsedData: response.data,
      parsedDataFile: parsedDataPath,
    });
  } catch (err) {
    console.error("Error parsing resume:", err.message);
    res.status(500).json({ error: "Resume parsing failed", details: err.message });
  }
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.url}`);
  next();
});

// Serve preview of generated HTML
app.get("/preview", (req, res) => {
  const filePath = path.join(__dirname, "tmp", "index.html");
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("Portfolio preview not available.");
  }
});

// Generate Portfolio based on parsed resume (PROTECTED)
app.post("/generate-portfolio", verifyToken, async (req, res) => {
  const parsedDataFile = req.body?.parsedDataFile;
  if (!parsedDataFile) {
    return res.status(400).json({ error: "Missing 'parsedDataFile' in request body" });
  }
  if (!fs.existsSync(parsedDataFile)) {
    return res.status(400).json({ error: "File does not exist: " + parsedDataFile });
  }
  try {
    //
    //deepseek/deepseek-prover-v2:free
    //
    const parsedData = JSON.parse(fs.readFileSync(parsedDataFile, "utf8"));
    const prompt = `
Generate a fully responsive, modern, and premium personal portfolio website using TailwindCSS via CDN. The website must feature smooth scrolling and include the sections: Hero (with a professional girl student background image), relevant icon for skills in skills section, image related to Projects, Education, and Contact. Design the site with a visually elegant, clean layout, professional spacing, and incorporate subtle, sophisticated animations throughout. Use vibrant, colorful buttons with smooth hover and click animations to enhance interactivity. Include advanced, polished animations such as fade-ins, slide-ups, and scale effects for sections and elements to create a dynamic user experience. Ensure the UI is sleek, contemporary, and premium-quality-comparable to top AI-powered portfolio generators like v0 AI sites. Personalize all content using the provided resume data: ${JSON.stringify(parsedData, null, 2)}. Return only a complete standalone HTML file starting with <!DOCTYPE html>, without any backticks or extra formatting.
`;
    console.log("Sending request to OpenRouter...");
    const aiResponse = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-prover-v2:free",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const html = aiResponse.data?.choices?.[0]?.message?.content;
    if (!html) {
      console.error("AI response format is invalid:", aiResponse.data);
      return res.status(500).json({ error: "AI did not return expected HTML output" });
    }
    const outputDir = path.join(__dirname, "tmp");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
    const outputPath = path.join(outputDir, "index.html");
    fs.writeFileSync(outputPath, html, "utf8");
    console.log("Portfolio saved at:", outputPath);
    res.json({
      message: "Portfolio generated successfully",
      previewUrl: "/preview",
    });
  } catch (err) {
    console.error("AI generation error:", err.stack || err.message);
    res.status(500).json({ error: "AI portfolio generation failed", details: err.message });
  }
});

// Customize Portfolio (PROTECTED)
app.post("/customize-portfolio", verifyToken, async (req, res) => {
  const { userPrompt } = req.body;
  const portfolioPath = path.join(__dirname, "tmp", "index.html");
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
        model: "deepseek/deepseek-prover-v2:free",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    // const cleaned = response.data.choices[0].message.content
    //   .replace(/```
    //   .replace(/```/g, "")
    //   .trim();
    fs.writeFileSync(portfolioPath,  "utf8");
    res.json({ message: "Customization applied", previewUrl: "/preview" });
  } catch (error) {
    console.error("Customization error:", error.message);
    res.status(500).json({ error: "Customization failed", details: error.message });
  }
});

// Deploy to Netlify (PROTECTED)
app.post("/deploy-portfolio", verifyToken, async (req, res) => {
  const publicDir = path.join(__dirname, "tmp");
  const deployCommand = `netlify deploy --dir="${publicDir}" --message="Resume-based Portfolio" --prod`;
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

// Send Email (PROTECTED)
app.post("/send-email", verifyToken, async (req, res) => {
  const { to, deployedURL } = req.body;
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use env variables for security!
      },
    });
    await transporter.sendMail({
      from: '"Portfolio Bot" <' + process.env.EMAIL_USER + '>',
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

// Subscribe Endpoint (PROTECTED)
app.post("/subscribe", verifyToken, async (req, res) => {
  const { email } = req.body;
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: '"Portfolio Bot" <' + process.env.EMAIL_USER + '>',
      to: process.env.EMAIL_USER, // Receive notifications yourself
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
