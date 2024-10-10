const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const cors = require('cors'); // Import cors module
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = 5000;

app.use(cors()); // Use cors middleware

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const roastResume = (content) => {
  let roast = [];
  if (!content.includes('experience')) roast.push('Add some work experience!');
  if (!content.includes('projects')) roast.push('Show off your projects!');

  return roast;
};

const apiKey = '4b58a647-a615-4e1f-a681-f264c7f91086'; // Replace with your API key

// Define the API_URL explicitly or via environment variable
const apiUrl = process.env.API_URL || 'https://jooble.org/api'; // Use 'https://jooble.org/api' as fallback

if (!apiUrl) {
  console.error("API_URL is not defined. Check your environment variables.");
  process.exit(1); // Exit if no API_URL is provided
}

app.post('/upload-resume', upload.single('resume'), async (req, res) => {
  const resumePath = req.file.path;
  const resumeContent = fs.readFileSync(resumePath, 'utf-8');

  try {
    const response = await axios.get(`${apiUrl}/resume/upload`, {
      params: {
        query: 'software', // Extract keywords from the resume content
        location: 'India', // or outside based on your filter
        app_key: apiKey
      }
    });

    const jobRecommendations = response.data.jobs.map(job => ({
      title: job.title,
      location: job.location.display_name,
      description: job.description,
      company: job.company.display_name
    }));

    const roast = roastResume(resumeContent);

    res.json({
      message: 'Resume uploaded and roasted!',
      recommendations: jobRecommendations,
      roast: roast,
      filePath: resumePath
    });
  } catch (error) {
    console.error('Error processing resume:', error.message || error); // Better error handling
    res.status(500).json({ error: 'Failed to process resume and fetch job recommendations.' });
  }
});

// Function to extract keywords from resume text
function extractKeywords(text) {
  const words = text.split(/\s+/);
  const stopwords = ['the', 'is', 'and', 'of', 'to', 'a']; // Extend with more stopwords
  return words.filter(word => !stopwords.includes(word.toLowerCase()));
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));