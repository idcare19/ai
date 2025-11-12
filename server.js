const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  console.log('Received message:', message);

  try {
    const response = await axios.post('http://localhost:11434/api/chat', {
      model: 'llama2', // Use your pulled model name
      messages: [{ role: 'user', content: message }],
      stream: false,
    });

    console.log('Ollama API response:', response.data);

    res.json(response.data);
  } catch (error) {
    console.error('Error calling Ollama API:', error.response?.data || error.message || error);
    res.status(500).json({ error: 'Failed to get response from Ollama API' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
