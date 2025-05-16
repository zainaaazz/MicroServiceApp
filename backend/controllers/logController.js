// backend/controllers/logController.js
const fs = require('fs').promises;
const path = require('path');

exports.getActivityLogs = async (req, res) => {
  try {
    const logPath = path.join(__dirname, '../logs/activity.log');
    const raw = await fs.readFile(logPath, 'utf8');
    // each line is a JSON object
    const entries = raw
      .trim()
      .split('\n')
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(e => e !== null);
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not read logs' });
  }
};
