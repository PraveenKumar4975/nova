


//---------------------------------------------------
const axios = require('axios');
const fs = require('fs');

const API_KEY = 'Zl3Xo67x9AKXhQns7Ok0KwyLomahRsNl'; // Replace with your actual API key
const API_URL = 'https://api.apilayer.com/resume_parser/upload';

async function parseResume(filePath) {
    try {
        const fileData = fs.readFileSync(filePath);

        const response = await axios.post(API_URL, fileData, {
            headers: {
                'Content-Type': 'application/pdf', // or 'application/msword' for .doc
                'apikey': API_KEY,
            },
        });

        const data = response.data;

        console.log('Full API Response:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

// Example usage
parseResume('D:/final erpro_/backend/praveen-kumar-B-2021-2025-Fresher.pdf'); // Replace with the actual path to your resume
