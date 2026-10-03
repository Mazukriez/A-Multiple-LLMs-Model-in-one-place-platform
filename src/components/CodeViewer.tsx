import React, { useState } from 'react';
import { Copy, Check, Save, Download, Eye, Code, Terminal, Sparkles } from 'lucide-react';
import { ProjectFile } from '../data/models';

interface CodeViewerProps {
  files: ProjectFile[];
  activeFileIndex: number;
  onSelectFileIndex: (index: number) => void;
  onUpdateFileContent: (newContent: string) => void;
  onSaveToProject: () => void;
  selectedModelName: string;
  isSaved: boolean;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  files,
  activeFileIndex,
  onSelectFileIndex,
  onUpdateFileContent,
  onSaveToProject,
  selectedModelName,
  isSaved,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'code' | 'preview'>('split');

  const currentFile = files[activeFileIndex] || files[0];
  const htmlFile = files.find((f) => f.path.endsWith('.html')) || files[0];

  const handleCopy = () => {
    if (!currentFile) return;
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!currentFile) return;
    const blob = new Blob([currentFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFile.path.split('/').pop() || 'code.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Generate line numbers for readable code format
  const lineCount = (currentFile?.content || '').split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="flex-1 flex flex-col bg-[#0B0F17] overflow-hidden border-t lg:border-t-0 border-slate-800">
      {/* Top File & View Bar */}
      <div className="h-12 px-4 border-b border-slate-800 bg-[#0F172A] flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* File Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {files.map((file, idx) => {
            const isSelected = activeFileIndex === idx;
            return (
              <button
                key={file.path}
                type="button"
                onClick={() => onSelectFileIndex(idx)}
                className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-800 text-indigo-300 font-semibold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span>{file.path}</span>
              </button>
            );
          })}
        </div>

        {/* View Mode Controls & Actions */}
        <div className="flex items-center gap-2">
          {/* Segmented View Mode */}
          <div className="flex items-center gap-1 p-0.5 bg-[#0B0F17] border border-slate-800 rounded-md">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                viewMode === 'split' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Split Code & Live Sandbox"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('code')}
              className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                viewMode === 'code' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Code View Only"
            >
              <Code className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Code</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                viewMode === 'preview' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Live Preview Only"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Live Sandbox</span>
            </button>
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            title="Copy current file contents to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>

          {/* Save to Project Button */}
          <button
            type="button"
            onClick={onSaveToProject}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              isSaved
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white font-semibold'
            }`}
            title="Save code edits to current project"
          >
            {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaved ? 'Saved to Project' : 'Save to Project'}</span>
          </button>

          {/* Download File */}
          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 text-slate-400 hover:text-white rounded bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer"
            title="Download file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor with Line Numbers */}
        {(viewMode === 'code' || viewMode === 'split') && (
          <div
            className={`${
              viewMode === 'split' ? 'w-full lg:w-1/2 border-r border-slate-800' : 'w-full'
            } h-full flex flex-col bg-[#0B0F17] overflow-hidden`}
          >
            <div className="px-4 py-1.5 bg-[#0F172A]/70 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Synthesized by {selectedModelName} · {currentFile?.path}
              </span>
              <span>{lineCount} lines · UTF-8</span>
            </div>

            <div className="flex-1 flex overflow-hidden font-mono text-xs">
              {/* Line numbers gutter */}
              <div className="w-12 py-4 bg-[#090D14] border-r border-slate-800 text-right pr-3 select-none text-slate-600 overflow-hidden shrink-0">
                {lineNumbers.map((num) => (
                  <div key={num} className="leading-5 h-5">
                    {num}
                  </div>
                ))}
              </div>

              {/* Editable Code Content */}
              <textarea
                value={currentFile?.content || ''}
                onChange={(e) => onUpdateFileContent(e.target.value)}
                spellCheck={false}
                className="flex-1 w-full p-4 bg-[#0B0F17] text-slate-200 leading-5 focus:outline-none resize-none overflow-auto font-mono text-xs"
              />
            </div>
          </div>
        )}

        {/* Live Interactive Application Sandbox */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div
            className={`${
              viewMode === 'split' ? 'w-full lg:w-1/2' : 'w-full'
            } h-full flex flex-col bg-[#070A10] overflow-hidden`}
          >
            <div className="px-4 py-1.5 bg-[#0F172A]/70 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Interactive Application Sandbox (Live Execution)</span>
              <span className="text-emerald-400">Sandbox Ready</span>
            </div>
            <div className="flex-1 p-3 bg-[#070A10] overflow-hidden">
              <div className="w-full h-full border border-slate-800 rounded-lg overflow-hidden bg-[#090D16]">
                <iframe
                  title="Live Application Preview"
                  srcDoc={htmlFile?.content || ''}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
