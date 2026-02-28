require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3001;
const N8N_ANALYZE_URL = process.env.N8N_ANALYZE_URL || '';
const REQUEST_TIMEOUT_MS = 30000;

app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/analyze', async (req, res) => {
  if (!N8N_ANALYZE_URL) {
    return res.status(503).json({ error: 'Analyze service not configured (N8N_ANALYZE_URL).' });
  }

  const { resumeText, jobDescription } = req.body || {};
  if (typeof resumeText !== 'string' || typeof jobDescription !== 'string') {
    return res.status(400).json({ error: 'Body must include resumeText and jobDescription.' });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(N8N_ANALYZE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText, jobDescription }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Analysis request timed out.' });
    }
    console.error('Analyze proxy error:', err.message);
    res.status(502).json({ error: 'Analysis service error.' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
