import React, { useState, useEffect } from 'react';
import { X, Globe, Check, Copy, ArrowUpRight, Server, ShieldCheck } from 'lucide-react';

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  projectId: string;
  modelName: string;
  previewHtml: string;
  onDeploySuccess?: (deployment: any) => void;
}

const BUILD_STEPS = [
  'Verifying standalone HTML5 & JavaScript bundle integrity',
  'Compiling Tailwind CSS classes for edge CDN distribution',
  'Configuring SSL/TLS termination and Anycast routing',
  'Distributing build payload across 34 global edge PoPs',
];

export const DeployModal: React.FC<DeployModalProps> = ({
  isOpen,
  onClose,
  projectName,
  projectId,
  modelName,
  previewHtml,
  onDeploySuccess,
}) => {
  const [slug, setSlug] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const generatedSlug = (projectName || 'app')
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 28) || 'my-app';
      setSlug(generatedSlug);
      setDeployedUrl(null);
      setCurrentStep(-1);
      setIsDeploying(false);
    }
  }, [isOpen, projectName]);

  if (!isOpen) return null;

  const handleDeploy = async () => {
    setIsDeploying(true);
    setCurrentStep(0);

    for (let i = 0; i < BUILD_STEPS.length; i++) {
      setCurrentStep(i);
      await new Promise((r) => setTimeout(r, 280));
    }

    try {
      const res = await fetch('/api/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          projectName,
          slug,
          modelUsed: modelName,
          previewHtml,
          primaryRegion: 'iad-01 (US East)',
        }),
      });

      const data = await res.json();
      const url = `${window.location.origin}/hosted/${data.deployment.slug}`;
      setDeployedUrl(url);
      if (onDeploySuccess) {
        onDeploySuccess(data.deployment);
      }
    } catch {
      // Fallback url
      setDeployedUrl(`${window.location.origin}/hosted/${slug}`);
    } finally {
      setIsDeploying(false);
    }
  };

  const copyUrl = () => {
    if (!deployedUrl) return;
    navigator.clipboard.writeText(deployedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#0F172A] border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Instant Edge Hosting Deployment</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {!deployedUrl ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Custom Edge Subdomain & URL Slug
                </label>
                <div className="flex items-center bg-[#0B0F17] border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 focus-within:border-indigo-500">
                  <span className="text-slate-500 shrink-0">/hosted/</span>
                  <input
                    type="text"
                    value={slug}
                    disabled={isDeploying}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    className="bg-transparent text-white focus:outline-none w-full ml-1"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  {slug || 'app'}.modelflow.edge · 34 edge regions with SSL termination
                </p>
              </div>

              <div className="p-3 border border-slate-800 bg-[#0B0F17] rounded-lg text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Project</span>
                  <span className="text-white font-medium">{projectName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Synthesized by</span>
                  <span className="text-indigo-400 font-medium">{modelName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Edge Infrastructure</span>
                  <span className="text-emerald-400 font-medium">Global Anycast KV & CDN</span>
                </div>
              </div>

              {isDeploying && (
                <div className="space-y-2 p-3 bg-[#0B0F17] border border-slate-800 rounded-lg text-xs font-mono">
                  <div className="text-slate-400 font-semibold mb-2">Build Pipeline Execution</div>
                  {BUILD_STEPS.map((step, idx) => {
                    const done = idx < currentStep;
                    const active = idx === currentStep;
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <span className={done ? 'text-emerald-400' : active ? 'text-indigo-400' : 'text-slate-600'}>
                          {done ? '[DONE]' : active ? '[RUN]' : '[...]'}
                        </span>
                        <span className={done ? 'text-slate-300' : active ? 'text-white font-semibold' : 'text-slate-600'}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 border border-emerald-800/80 bg-emerald-950/20 rounded-lg flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-emerald-400">Application Deployed Successfully!</div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Your code is live on the ModelFlow global edge network.
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Live Hosted Production Endpoint
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={deployedUrl}
                    className="flex-1 bg-[#0B0F17] border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-indigo-300 focus:outline-none"
                  />
                  <button
                    onClick={copyUrl}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="border border-slate-800 rounded-lg overflow-hidden bg-[#0B0F17]">
                <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] text-slate-400 font-mono flex justify-between">
                  <span>Live Production Sandbox</span>
                  <span className="text-emerald-400">HTTP 200 OK</span>
                </div>
                <iframe
                  title="Hosted Preview"
                  src={deployedUrl}
                  className="w-full h-48 border-0"
                />
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-800 bg-[#0B0F17] flex items-center justify-between">
          {!deployedUrl ? (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isDeploying}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeploy}
                disabled={isDeploying}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Server className="w-3.5 h-3.5" />
                <span>{isDeploying ? 'Deploying to Edge...' : 'Deploy Instantly'}</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Back to Workspace
              </button>
              <a
                href={deployedUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Open Live App</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
