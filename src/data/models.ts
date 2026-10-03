export interface LLMModel {
  id: string;
  name: string;
  provider: 'OpenAI' | 'Anthropic' | 'Google' | 'DeepSeek';
  version: string;
  badge: string;
  shortDescription: string;
  strengths: string[];
  bestFor: string;
  contextWindow: string;
  tokensPerSec: number;
  accentColor: string;
  tagline: string;
}

export interface ProjectFile {
  path: string;
  language: 'html' | 'tsx' | 'typescript' | 'sql' | 'css' | 'json';
  content: string;
}

export interface GenerationHistoryItem {
  id: string;
  timestamp: string;
  modelId: string;
  modelName: string;
  prompt: string;
  files: ProjectFile[];
  summary: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  prompt: string;
  selectedModelId: string; // Stored per project!
  updatedAt: string;
  files: ProjectFile[];
  activeFileIndex: number;
  history: GenerationHistoryItem[];
  deploymentSlug?: string;
}

export const LLM_MODELS: LLMModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    version: 'Omni 2026',
    badge: 'Full-Stack Logic',
    shortDescription: 'Industry-standard flagship model renowned for multi-step algorithmic reasoning, rigorous data schemas, and API contracts.',
    strengths: [
      'Robust full-stack architecture & data schemas',
      'Accurate API contract & state validation logic',
      'Comprehensive error handling and edge cases',
      'Strong cross-language and framework versatility'
    ],
    bestFor: 'Complex enterprise backends, data modeling, authentication, and CRUD business workflows.',
    contextWindow: '128K tokens',
    tokensPerSec: 112,
    accentColor: '#10B981', // Emerald
    tagline: 'Precision logic & full-stack schema design',
  },
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'Anthropic',
    version: 'Sonnet 3.7',
    badge: 'Frontend & Systems',
    shortDescription: 'The premier model for frontend engineering, design systems, responsive layouts, and accessible component state.',
    strengths: [
      'Superior visual design intuition & CSS/Tailwind polish',
      'Thoughtful component hierarchy & separation of concerns',
      'Keyboard accessibility (ARIA, focus rings, WCAG AA)',
      'Nuanced typography, spacing, and micro-interactions'
    ],
    bestFor: 'Modern SaaS dashboards, interactive web apps, slick user experiences, and responsive UI craft.',
    contextWindow: '200K tokens',
    tokensPerSec: 96,
    accentColor: '#D97706', // Amber
    tagline: 'Exceptional UI aesthetics & frontend craft',
  },
  {
    id: 'gemini-3-8-flash',
    name: 'Gemini 3.8 Flash',
    provider: 'Google',
    version: 'Flash 3.8',
    badge: 'Speed & Scale',
    shortDescription: 'Google’s next-generation multimodal powerhouse with massive context capacity and near-instantaneous streaming code throughput.',
    strengths: [
      'Sub-second code synthesis and high token throughput',
      'Vast 1M+ token context window for massive repositories',
      'Native Google ecosystem & serverless cloud optimization',
      'Efficient, modern vanilla JavaScript and reactive patterns'
    ],
    bestFor: 'Rapid prototyping, real-time code iteration, large multi-file projects, and high-frequency deployment.',
    contextWindow: '1M tokens',
    tokensPerSec: 165,
    accentColor: '#6366F1', // Indigo
    tagline: 'High-speed synthesis with massive context window',
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    version: 'Reasoning R1',
    badge: 'Quant & Algorithms',
    shortDescription: 'High-performance open reasoning model optimized for mathematical modeling, quantitative financial logic, and algorithmic efficiency.',
    strengths: [
      'Mathematical algorithms and duration/yield computations',
      'High density tabular displays and pure data matrices',
      'Transparent chain-of-thought architectural reasoning',
      'Cost-efficient high-density code generation'
    ],
    bestFor: 'Financial simulations, quant matrices, data visualization math, and compute-heavy logic.',
    contextWindow: '128K tokens',
    tokensPerSec: 140,
    accentColor: '#0EA5E9', // Sky
    tagline: 'Deep chain-of-thought mathematical reasoning',
  },
];

const STARTER_HTML_TREASURY = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TreasuryFlow — Autonomous FX & Liquidity Sweep</title>
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
        <div class="text-xs text-slate-400">ModelFlow · Generated with Claude 3.7 Sonnet</div>
        <h1 class="text-xl font-bold text-white tracking-tight">TreasuryFlow Liquidity Rebalancer</h1>
      </div>
      <div class="flex items-center gap-3">
        <select id="currencyFilter" onchange="renderVaults()" class="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none">
          <option value="ALL">All Currencies (4 Pools)</option>
          <option value="USD">USD — Federal Reserve</option>
          <option value="EUR">EUR — Frankfurt Target2</option>
          <option value="GBP">GBP — London CHAPS</option>
        </select>
        <button onclick="triggerAutomatedSweep()" class="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition cursor-pointer">
          Execute Yield Sweep
        </button>
      </div>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="p-4 rounded-lg border border-slate-800 bg-slate-900/60">
        <div class="text-xs text-slate-400">Total Treasury Liquidity</div>
        <div id="totalLiq" class="text-2xl font-bold mono text-white mt-1">$14,240,000.00</div>
        <div class="text-xs text-emerald-400 mt-1 mono">+4.95% blended APY</div>
      </div>
      <div class="p-4 rounded-lg border border-slate-800 bg-slate-900/60">
        <div class="text-xs text-slate-400">Active FX Forward Cover</div>
        <div class="text-2xl font-bold mono text-white mt-1">$3,850,000.00</div>
        <div class="text-xs text-slate-400 mt-1 mono">Zero open currency slippage</div>
      </div>
      <div class="p-4 rounded-lg border border-slate-800 bg-slate-900/60">
        <div class="text-xs text-slate-400">Estimated 30d Yield Pickup</div>
        <div id="yieldEst" class="text-2xl font-bold mono text-emerald-400 mt-1">+$58,740.00</div>
        <div class="text-xs text-slate-400 mt-1 mono">Next 4W T-Bill settlement in 8h</div>
      </div>
    </div>

    <div class="border border-slate-800 rounded-lg bg-slate-900/40 overflow-hidden">
      <div class="px-4 py-3 border-b border-slate-800 flex justify-between items-center">
        <span class="text-sm font-semibold">Active Institutional Custody Vaults</span>
        <span id="sweepAlert" class="text-xs text-amber-400 mono">Optimal ladder active</span>
      </div>
      <table class="w-full text-left text-xs border-collapse">
        <thead>
          <tr class="border-b border-slate-800 text-slate-400">
            <th class="py-3 px-4 font-medium">Vault Institution</th>
            <th class="py-3 px-3 font-medium">Currency</th>
            <th class="py-3 px-3 font-medium text-right">Balance</th>
            <th class="py-3 px-3 font-medium text-right">Net APY</th>
            <th class="py-3 px-4 font-medium text-right">Quick Sweep</th>
          </tr>
        </thead>
        <tbody id="vaultRows" class="divide-y divide-slate-800/80"></tbody>
      </table>
    </div>

    <div class="border border-slate-800 rounded-lg bg-slate-900/40 p-4 space-y-2">
      <div class="text-xs font-semibold text-slate-300">Automated Audit & Settlement Ledger</div>
      <div id="auditLog" class="space-y-1 text-xs mono text-slate-400"></div>
    </div>
  </div>

  <script>
    const vaults = [
      { id: 'v1', name: 'JPMorgan 4W Treasury Ladder', curr: 'USD', balance: 6850000, apy: 5.38 },
      { id: 'v2', name: 'Citibank Commercial Operating', curr: 'USD', balance: 2450000, apy: 4.82 },
      { id: 'v3', name: 'Deutsche Bank Euro Liquidity', curr: 'EUR', balance: 3200000, apy: 3.94 },
      { id: 'v4', name: 'Barclays Sterling Overnight Repo', curr: 'GBP', balance: 1740000, apy: 4.75 }
    ];
    const logs = [
      '10:35:12 UTC · Locked €1.2M EUR/USD forward @ 1.0872 for European subsidiary payroll',
      '09:12:00 UTC · Rebalanced $500,000 from Citibank Operating into 4W T-Bills (+56 bps pickup)'
    ];

    function fmt(n) {
      return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function renderVaults() {
      const f = document.getElementById('currencyFilter').value;
      const filtered = f === 'ALL' ? vaults : vaults.filter(v => v.curr === f);
      document.getElementById('vaultRows').innerHTML = filtered.map(v => \`
        <tr class="hover:bg-slate-800/40">
          <td class="py-3 px-4 font-semibold text-slate-200">\${v.name}</td>
          <td class="py-3 px-3 mono text-slate-400">\${v.curr}</td>
          <td class="py-3 px-3 text-right mono text-white">\${fmt(v.balance)}</td>
          <td class="py-3 px-3 text-right mono text-emerald-400">\${v.apy.toFixed(2)}%</td>
          <td class="py-3 px-4 text-right">
            <button onclick="boost('\${v.id}')" class="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer">+100K Sweep</button>
          </td>
        </tr>
      \`).join('');

      const total = vaults.reduce((s, x) => s + x.balance, 0);
      document.getElementById('totalLiq').textContent = fmt(total);
      document.getElementById('auditLog').innerHTML = logs.map(l => \`<div>\${l}</div>\`).join('');
    }

    function boost(id) {
      const v = vaults.find(x => x.id === id);
      if (v) {
        v.balance += 100000;
        logs.unshift(new Date().toISOString().slice(11, 19) + ' UTC · Allocated $100,000 to ' + v.name);
        renderVaults();
      }
    }

    function triggerAutomatedSweep() {
      vaults[0].balance += 450000;
      vaults[1].balance -= 450000;
      document.getElementById('sweepAlert').textContent = 'Yield sweep executed (+56 bps net pickup)';
      logs.unshift(new Date().toISOString().slice(11, 19) + ' UTC · Automated sweep: $450,000 shifted to highest yield rung');
      renderVaults();
    }

    renderVaults();
  </script>
</body>
</html>`;

const STARTER_TSX_TREASURY = `import React, { useState } from 'react';

interface Vault {
  id: string;
  name: string;
  currency: 'USD' | 'EUR' | 'GBP';
  balance: number;
  apy: number;
}

export function TreasuryConsole() {
  const [vaults, setVaults] = useState<Vault[]>([
    { id: 'v1', name: 'JPMorgan 4W Treasury Ladder', currency: 'USD', balance: 6850000, apy: 5.38 },
    { id: 'v2', name: 'Citibank Commercial Operating', currency: 'USD', balance: 2450000, apy: 4.82 },
    { id: 'v3', name: 'Deutsche Bank Euro Liquidity', currency: 'EUR', balance: 3200000, apy: 3.94 },
    { id: 'v4', name: 'Barclays Sterling Overnight Repo', currency: 'GBP', balance: 1740000, apy: 4.75 },
  ]);

  const totalBalance = vaults.reduce((acc, v) => acc + v.balance, 0);

  const handleSweep = (id: string, amount = 100000) => {
    setVaults(prev => prev.map(v => v.id === id ? { ...v, balance: v.balance + amount } : v));
  };

  return (
    <div className="p-6 bg-[#090D16] text-slate-100 min-h-screen">
      <header className="flex justify-between items-center pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold">TreasuryFlow Console</h1>
        <div className="font-mono text-sm">Total: \${totalBalance.toLocaleString()}</div>
      </header>
      {/* Interactive Vault List */}
    </div>
  );
}`;

const STARTER_SQL_TREASURY = `-- Treasury & Custody Liquidity Schema
CREATE TABLE vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name VARCHAR(128) NOT NULL,
  currency CHAR(3) NOT NULL,
  balance_cents BIGINT NOT NULL,
  net_apy_bps INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sweep_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_vault_id UUID REFERENCES vaults(id),
  target_vault_id UUID REFERENCES vaults(id),
  amount_cents BIGINT NOT NULL,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`;

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-treasury-flow',
    name: 'TreasuryFlow Console',
    description: 'Autonomous multi-currency liquidity rebalancer & automated T-Bill yield sweep engine.',
    prompt: 'Build an institutional treasury liquidity console with multi-currency vault balances, automated yield sweep simulations, and a live settlement audit log.',
    selectedModelId: 'claude-3-7-sonnet', // Claude stored for this project
    updatedAt: '2026-10-03T10:20:00Z',
    activeFileIndex: 0,
    files: [
      { path: 'index.html', language: 'html', content: STARTER_HTML_TREASURY },
      { path: 'src/TreasuryConsole.tsx', language: 'tsx', content: STARTER_TSX_TREASURY },
      { path: 'schema.sql', language: 'sql', content: STARTER_SQL_TREASURY }
    ],
    history: [
      {
        id: 'hist-1',
        timestamp: '2026-10-03T10:20:00Z',
        modelId: 'claude-3-7-sonnet',
        modelName: 'Claude 3.7 Sonnet',
        prompt: 'Build an institutional treasury liquidity console with multi-currency vault balances, automated yield sweep simulations, and a live settlement audit log.',
        files: [
          { path: 'index.html', language: 'html', content: STARTER_HTML_TREASURY }
        ],
        summary: 'Initial high-fidelity UI synthesis emphasizing refined typography, tabular figures, and interactive sweep triggers.'
      }
    ]
  },
  {
    id: 'proj-api-gateway',
    name: 'APISentry Rate Limiter',
    description: 'Enterprise API gateway console with dynamic token bucket rate-limiting and tier configurations.',
    prompt: 'Design an enterprise API gateway monitor with token bucket rate-limiting rules, live request throughput telemetry, and client key provisioning.',
    selectedModelId: 'gpt-4o', // GPT-4o stored for this project
    updatedAt: '2026-10-03T09:45:00Z',
    activeFileIndex: 0,
    files: [
      {
        path: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <title>APISentry — Dynamic Token Bucket Gateway</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #090D16; color: #F1F5F9; }
    .mono { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
  </style>
</head>
<body class="p-6 min-h-screen">
  <div class="max-w-5xl mx-auto space-y-6">
    <header class="flex items-center justify-between pb-4 border-b border-slate-800">
      <div>
        <div class="text-xs text-slate-400">ModelFlow · Generated with GPT-4o</div>
        <h1 class="text-xl font-bold text-white tracking-tight">APISentry Gateway & Rate Engine</h1>
      </div>
      <button onclick="addApiKey()" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer">
        + Provision Client Key
      </button>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="p-4 border border-slate-800 bg-slate-900/60 rounded-lg">
        <div class="text-xs text-slate-400">Total 24h Ingress Requests</div>
        <div class="text-2xl font-bold mono text-white mt-1">2,841,920</div>
        <div class="text-xs text-emerald-400 mt-1 mono">0.002% throttle rate</div>
      </div>
      <div class="p-4 border border-slate-800 bg-slate-900/60 rounded-lg">
        <div class="text-xs text-slate-400">Active Tenant Keys</div>
        <div id="keyCount" class="text-2xl font-bold mono text-white mt-1">4 Active</div>
        <div class="text-xs text-slate-400 mt-1 mono">Token bucket algorithm</div>
      </div>
      <div class="p-4 border border-slate-800 bg-slate-900/60 rounded-lg">
        <div class="text-xs text-slate-400">Median Gateway Overhead</div>
        <div class="text-2xl font-bold mono text-emerald-400 mt-1">1.8ms</div>
        <div class="text-xs text-slate-400 mt-1 mono">Global distributed Redis cache</div>
      </div>
    </div>

    <div class="border border-slate-800 rounded-lg bg-slate-900/40 overflow-hidden">
      <div class="px-4 py-3 border-b border-slate-800 flex justify-between items-center">
        <span class="text-sm font-semibold">Registered Client API Keys & Tier Limits</span>
        <span class="text-xs text-slate-400 mono">Enforcing HTTP 429 backpressure</span>
      </div>
      <table class="w-full text-left text-xs border-collapse">
        <thead>
          <tr class="border-b border-slate-800 text-slate-400">
            <th class="py-3 px-4 font-medium">Tenant / Client</th>
            <th class="py-3 px-3 font-medium">API Token Key</th>
            <th class="py-3 px-3 font-medium text-right">Quota / Min</th>
            <th class="py-3 px-3 font-medium text-right">Consumed</th>
            <th class="py-3 px-4 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody id="keysBody" class="divide-y divide-slate-800/80"></tbody>
      </table>
    </div>
  </div>
  <script>
    const keys = [
      { name: 'Acme Logistics Mobile App', key: 'sk_live_9948a7b1c', limit: 5000, used: 2410 },
      { name: 'Stripe Webhook Dispatcher', key: 'sk_live_0281b3c9d', limit: 20000, used: 8940 },
      { name: 'Partner Data Exporter', key: 'sk_live_6619f4e2a', limit: 1000, used: 940 },
      { name: 'Public Analytics Feed', key: 'sk_live_1184d0f8e', limit: 2500, used: 310 }
    ];
    function renderKeys() {
      document.getElementById('keysBody').innerHTML = keys.map((k, i) => \`
        <tr class="hover:bg-slate-800/40">
          <td class="py-3 px-4 font-semibold text-white">\${k.name}</td>
          <td class="py-3 px-3 mono text-slate-400">\${k.key}</td>
          <td class="py-3 px-3 text-right mono text-white">\${k.limit.toLocaleString()}</td>
          <td class="py-3 px-3 text-right mono \${k.used / k.limit > 0.8 ? 'text-amber-400' : 'text-emerald-400'}">\${k.used.toLocaleString()}</td>
          <td class="py-3 px-4 text-right">
            <button onclick="resetKey(\${i})" class="text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer">Flush Bucket</button>
          </td>
        </tr>
      \`).join('');
      document.getElementById('keyCount').textContent = keys.length + ' Active';
    }
    function resetKey(i) {
      keys[i].used = 0;
      renderKeys();
    }
    function addApiKey() {
      const idx = keys.length + 1;
      keys.push({
        name: 'Enterprise Client Tier #' + idx,
        key: 'sk_live_' + Math.random().toString(36).substring(2, 11),
        limit: 10000,
        used: 120
      });
      renderKeys();
    }
    renderKeys();
  </script>
</body>
</html>`
      }
    ],
    history: []
  },
  {
    id: 'proj-pulse-monitor',
    name: 'PulseFlow Edge Monitor',
    description: 'High-throughput edge health monitor with real-time ping matrix and incident alerts.',
    prompt: 'Create a high-speed edge health monitor displaying status across 12 global regions, latency histograms, and packet drop alerts.',
    selectedModelId: 'gemini-3-8-flash', // Gemini stored for this project
    updatedAt: '2026-10-03T08:15:00Z',
    activeFileIndex: 0,
    files: [
      {
        path: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <title>PulseFlow — Global Edge Telemetry</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #090D16; color: #F1F5F9; }
    .mono { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
  </style>
</head>
<body class="p-6 min-h-screen">
  <div class="max-w-5xl mx-auto space-y-6">
    <header class="flex items-center justify-between pb-4 border-b border-slate-800">
      <div>
        <div class="text-xs text-slate-400">ModelFlow · Generated with Gemini 3.8 Flash</div>
        <h1 class="text-xl font-bold text-white tracking-tight">PulseFlow Global Edge Health</h1>
      </div>
      <button onclick="pingAll()" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer">
        Ping 12 Global PoPs
      </button>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="p-4 border border-slate-800 bg-slate-900/60 rounded-lg">
        <div class="text-xs text-slate-400">Global Operational SLA</div>
        <div class="text-2xl font-bold mono text-emerald-400 mt-1">99.994%</div>
        <div class="text-xs text-slate-400 mt-1 mono">All 12 regions green</div>
      </div>
      <div class="p-4 border border-slate-800 bg-slate-900/60 rounded-lg">
        <div class="text-xs text-slate-400">Median RTT Latency</div>
        <div id="medRtt" class="text-2xl font-bold mono text-white mt-1">16.4ms</div>
        <div class="text-xs text-slate-400 mt-1 mono">BGP Anycast routing</div>
      </div>
      <div class="p-4 border border-slate-800 bg-slate-900/60 rounded-lg">
        <div class="text-xs text-slate-400">Edge Synthesis Model</div>
        <div class="text-base font-bold text-indigo-400 mt-1.5">Gemini 3.8 Flash</div>
        <div class="text-xs text-slate-400 mt-0.5">High-speed stream generation</div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3" id="nodesGrid"></div>
  </div>
  <script>
    const nodes = [
      { code: 'iad-01', name: 'US East (N. Virginia)', rtt: 12.1, status: 'Nominal' },
      { code: 'sfo-02', name: 'US West (San Francisco)', rtt: 18.4, status: 'Nominal' },
      { code: 'fra-01', name: 'EU Central (Frankfurt)', rtt: 21.0, status: 'Nominal' },
      { code: 'lhr-02', name: 'UK (London)', rtt: 19.8, status: 'Nominal' },
      { code: 'sin-01', name: 'APAC (Singapore)', rtt: 28.4, status: 'Nominal' },
      { code: 'hnd-01', name: 'APAC (Tokyo)', rtt: 24.2, status: 'Nominal' }
    ];
    function render() {
      document.getElementById('nodesGrid').innerHTML = nodes.map(n => \`
        <div class="p-3 border border-slate-800 bg-slate-900/50 rounded-lg space-y-1">
          <div class="flex justify-between items-center text-xs">
            <span class="mono font-semibold text-white">\${n.code}</span>
            <span class="text-emerald-400 mono">\${n.rtt.toFixed(1)}ms</span>
          </div>
          <div class="text-xs text-slate-400 truncate">\${n.name}</div>
        </div>
      \`).join('');
    }
    function pingAll() {
      nodes.forEach(n => {
        n.rtt = Math.max(9, +(n.rtt + (Math.random() * 4 - 2)).toFixed(1));
      });
      const avg = (nodes.reduce((s, n) => s + n.rtt, 0) / nodes.length).toFixed(1);
      document.getElementById('medRtt').textContent = avg + 'ms';
      render();
    }
    render();
  </script>
</body>
</html>`
      }
    ],
    history: []
  }
];

export function getStoredProjects(): Project[] {
  try {
    const raw = localStorage.getItem('modelflow_projects_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return INITIAL_PROJECTS;
}

export function saveStoredProjects(projects: Project[]): void {
  try {
    localStorage.setItem('modelflow_projects_v1', JSON.stringify(projects));
  } catch {
    // ignore
  }
}
