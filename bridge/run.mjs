import OpenAI from "openai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function pickAccountIdKey(accountsResp) {
  // Your server’s return shape may wrap JSON differently. Try common shapes.
  const candidates =
    accountsResp?.content?.[0]?.json?.accounts ??
    accountsResp?.accounts ??
    accountsResp?.content?.[0]?.accounts ??
    [];

  // Pick the first by default. You can refine by account type later.
  const first = candidates?.[0];
  const accountIdKey = first?.accountIdKey || first?.accountId_key || first?.key;

  if (!accountIdKey) {
    throw new Error(
      `Could not find accountIdKey in get_accounts response. Got keys: ${Object.keys(first || {})}`
    );
  }
  return accountIdKey;
}

function extractUnderlyingSymbols(positionsResp) {
  // Adjust as needed once we see your get_positions output shape.
  const rows =
    positionsResp?.content?.[0]?.json?.positions ??
    positionsResp?.positions ??
    positionsResp?.content?.[0]?.positions ??
    [];

  const syms = new Set();

  for (const p of rows) {
    // Common E*TRADE-ish fields:
    const sym =
      p?.symbol ||
      p?.Product?.symbol ||
      p?.product?.symbol ||
      p?.underlyingSymbol ||
      p?.underlying?.symbol;

    if (sym) syms.add(sym);
  }

  return Array.from(syms);
}

async function main() {
  // 1) Connect to your MCP stdio server (same as Claude Desktop config)
  const transport = new StdioClientTransport({
    command: "node",
    args: ["/Users/naveen/Documents/options-analysis/src/index.js"],
    env: process.env,
  });

  const mcp = new Client({ name: "options-bridge", version: "0.1.0" });
  await mcp.connect(transport);

  // 2) Accounts + positions
  const accounts = await mcp.callTool({ name: "get_accounts", arguments: {} });
  const accountIdKey = pickAccountIdKey(accounts);

  const positions = await mcp.callTool({
    name: "get_positions",
    arguments: { accountIdKey },
  });

  // 3) Quotes for all underlying symbols in positions
  const symbols = extractUnderlyingSymbols(positions);
  const quotes = symbols.length
    ? await mcp.callTool({
        name: "get_quote",
        arguments: { symbols: symbols.join(",") },
      })
    : { note: "No symbols found in positions; skipping get_quote." };

  // 4) Optional: expiries + chain for a few symbols (keep small to avoid huge payload)
  const focus = symbols.slice(0, 5);
  const expiriesBySym = {};
  const chainsBySym = {};

  for (const sym of focus) {
    expiriesBySym[sym] = await mcp.callTool({
      name: "get_option_expiries",
      arguments: { symbol: sym },
    });

    // Pull “current” chain (no expiryDate) OR you can pick one expiryDate explicitly
    chainsBySym[sym] = await mcp.callTool({
      name: "get_options_chain",
      arguments: { symbol: sym }, // or { symbol: sym, expiryDate: "2025-10-31" }
    });
  }

  // 5) Build snapshot (trim if needed)
  const snapshot = {
    accountIdKey,
    accounts,
    positions,
    quotes,
    expiriesBySym,
    chainsBySym,
    toolHints: {
      get_quote: { symbols: "comma-separated string" },
      get_positions: { accountIdKey: "from get_accounts" },
      get_options_chain: { symbol: "required", expiryDate: "optional YYYY-MM-DD" },
    },
  };

  const prompt = `
You are my options assistant.
Use ONLY this tool output snapshot.

Tasks:
- Identify option positions expiring within 14 days.
- For each: HOLD/CLOSE/ROLL with reason.
- Use premium-captured rule if open price / current mark exists; otherwise use delta/DTE.
- For rolls: propose 30–45 DTE strikes targeting delta 0.10–0.15, and estimate credit using chain.
- Compute capital-weighted premium yield where possible.

SNAPSHOT JSON:
${JSON.stringify(snapshot).slice(0, 180000)}
`;

  const resp = await openai.responses.create({
    model: "gpt-5",
    input: prompt,
  });

  console.log(resp.output_text);

  await mcp.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
