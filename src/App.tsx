import React, { useState, useEffect } from 'react';
import {
  Play,
  Globe,
  Plus,
  RefreshCw,
  FolderOpen,
  Sparkles,
  Check,
  Server,
  Layers,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import {
  LLM_MODELS,
  Project,
  INITIAL_PROJECTS,
  getStoredProjects,
  saveStoredProjects,
  ProjectFile,
} from './data/models';
import { LLMSelectorDropdown } from './components/LLMSelectorDropdown';
import { CodeViewer } from './components/CodeViewer';
import { DeployModal } from './components/DeployModal';
import { HostingTab } from './components/HostingTab';

const PRESET_IDEAS = [
  {
    title: 'Autonomous Treasury Sweep',
    prompt: 'Build an institutional treasury console with multi-currency vault balances, automated yield sweep simulations, and a live settlement audit log.',
    suggestedModel: 'claude-3-7-sonnet',
  },
  {
    title: 'API Gateway Rate Limiter',
    prompt: 'Design an enterprise API gateway monitor with token bucket rate-limiting rules, live request throughput telemetry, and client key provisioning.',
    suggestedModel: 'gpt-4o',
  },
  {
    title: 'Global Edge Health Telemetry',
    prompt: 'Create a high-speed edge health monitor displaying status across 12 global regions, latency histograms, and packet drop alerts.',
    suggestedModel: 'gemini-3-8-flash',
  },
  {
    title: 'Options Greeks & Volatility Matrix',
    prompt: 'Build a quantitative options risk matrix with Black-Scholes Delta/Gamma/Vega sliders, implied volatility skew, and Monte Carlo payoff scenarios.',
    suggestedModel: 'deepseek-r1',
  },
];

export function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'hosting' | 'models'>('studio');
  const [projects, setProjects] = useState<Project[]>(() => getStoredProjects());
  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    const list = getStoredProjects();
    return list[0]?.id || INITIAL_PROJECTS[0].id;
  });

  // Current active project
  const currentProject =
    projects.find((p) => p.id === activeProjectId) || projects[0] || INITIAL_PROJECTS[0];

  // Natural language idea prompt state
  const [promptText, setPromptText] = useState<string>(currentProject?.prompt || '');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(true);

  // Deploy modal state
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  // Save projects to localStorage whenever changed
  useEffect(() => {
    saveStoredProjects(projects);
  }, [projects]);

  // Sync prompt text when active project changes
  useEffect(() => {
    if (currentProject) {
      setPromptText(currentProject.prompt);
      setIsSaved(true);
    }
  }, [activeProjectId]);

  // Selected LLM Model object for the current project
  const currentModel =
    LLM_MODELS.find((m) => m.id === currentProject.selectedModelId) || LLM_MODELS[0];

  // Handler: Change the selected LLM model for the current project (persisting choice per project)
  const handleSelectModel = (modelId: string) => {
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id === currentProject.id
          ? { ...proj, selectedModelId: modelId, updatedAt: new Date().toISOString() }
          : proj
      )
    );
  };

  // Handler: Switch active project
  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
  };

  // Handler: Create a new project
  const handleCreateNewProject = () => {
    const newId = `proj-${Date.now()}`;
    const newProject: Project = {
      id: newId,
      name: `Untitled Project #${projects.length + 1}`,
      description: 'New AI application workspace',
      prompt: 'Build a modern SaaS task automation workflow with state boards and webhook logs.',
      selectedModelId: 'gpt-4o', // default for new projects
      updatedAt: new Date().toISOString(),
      activeFileIndex: 0,
      files: [
        {
          path: 'index.html',
          language: 'html',
          content: `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <title>New Project</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="p-6 bg-[#090D16] text-white">
  <div class="max-w-4xl mx-auto space-y-4">
    <h1 class="text-xl font-bold">New Project Workspace</h1>
    <p class="text-xs text-slate-400">Describe your application idea on the left and click "Initiate Code Generation".</p>
  </div>
</body>
</html>`,
        },
      ],
      history: [],
    };

    setProjects((prev) => [newProject, ...prev]);
    setActiveProjectId(newId);
    setPromptText(newProject.prompt);
  };

  // Handler: Initiate Code Generation with the project's selected LLM
  const handleInitiateCodeGeneration = async (overridePrompt?: string) => {
    const finalPrompt = (overridePrompt ?? promptText).trim();
    if (!finalPrompt) return;

    setIsGenerating(true);
    setGenerationStatus(`Connecting to ${currentModel.name} (${currentModel.provider})...`);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          modelId: currentProject.selectedModelId,
          projectName: currentProject.name,
          currentCode: currentProject.files[currentProject.activeFileIndex]?.content,
        }),
      });

      const data = await response.json();

      const newFiles: ProjectFile[] = data.files && data.files.length > 0 ? data.files : [
        { path: 'index.html', language: 'html', content: data.previewHtml },
      ];

      // Update current project with the newly generated code
      setProjects((prev) =>
        prev.map((proj) => {
          if (proj.id !== currentProject.id) return proj;
          return {
            ...proj,
            name: data.appName || proj.name,
            prompt: finalPrompt,
            updatedAt: new Date().toISOString(),
            files: newFiles,
            activeFileIndex: 0,
            history: [
              {
                id: `hist-${Date.now()}`,
                timestamp: new Date().toISOString(),
                modelId: currentModel.id,
                modelName: currentModel.name,
                prompt: finalPrompt,
                files: newFiles,
                summary: data.architectureSummary || 'Code generated successfully.',
              },
              ...proj.history,
            ],
          };
        })
      );

      setIsSaved(true);
    } catch (err) {
      console.error('Code generation failed:', err);
    } finally {
      setIsGenerating(false);
      setGenerationStatus(null);
    }
  };

  // Handler: Update active file content (editable code)
  const handleUpdateFileContent = (newContent: string) => {
    setIsSaved(false);
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== currentProject.id) return proj;
        const updatedFiles = proj.files.map((file, idx) =>
          idx === proj.activeFileIndex ? { ...file, content: newContent } : file
        );
        return {
          ...proj,
          files: updatedFiles,
        };
      })
    );
  };

  // Handler: Save to project
  const handleSaveToProject = () => {
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id === currentProject.id
          ? { ...proj, updatedAt: new Date().toISOString(), prompt: promptText }
          : proj
      )
    );
    setIsSaved(true);
  };

  // Handler: Select file index tab
  const handleSelectFileIndex = (index: number) => {
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id === currentProject.id ? { ...proj, activeFileIndex: index } : proj
      )
    );
  };

  const previewHtmlContent =
    currentProject.files.find((f) => f.path.endsWith('.html'))?.content ||
    currentProject.files[0]?.content ||
    '';

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100">
      {/* Top Bar Contract: Brand Wordmark (Zone 1) — Nav Links (Zone 2) — Action (Zone 3) */}
      <header className="h-14 px-6 border-b border-slate-800 bg-[#0B0F17] flex items-center justify-between shrink-0">
        <a
          href="#studio"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('studio');
          }}
          className="text-lg font-bold tracking-tight text-white font-display flex items-center gap-2"
        >
          <span>ModelFlow</span>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-6 text-xs font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('studio')}
            className={`py-1 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'studio'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'hover:text-slate-200'
            }`}
          >
            Code Studio
          </button>
          <button
            onClick={() => setActiveTab('hosting')}
            className={`py-1 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'hosting'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'hover:text-slate-200'
            }`}
          >
            Edge Hosting
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className={`py-1 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'models'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'hover:text-slate-200'
            }`}
          >
            Model Strengths
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCreateNewProject}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            + New Project
          </button>
          <button
            onClick={() => setIsDeployModalOpen(true)}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Deploy to Edge</span>
          </button>
        </div>
      </header>

      {/* Main Studio Workspace */}
      {activeTab === 'studio' && (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Code Generation Sidebar */}
          <aside className="w-full lg:w-[420px] xl:w-[460px] border-b lg:border-b-0 lg:border-r border-slate-800 bg-[#0F172A] flex flex-col shrink-0 overflow-y-auto">
            <div className="p-5 space-y-6">
              {/* Project Selection */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
                    Active Project
                  </span>
                  <span className="font-mono tabular-nums text-slate-400">
                    {projects.length} Projects
                  </span>
                </div>
                <select
                  value={currentProject.id}
                  onChange={(e) => handleSelectProject(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                >
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name} (Using {proj.selectedModelId})
                    </option>
                  ))}
                </select>
              </div>

              {/* LLM Model Dropdown Component (Requirement 1 & 2) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Code Generation LLM Provider
                  </label>
                  <span className="text-[11px] text-emerald-400 font-mono">
                    Stored per project
                  </span>
                </div>

                {/* Custom LLM Selector Dropdown Component */}
                <LLMSelectorDropdown
                  selectedModelId={currentProject.selectedModelId}
                  onSelectModel={handleSelectModel}
                />

                {/* Brief description of the selected LLM's strengths */}
                <div className="p-3 bg-[#0B0F17] border border-slate-800/80 rounded-lg text-xs space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">
                      {currentModel.name} Specialty
                    </span>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wide"
                      style={{ color: currentModel.accentColor }}
                    >
                      {currentModel.badge}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {currentModel.shortDescription}
                  </p>
                  <div className="text-[11px] text-slate-400 border-t border-slate-800/60 pt-1.5">
                    <strong className="text-slate-300">Key Strengths:</strong>{' '}
                    {currentModel.strengths.slice(0, 2).join(' · ')}
                  </div>
                </div>
              </div>

              {/* Natural Language Idea Input (Requirement 3) */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label htmlFor="ideaPrompt" className="text-xs font-semibold text-slate-200">
                    Application Idea & Prompt
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Natural Language
                  </span>
                </div>

                <textarea
                  id="ideaPrompt"
                  rows={4}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Describe your application idea, data structures, and interactive UI..."
                  className="w-full bg-[#0B0F17] border border-slate-800 rounded-lg p-3 text-xs text-slate-100 leading-relaxed focus:outline-none focus:border-indigo-500 resize-y font-sans"
                />

                {/* Quick Idea Templates */}
                <div className="space-y-1">
                  <div className="text-[11px] text-slate-400 font-medium">
                    Try a Quick Application Blueprint:
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {PRESET_IDEAS.map((preset) => (
                      <button
                        key={preset.title}
                        type="button"
                        onClick={() => {
                          setPromptText(preset.prompt);
                          handleSelectModel(preset.suggestedModel);
                        }}
                        className="text-left px-2.5 py-1.5 bg-[#0B0F17] hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 rounded text-xs text-slate-300 transition-colors cursor-pointer flex items-center justify-between group"
                      >
                        <span className="truncate">{preset.title}</span>
                        <span className="text-[10px] text-slate-400 group-hover:text-indigo-300 font-mono shrink-0 ml-2">
                          {preset.suggestedModel.split('-')[0].toUpperCase()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Initiate Code Generation Button */}
                <button
                  type="button"
                  onClick={() => handleInitiateCodeGeneration()}
                  disabled={isGenerating}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{generationStatus || 'Generating Code...'}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Generate Code with {currentModel.name}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Generation History for Project */}
              {currentProject.history.length > 0 && (
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-slate-200">
                    Project Generation Runs ({currentProject.history.length})
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {currentProject.history.map((hist) => (
                      <div
                        key={hist.id}
                        className="p-2 bg-[#0B0F17] border border-slate-800 rounded text-xs space-y-0.5"
                      >
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span className="font-semibold text-indigo-300">
                            {hist.modelName}
                          </span>
                          <span className="font-mono tabular-nums">
                            {new Date(hist.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 truncate">
                          {hist.prompt}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Right Code Viewer & Live Interactive Sandbox (Requirement 3) */}
          <main className="flex-1 flex flex-col bg-[#0B0F17] overflow-hidden">
            <CodeViewer
              files={currentProject.files}
              activeFileIndex={currentProject.activeFileIndex}
              onSelectFileIndex={handleSelectFileIndex}
              onUpdateFileContent={handleUpdateFileContent}
              onSaveToProject={handleSaveToProject}
              selectedModelName={currentModel.name}
              isSaved={isSaved}
            />
          </main>
        </div>
      )}

      {/* Edge Hosting Management View */}
      {activeTab === 'hosting' && (
        <div className="flex-1 overflow-y-auto">
          <HostingTab onOpenDeployModal={() => setIsDeployModalOpen(true)} />
        </div>
      )}

      {/* Model Strengths Reference Matrix View */}
      {activeTab === 'models' && (
        <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto space-y-6">
          <div className="pb-5 border-b border-slate-800">
            <div className="text-xs text-slate-400">
              Integrated LLM Engine Comparison · Benchmark Speeds & Architectural Strengths
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">
              Multi-LLM Strengths & Provider Matrix
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {LLM_MODELS.map((model) => (
              <div
                key={model.id}
                className="p-6 bg-[#0F172A] border border-slate-800 rounded-xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-white">{model.name}</h2>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {model.provider} · {model.version}
                      </div>
                    </div>
                    <span
                      className="px-2.5 py-1 text-xs font-semibold rounded uppercase tracking-wider"
                      style={{
                        backgroundColor: `${model.accentColor}18`,
                        color: model.accentColor,
                      }}
                    >
                      {model.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {model.shortDescription}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                    <div className="text-xs font-semibold text-slate-200">
                      Core Engineering Strengths
                    </div>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {model.strengths.map((str, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span
                            className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: model.accentColor }}
                          />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                    <strong className="text-slate-300">Recommended for:</strong>{' '}
                    {model.bestFor}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400">
                    Window: {model.contextWindow}
                  </span>
                  <button
                    onClick={() => {
                      handleSelectModel(model.id);
                      setActiveTab('studio');
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Use for {currentProject.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deploy to Edge Modal */}
      <DeployModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        projectName={currentProject.name}
        projectId={currentProject.id}
        modelName={currentModel.name}
        previewHtml={previewHtmlContent}
        onDeploySuccess={() => {
          // Handled in modal
        }}
      />
    </div>
  );
}

export default App;
