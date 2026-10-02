import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const analyzeCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(
    `${API_BASE}/api/v1/reviews/analyze-csv`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000,
    }
  );

  return response.data;
};