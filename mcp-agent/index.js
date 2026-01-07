require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mcpClient = require('./mcpClient');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Basic OpenAI-compatible chat completion proxy endpoint
app.post('/v1/chat/completions', async (req, res) => {
  try {
    const { model, messages, temperature, max_tokens } = req.body;
    // Flatten messages to a simple text input for MCP. Adjust mapping if your MCP expects different shape.
    const input = messages
      ? messages.map(m => `${m.role}: ${m.content}`).join('\n\n')
      : (req.body.input || req.body.prompt || '');

    const mcpResp = await mcpClient.generate({ model, input, temperature, max_tokens });

    // Try to extract text from common MCP response shapes
    const respData = mcpResp.data || {};
    const text = respData.output || respData.text || (Array.isArray(respData.choices) && respData.choices[0]?.text) || JSON.stringify(respData);

    const openaiStyle = {
      id: `mcp-${Date.now()}`,
      object: 'chat.completion',
      choices: [
        {
          message: { role: 'assistant', content: text },
          finish_reason: 'stop'
        }
      ]
    };

    res.json(openaiStyle);
  } catch (err) {
    console.error('proxy error', err?.message || err);
    res.status(500).json({ error: 'proxy_error', details: err.response?.data || err.message });
  }
});

// Generic passthrough for completions (if you use OpenAI completions)
app.post('/v1/completions', async (req, res) => {
  try {
    const { model, prompt, temperature, max_tokens } = req.body;
    const input = prompt || req.body.input || '';
    const mcpResp = await mcpClient.generate({ model, input, temperature, max_tokens });
    res.json(mcpResp.data);
  } catch (err) {
    console.error('proxy error', err?.message || err);
    res.status(500).json({ error: 'proxy_error', details: err.response?.data || err.message });
  }
});

app.listen(PORT, () => {
  console.log(`MCP proxy running on http://localhost:${PORT}`);
});
