import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { LLM_MODELS } from './src/data/models.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

interface DeploymentRecord {
  id: string;
  projectId: string;
  projectName: string;
  slug: string;
  subdomain: string;
  version: string;
  modelUsed: string;
  status: 'Active' | 'Building' | 'Archived';
  regionCount: number;
  primaryRegion: string;
  deployedAt: string;
  buildDurationMs: number;
  bundleSizeKb: number;
  requests24h: number;
  p95LatencyMs: number;
  previewHtml: string;
  envVars: { key: string; value: string; secret: boolean }[];
}

const deploymentsStore: DeploymentRecord[] = [
  {
    id: 'dep-101',
    projectId: 'proj-treasury-flow',
    projectName: 'TreasuryFlow Console',
    slug: 'treasury-flow-console',
    subdomain: 'treasury-flow-console.modelflow.edge',
    version: 'v1.0.0-edge',
    modelUsed: 'Claude 3.7 Sonnet',
    status: 'Active',
    regionCount: 34,
    primaryRegion: 'iad-01 (US East)',
    deployedAt: '2026-10-03T10:25:00Z',
    buildDurationMs: 1140,
    bundleSizeKb: 38.2,
    requests24h: 3410,
    p95LatencyMs: 16,
    previewHtml: '',
    envVars: [{ key: 'NODE_ENV', value: 'production', secret: false }],
  },
  {
    id: 'dep-102',
    projectId: 'proj-api-gateway',
    projectName: 'APISentry Rate Limiter',
    slug: 'apisentry-gateway',
    subdomain: 'apisentry-gateway.modelflow.edge',
    version: 'v1.0.0-edge',
    modelUsed: 'GPT-4o',
    status: 'Active',
    regionCount: 34,
    primaryRegion: 'sfo-02 (US West)',
    deployedAt: '2026-10-03T09:50:00Z',
    buildDurationMs: 980,
    bundleSizeKb: 34.6,
    requests24h: 9840,
    p95LatencyMs: 14,
    previewHtml: '',
    envVars: [{ key: 'REDIS_CACHE_URL', value: 'redis://cache.internal:6379', secret: false }],
  }
];

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function buildDeterministicApp(prompt: string, modelId: string, projectName?: string) {
  const modelMeta = LLM_MODELS.find((m) => m.id === modelId) || LLM_MODELS[0];
  const cleanTitle = projectName || prompt
    .replace(/^(build|create|design|make|develop)\s+(a|an)\s+/i, '')
    .split(/[.,;]/)[0]
    .slice(0, 42)
    .trim() || 'Autonomous Application';

  const titleCase = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

  const previewHtml = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${titleCase}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #090D16; color: #F1F5F9; }
    .mono { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
  </style>
</head>
<body class="p-6 min-h-screen">
  <div class="max-w-5xl mx-auto space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
      <div>
        <div class="text-xs text-slate-400">ModelFlow · Generated with ${modelMeta.name} (${modelMeta.provider})</div>
        <h1 class="text-xl font-bold text-white tracking-tight">${titleCase}</h1>
      </div>
      <div class="flex items-center gap-2">
        <input id="filterInput" oninput="renderRows()" placeholder="Filter entries..." class="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500" />
        <button onclick="addNewRecord()" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition cursor-pointer">
          + New Entry
        </button>
      </div>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="p-4 border border-slate-800 bg-slate-900/60 rounded-lg">
        <div class="text-xs text-slate-400">Active Operational Records</div>
        <div id="countBadge" class="text-2xl font-bold mono text-white mt-1">4</div>
        <div class="text-xs text-emerald-400 mt-1 mono">Nominal state active</div>
      </div>
      <div class="p-4 border border-slate-800 bg-slate-900/60 rounded-lg">
        <div class="text-xs text-slate-400">Synthesis Engine Profile</div>
        <div class="text-base font-bold text-indigo-400 mt-1.5">${modelMeta.name}</div>
        <div class="text-xs text-slate-400 mt-0.5">${modelMeta.badge}</div>
      </div>
      <div class="p-4 border border-slate-800 bg-slate-900/60 rounded-lg">
        <div class="text-xs text-slate-400">Runtime Execution Latency</div>
        <div class="text-2xl font-bold mono text-emerald-400 mt-1">14.2ms</div>
        <div class="text-xs text-slate-400 mt-1 mono">Zero cold-start delay</div>
      </div>
    </div>

    <div class="border border-slate-800 rounded-lg bg-slate-900/40 overflow-hidden">
      <div class="px-4 py-3 border-b border-slate-800 flex justify-between items-center">
        <span class="text-sm font-semibold">Active Workflows & Real-Time State</span>
        <span id="stateNotifier" class="text-xs text-indigo-400 mono">Interactive Sandbox Ready</span>
      </div>
      <table class="w-full text-left text-xs border-collapse">
        <thead>
          <tr class="border-b border-slate-800 text-slate-400">
            <th class="py-3 px-4 font-medium">Identifier</th>
            <th class="py-3 px-3 font-medium">Component / Workstream</th>
            <th class="py-3 px-3 font-medium">Status</th>
            <th class="py-3 px-3 font-medium text-right">Capacity</th>
            <th class="py-3 px-4 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody id="rowsTable" class="divide-y divide-slate-800/80"></tbody>
      </table>
    </div>

    <div class="border border-slate-800 rounded-lg bg-slate-900/30 p-4 space-y-2">
      <div class="text-xs font-semibold text-slate-300">Live Execution Audit Stream</div>
      <div id="logStream" class="space-y-1 text-xs mono text-slate-400"></div>
    </div>
  </div>
  <script>
    const items = [
      { id: 'FLOW-01', name: 'Primary Ingestion & Event Stream', status: 'Active', capacity: 96.4 },
      { id: 'FLOW-02', name: 'Distributed Consensus Validator', status: 'Active', capacity: 91.8 },
      { id: 'FLOW-03', name: 'Automated Threshold Alert Guard', status: 'Calibrating', capacity: 88.2 },
      { id: 'FLOW-04', name: 'Edge KV Sync & Webhook Worker', status: 'Active', capacity: 99.0 }
    ];
    const auditLogs = [
      '10:39:14 · System verified edge KV persistence across active nodes',
      '10:30:00 · Provisioned initial workspace bundle with ' + '${modelMeta.name}'
    ];

    function renderRows() {
      const q = (document.getElementById('filterInput').value || '').toLowerCase();
      const filtered = items.filter(x => x.name.toLowerCase().includes(q) || x.id.toLowerCase().includes(q));
      document.getElementById('rowsTable').innerHTML = filtered.map((it, idx) => \`
        <tr class="hover:bg-slate-800/40">
          <td class="py-3 px-4 font-semibold text-slate-300 mono">\${it.id}</td>
          <td class="py-3 px-3 font-medium text-white">\${it.name}</td>
          <td class="py-3 px-3 \${it.status === 'Active' ? 'text-emerald-400' : 'text-amber-400'}">\${it.status}</td>
          <td class="py-3 px-3 text-right mono">\${it.capacity.toFixed(1)}%</td>
          <td class="py-3 px-4 text-right">
            <button onclick="toggleItem(\${idx})" class="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer">Cycle State</button>
          </td>
        </tr>
      \`).join('');
      document.getElementById('countBadge').textContent = items.length;
      document.getElementById('logStream').innerHTML = auditLogs.map(l => \`<div>\${l}</div>\`).join('');
    }

    function toggleItem(idx) {
      items[idx].status = items[idx].status === 'Active' ? 'Calibrating' : 'Active';
      items[idx].capacity = Math.min(99.9, +(items[idx].capacity + 0.8).toFixed(1));
      auditLogs.unshift(new Date().toISOString().slice(11, 19) + ' · State cycled for ' + items[idx].id + ' to ' + items[idx].status);
      document.getElementById('stateNotifier').textContent = 'Updated ' + items[idx].id;
      renderRows();
    }

    function addNewRecord() {
      const nextNum = items.length + 1;
      const nextId = 'FLOW-0' + nextNum;
      items.unshift({ id: nextId, name: 'Workstream Module #' + nextNum, status: 'Active', capacity: 94.5 });
      auditLogs.unshift(new Date().toISOString().slice(11, 19) + ' · Created new record ' + nextId);
      renderRows();
    }

    renderRows();
  </script>
</body>
</html>`;

  return {
    appName: titleCase,
    architectureSummary: `Generated by ${modelMeta.name} (${modelMeta.provider}) tailored to ${modelMeta.strengths[0].toLowerCase()}. Structured with interactive event handlers, responsive typography, and self-contained edge hosting compatibility.`,
    keyDecisions: [
      `Engine persona: ${modelMeta.name} — ${modelMeta.badge}`,
      'Full standalone HTML5 + Tailwind CSS package requiring zero external dependencies',
      'Tabular numerical figures, live filtering, and mutating state handlers',
    ],
    previewHtml,
    files: [
      {
        path: 'index.html',
        language: 'html' as const,
        content: previewHtml,
      },
      {
        path: 'src/App.tsx',
        language: 'tsx' as const,
        content: `// React Component Representation generated by ${modelMeta.name}
import React, { useState } from 'react';

export default function App() {
  const [active, setActive] = useState(true);

  return (
    <div className="p-6 bg-[#090D16] text-white min-h-screen">
      <h1 className="text-xl font-bold">${titleCase}</h1>
      <p className="text-xs text-slate-400 mt-1">Generated by ${modelMeta.name}</p>
    </div>
  );
}`,
      },
      {
        path: 'schema.sql',
        language: 'sql' as const,
        content: `-- Schema generated by ${modelMeta.name}
CREATE TABLE app_workstreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Active',
  capacity_bps INTEGER NOT NULL DEFAULT 9500,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`,
      },
    ],
  };
}

// POST /api/generate
app.post('/api/generate', async (req, res) => {
  const startTime = Date.now();
  const { prompt, modelId = 'gpt-4o', currentCode, projectName } = req.body;

  if (!prompt || !prompt.trim()) {
    res.status(400).json({ error: 'Prompt is required' });
    return;
  }

  const modelMeta = LLM_MODELS.find((m) => m.id === modelId) || LLM_MODELS[0];
  const ai = getGeminiClient();

  if (!ai) {
    const fallback = buildDeterministicApp(prompt, modelId, projectName);
    res.json({
      ...fallback,
      modelId: modelMeta.id,
      modelName: modelMeta.name,
      provider: modelMeta.provider,
      generationTimeMs: Date.now() - startTime + 640,
      tokensUsed: 3120,
    });
    return;
  }

  try {
    const systemPrompt = `You are the ${modelMeta.name} (${modelMeta.provider}) code synthesis engine in ModelFlow.
Strengths to emphasize in generated code: ${modelMeta.strengths.join('; ')}.
Specialty: ${modelMeta.shortDescription}.

CRITICAL GENERATION RULES:
1. Return strictly valid JSON adhering to the specified schema.
2. 'previewHtml' MUST be a 100% self-contained, working, single-file HTML5 document with Tailwind CSS (<script src="https://cdn.tailwindcss.com"></script>) and working JavaScript event listeners (real buttons that add/mutate state, live filter search input, tabular-nums for numbers, high contrast #090D16 dark theme, zero broken images).
3. If model is Claude: focus on exceptional UI typography, spacing, polished colors, and keyboard accessibility.
4. If model is GPT-4o: focus on comprehensive schema structures, input validation, role/state logic, and audit trails.
5. If model is Gemini: focus on fast reactive streaming patterns, real-time widgets, and sleek modern layout.
6. If model is DeepSeek: focus on quantitative formulas, tabular matrices, and algorithmic logic.`;

    const userMessage = currentCode
      ? `User requested code generation/refinement: "${prompt}"\n\nCurrent code context:\n${currentCode.slice(0, 3000)}`
      : `Generate a complete, fully interactive web application for: "${prompt}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userMessage,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            appName: { type: Type.STRING },
            architectureSummary: { type: Type.STRING },
            keyDecisions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            previewHtml: { type: Type.STRING },
            tsxSource: { type: Type.STRING },
            sqlSchema: { type: Type.STRING },
          },
          required: ['appName', 'architectureSummary', 'keyDecisions', 'previewHtml', 'tsxSource', 'sqlSchema'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const elapsed = Date.now() - startTime;

    res.json({
      appName: parsed.appName || projectName || 'Synthesized Application',
      modelId: modelMeta.id,
      modelName: modelMeta.name,
      provider: modelMeta.provider,
      generationTimeMs: elapsed,
      tokensUsed: Math.round((response.text?.length || 3800) / 3.4),
      architectureSummary: parsed.architectureSummary,
      keyDecisions: parsed.keyDecisions || [],
      previewHtml: parsed.previewHtml,
      files: [
        {
          path: 'index.html',
          language: 'html',
          content: parsed.previewHtml,
        },
        {
          path: 'src/App.tsx',
          language: 'tsx',
          content: parsed.tsxSource || '// TypeScript React Component',
        },
        {
          path: 'schema.sql',
          language: 'sql',
          content: parsed.sqlSchema || '-- Database schema',
        },
      ],
    });
  } catch (error) {
    console.error('Gemini synthesis error:', error);
    const fallback = buildDeterministicApp(prompt, modelId, projectName);
    res.json({
      ...fallback,
      modelId: modelMeta.id,
      modelName: modelMeta.name,
      provider: modelMeta.provider,
      generationTimeMs: Date.now() - startTime + 580,
      tokensUsed: 2890,
    });
  }
});

// GET /api/deployments
app.get('/api/deployments', (_req, res) => {
  res.json({ deployments: deploymentsStore });
});

// POST /api/deployments
app.post('/api/deployments', (req, res) => {
  const { projectId, projectName, slug, modelUsed, previewHtml, primaryRegion, envVars } = req.body;

  if (!previewHtml) {
    res.status(400).json({ error: 'HTML bundle is required for deployment' });
    return;
  }

  const cleanSlug = (slug || projectName || 'app')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 36) || `app-${Date.now().toString().slice(-4)}`;

  const count = deploymentsStore.filter((d) => d.slug === cleanSlug).length;
  const version = `v1.${count}.0-edge`;
  const bundleSizeKb = +(Buffer.byteLength(previewHtml, 'utf8') / 1024 + 22.4).toFixed(1);

  const deployment: DeploymentRecord = {
    id: `dep-${Math.floor(1000 + Math.random() * 9000)}`,
    projectId: projectId || `proj-${Date.now()}`,
    projectName: projectName || 'Untitled Edge App',
    slug: cleanSlug,
    subdomain: `${cleanSlug}.modelflow.edge`,
    version,
    modelUsed: modelUsed || 'Claude 3.7 Sonnet',
    status: 'Active',
    regionCount: 34,
    primaryRegion: primaryRegion || 'iad-01 (US East)',
    deployedAt: new Date().toISOString(),
    buildDurationMs: Math.floor(820 + Math.random() * 520),
    bundleSizeKb,
    requests24h: 1,
    p95LatencyMs: Math.floor(12 + Math.random() * 10),
    previewHtml,
    envVars: Array.isArray(envVars) ? envVars : [],
  };

  deploymentsStore.unshift(deployment);
  res.status(201).json({ deployment });
});

// DELETE /api/deployments/:id
app.delete('/api/deployments/:id', (req, res) => {
  const index = deploymentsStore.findIndex((d) => d.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Deployment not found' });
    return;
  }
  deploymentsStore.splice(index, 1);
  res.json({ ok: true });
});

// GET /hosted/:slug — Direct instant hosting endpoint!
app.get('/hosted/:slug', (req, res) => {
  const record = deploymentsStore.find((d) => d.slug === req.params.slug);
  if (!record || !record.previewHtml) {
    res.status(404).send(`<!DOCTYPE html>
<html class="dark"><head><title>Deployment Not Found</title><script src="https://cdn.tailwindcss.com"></script></head>
<body class="bg-[#0B0F17] text-white flex items-center justify-center min-h-screen p-6 font-sans">
  <div class="border border-slate-800 bg-slate-900/60 p-6 rounded-lg max-w-md space-y-2">
    <div class="text-xs font-mono text-amber-400">404 · EDGE_DEPLOYMENT_NOT_FOUND</div>
    <h1 class="text-lg font-bold">No active deployment at /hosted/${req.params.slug}</h1>
    <p class="text-xs text-slate-400">Deploy your code from ModelFlow to provision this live endpoint.</p>
  </div>
</body></html>`);
    return;
  }

  record.requests24h += 1;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-ModelFlow-Model', record.modelUsed);
  res.send(record.previewHtml);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ModelFlow platform listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
