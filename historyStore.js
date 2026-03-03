const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

function sanitizeUserId(userId) {
  if (typeof userId !== 'string' || !userId) return null;
  const safe = userId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  return safe || null;
}

function getFilePath(userId) {
  const safe = sanitizeUserId(userId);
  if (!safe) return null;
  return path.join(DATA_DIR, `history_${safe}.json`);
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readAllForUser(userId) {
  const filePath = getFilePath(userId);
  if (!filePath) return [];
  ensureDataDir();
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeAllForUser(userId, entries) {
  const filePath = getFilePath(userId);
  if (!filePath) return;
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(entries, null, 2), 'utf8');
}

function getNextId(entries) {
  if (entries.length === 0) return 1;
  const max = Math.max(...entries.map((e) => e.id));
  return max + 1;
}

/**
 * @param {string} userId
 * @param {string} resumeText
 * @param {string} jobDescription
 * @param {object} result 
 * @returns {{ id: number, resumeText: string, jobDescription: string, result: object, createdAt: string } | null}
 */
function add(userId, resumeText, jobDescription, result) {
  if (!sanitizeUserId(userId)) return null;
  const entries = readAllForUser(userId);
  const id = getNextId(entries);
  const createdAt = new Date().toISOString();
  const entry = {
    id,
    resumeText,
    jobDescription,
    result,
    createdAt,
  };
  entries.unshift(entry);
  writeAllForUser(userId, entries);
  return entry;
}

/**
 * @param {string} userId
 * @returns {Array<{ id: number, matchScore: number, createdAt: string, jobDescriptionSnippet: string, resumeSnippet: string }>}
 */
function list(userId) {
  if (!sanitizeUserId(userId)) return [];
  const entries = readAllForUser(userId);
  return entries.map((e) => ({
    id: e.id,
    matchScore: e.result?.matchScore ?? null,
    createdAt: e.createdAt,
    jobDescriptionSnippet: truncate(e.jobDescription, 280),
    resumeSnippet: truncate(e.resumeText, 280),
  }));
}

/**
 * @param {string} userId
 * @param {number} id
 * @returns {{ id: number, resumeText: string, jobDescription: string, result: object, createdAt: string } | null}
 */
function getById(userId, id) {
  if (!sanitizeUserId(userId)) return null;
  const entries = readAllForUser(userId);
  return entries.find((e) => e.id === Number(id)) || null;
}

function truncate(str, maxLen) {
  if (typeof str !== 'string') return '';
  const t = str.trim();
  if (t.length <= maxLen) return t;
  return t.slice(0, maxLen) + '…';
}

module.exports = { add, list, getById };
