require('dotenv').config();
const express = require('express');
const path = require('path');
const historyStore = require('./historyStore');

const app = express();
const PORT = process.env.PORT || 3001;
const N8N_ANALYZE_URL = process.env.N8N_ANALYZE_URL || '';
const REQUEST_TIMEOUT_MS = 30000;
const isProduction = process.env.NODE_ENV === 'production';

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

function parseN8nResult(data) {
  if (!Array.isArray(data) || data.length === 0) return null;
  const first = data[0];
  const output = first?.output;
  if (!output || typeof output !== 'object') return null;
  const { matchScore, matchingSkills, missingSkills, locationComparison, experienceComparison, suggestions } = output;
  if (typeof matchScore !== 'number') return null;
  return {
    matchScore,
    matchingSkills: Array.isArray(matchingSkills) ? matchingSkills : [],
    missingSkills: Array.isArray(missingSkills) ? missingSkills : [],
    locationComparison: locationComparison && typeof locationComparison === 'object' ? locationComparison : {},
    experienceComparison: experienceComparison && typeof experienceComparison === 'object' ? experienceComparison : {},
    suggestions: Array.isArray(suggestions) ? suggestions : [],
  };
}

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
    const skipHistory = req.get('X-Save-History') === 'false';
    const userId = req.get('X-User-Id') || '';
    if (response.ok && !skipHistory && userId) {
      const result = parseN8nResult(data);
      if (result) {
        try {
          historyStore.add(userId, resumeText, jobDescription, result);
        } catch (err) {
          console.error('Failed to save to history:', err.message);
        }
      }
    }
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

app.get('/api/history', (req, res) => {
  try {
    const userId = req.get('X-User-Id') || '';
    const list = historyStore.list(userId);
    res.json(list);
  } catch (err) {
    console.error('History list error:', err.message);
    res.status(500).json({ error: 'Failed to load history.' });
  }
});

app.get('/api/history/:id', (req, res) => {
  const userId = req.get('X-User-Id') || '';
  const id = req.params.id;
  const entry = historyStore.getById(userId, id);
  if (!entry) {
    return res.status(404).json({ error: 'Not found.' });
  }
  res.json(entry);
});

if (isProduction) {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
