const axios = require('axios');

const MCP_URL = process.env.MCP_URL || 'http://localhost:8000';
const MCP_API_KEY = process.env.MCP_API_KEY || '';

const client = axios.create({
  baseURL: MCP_URL,
  timeout: 60_000,
  headers: MCP_API_KEY ? { Authorization: `Bearer ${MCP_API_KEY}` } : {}
});

async function generate({ model, input, temperature, max_tokens }) {
  const body = { model, input };
  if (temperature !== undefined) body.temperature = temperature;
  if (max_tokens !== undefined) body.max_tokens = max_tokens;

  // Default MCP endpoint used here is `/generate`. If your MCP uses a different path adjust accordingly.
  return client.post('/generate', body);
}

module.exports = { generate };
