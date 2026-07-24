import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is awake and healthy' });
});

// Placeholder for EclipseID issuer logic
app.post('/api/issuer/request-credential', (req, res) => {
  const { email, address } = req.body;
  // In a real app, you would verify the email, and then return an authorization signature
  // or insert the address into the Midnight smart contract as an authorized user.
  res.status(200).json({ 
    success: true, 
    message: 'Credential requested successfully. Ready for smart contract interaction.' 
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Anti-sleep mechanism for Render free tier
  const renderUrl = process.env.RENDER_EXTERNAL_URL;
  if (renderUrl) {
    console.log(`Starting anti-sleep ping for: ${renderUrl}`);
    // Ping every 14 minutes (Render sleeps after 15 minutes of inactivity)
    const FOURTEEN_MINUTES = 14 * 60 * 1000;
    setInterval(async () => {
      try {
        console.log(`[Anti-Sleep] Pinging ${renderUrl}/health`);
        await axios.get(`${renderUrl}/health`);
        console.log('[Anti-Sleep] Ping successful');
      } catch (error) {
        console.error('[Anti-Sleep] Ping failed:', error.message);
      }
    }, FOURTEEN_MINUTES);
  } else {
    console.log('RENDER_EXTERNAL_URL not set. Anti-sleep ping disabled.');
  }
});
