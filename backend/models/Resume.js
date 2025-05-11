const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema({
  name: String,
  skills: [String],
  experience: String,
  education: String,
  projects: [String],
  contact: String,
});

module.exports = mongoose.model("Resume", ResumeSchema);
