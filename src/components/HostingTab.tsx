import React, { useState, useEffect } from 'react';
import { Globe, Copy, Check, Trash2, ArrowUpRight, Plus, Server, RefreshCw } from 'lucide-react';

interface Deployment {
  id: string;
  projectId: string;
  projectName: string;
  slug: string;
  subdomain: string;
  version: string;
  modelUsed: string;
  status: string;
  regionCount: number;
  primaryRegion: string;
  deployedAt: string;
  buildDurationMs: number;
  bundleSizeKb: number;
  requests24h: number;
  p95LatencyMs: number;
}

interface HostingTabProps {
  onOpenDeployModal: () => void;
}

export const HostingTab: React.FC<HostingTabProps> = ({ onOpenDeployModal }) => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchDeployments = () => {
    setIsLoading(true);
    fetch('/api/deployments')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.deployments)) {
          setDeployments(data.deployments);
        }
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchDeployments();
  }, []);

  const handleCopyUrl = (slug: string, id: string) => {
    const url = `${window.location.origin}/hosted/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/deployments/${id}`, { method: 'DELETE' }).catch(() => {});
    setDeployments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="text-xs text-slate-400">
            ModelFlow Cloud · 34 Global Edge PoPs · Anycast Routing & Sub-20ms Cold Starts
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Integrated Edge Hosting Endpoints
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDeployments}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
            title="Refresh deployments"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onOpenDeployModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Deploy Active Project</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 border border-slate-800 bg-[#0F172A] rounded-xl">
          <div className="text-xs text-slate-400">Total Live Deployments</div>
          <div className="text-2xl font-bold mono text-white mt-1 tabular-nums">
            {deployments.length}
          </div>
          <div className="text-xs text-emerald-400 mt-1">100% active edge endpoints</div>
        </div>

        <div className="p-4 border border-slate-800 bg-[#0F172A] rounded-xl">
          <div className="text-xs text-slate-400">Edge Network Ingress</div>
          <div className="text-2xl font-bold mono text-white mt-1 tabular-nums">
            {deployments.reduce((sum, d) => sum + (d.requests24h || 0), 0).toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">24-hour global requests</div>
        </div>

        <div className="p-4 border border-slate-800 bg-[#0F172A] rounded-xl">
          <div className="text-xs text-slate-400">Integrated Route Schema</div>
          <div className="text-sm font-semibold mono text-indigo-400 mt-2 truncate">
            /hosted/:slug
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Standalone HTML5/JS delivery</div>
        </div>
      </div>

      {/* Deployments List */}
      <div className="border border-slate-800 rounded-xl bg-[#0F172A] overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Active Edge Endpoints ({deployments.length})</span>
          <span>Automatic SSL / TLS Active</span>
        </div>

        {deployments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Server className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-sm font-bold text-white">No active deployments yet</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Generate an application in the Code Studio and deploy it instantly with one click.
            </p>
            <button
              onClick={onOpenDeployModal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Deploy First App
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {deployments.map((dep) => {
              const liveUrl = `${window.location.origin}/hosted/${dep.slug}`;
              return (
                <div
                  key={dep.id}
                  className="p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {dep.projectName}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {dep.version}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-indigo-400">{dep.subdomain}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-400">/hosted/{dep.slug}</span>
                    </div>

                    <div className="text-xs text-slate-400">
                      Generated by <strong className="text-slate-300">{dep.modelUsed}</strong> ·{' '}
                      {dep.regionCount} edge locations · {dep.bundleSizeKb} KB bundle
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyUrl(dep.slug, dep.id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedId === dep.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedId === dep.id ? 'Copied' : 'Copy URL'}</span>
                    </button>

                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Visit Live</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => handleDelete(dep.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Tear down deployment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
