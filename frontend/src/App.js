import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await axios.post('http://localhost:5000/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setRecommendations(response.data.recommendations);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className="App">
      <h1>Resume Job Recommendation</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Upload Resume</button>

      <h2>Job Recommendations</h2>
      <ul>
        {recommendations.map((job, index) => (
          <li key={index}>
            <strong>{job.title}</strong> - {job.location}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
