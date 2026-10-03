import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Zap, Sparkles, Cpu, Layers } from 'lucide-react';
import { LLM_MODELS, LLMModel } from '../data/models';

interface LLMSelectorDropdownProps {
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  className?: string;
  compact?: boolean;
}

export const LLMSelectorDropdown: React.FC<LLMSelectorDropdownProps> = ({
  selectedModelId,
  onSelectModel,
  className = '',
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedModel =
    LLM_MODELS.find((m) => m.id === selectedModelId) || LLM_MODELS[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'Anthropic':
        return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
      case 'OpenAI':
        return <Cpu className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Google':
        return <Zap className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-sky-400" />;
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-3 px-3 py-2 bg-[#0B0F17] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-left transition-colors cursor-pointer focus:outline-none focus:border-indigo-500"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: selectedModel.accentColor }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-white truncate">
                {selectedModel.name}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                ({selectedModel.provider})
              </span>
            </div>
            {!compact && (
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {selectedModel.tagline}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 text-slate-400 shrink-0">
          <span className="text-[11px] font-mono tabular-nums hidden sm:inline">
            {selectedModel.tokensPerSec} tok/s
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-white' : ''
            }`}
          />
        </div>
      </button>

      {/* Popover Menu with Model Strengths */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 w-full min-w-[340px] max-w-lg bg-[#0F172A] border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden animate-in fade-in duration-150">
          <div className="px-4 py-3 bg-[#0B0F17] border-b border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-white">
                Choose Code Generation LLM Engine
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Saved automatically for the active project
              </div>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {LLM_MODELS.length} Available Models
            </span>
          </div>

          <div className="p-2 space-y-1.5 max-h-[460px] overflow-y-auto">
            {LLM_MODELS.map((model) => {
              const isSelected = model.id === selectedModelId;
              return (
                <div
                  key={model.id}
                  onClick={() => {
                    onSelectModel(model.id);
                    setIsOpen(false);
                  }}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500/80 shadow-sm'
                      : 'bg-[#0B0F17]/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-slate-800/80">
                        {getProviderIcon(model.provider)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            {model.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {model.provider} · {model.version}
                          </span>
                        </div>
                        <span
                          className="text-[10px] font-semibold tracking-wide uppercase mt-0.5 inline-block"
                          style={{ color: model.accentColor }}
                        >
                          {model.badge}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                        {model.contextWindow}
                      </span>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-700 shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Model Strengths Description */}
                  <p className="text-xs text-slate-300 leading-relaxed mb-2">
                    {model.shortDescription}
                  </p>

                  <div className="space-y-1 mb-2">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Key Strengths
                    </div>
                    <ul className="grid grid-cols-1 gap-1 text-[11px] text-slate-300">
                      {model.strengths.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span
                            className="mt-1 w-1 h-1 rounded-full shrink-0"
                            style={{ backgroundColor: model.accentColor }}
                          />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate mr-2">
                      <strong className="text-slate-300 font-medium">Best for:</strong> {model.bestFor}
                    </span>
                    <span className="font-mono tabular-nums shrink-0 text-slate-300">
                      {model.tokensPerSec} tok/s
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
