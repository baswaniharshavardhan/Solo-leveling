import React, { useState } from 'react';
import { ARCHITECTURE_DATA } from '../../utils/starterCodeData';
import { sounds } from '../../utils/soundEffects';
import { Code, Database, Layout, Copy, Check, X, FileText, Smartphone, ArrowLeft } from 'lucide-react';

interface ArchitectureModalProps {
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'DATABASE' | 'UI_FLOW' | 'REACT_NATIVE' | 'FLUTTER'>('DATABASE');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    sounds.playStatAdd();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-4xl system-window rounded-2xl p-6 md:p-8 relative border border-cyan-500/50 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-500/40 mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { sounds.playStatAdd(); onClose(); }}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs font-bold font-orbitron text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-cyan-400" />
              <div>
                <h2 className="text-base md:text-lg font-black font-orbitron text-white">
                  MOBILE ARCHITECTURE & STARTER CODE HUB
                </h2>
                <p className="text-xs text-slate-400 font-rajdhani">
                  Senior Mobile Developer Blueprint: Database schema, User flow & Production starter code
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => { sounds.playStatAdd(); onClose(); }}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <button
            onClick={() => { setActiveTab('DATABASE'); sounds.playStatAdd(); }}
            className={`py-2 px-3 rounded-xl text-xs font-bold font-orbitron transition flex items-center justify-center gap-1.5 ${
              activeTab === 'DATABASE'
                ? 'bg-cyan-600 text-slate-950 font-black shadow-md shadow-cyan-900/40'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>SQLite Schema</span>
          </button>

          <button
            onClick={() => { setActiveTab('UI_FLOW'); sounds.playStatAdd(); }}
            className={`py-2 px-3 rounded-xl text-xs font-bold font-orbitron transition flex items-center justify-center gap-1.5 ${
              activeTab === 'UI_FLOW'
                ? 'bg-purple-600 text-white font-black shadow-md shadow-purple-900/40'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>UI Screen Flow</span>
          </button>

          <button
            onClick={() => { setActiveTab('REACT_NATIVE'); sounds.playStatAdd(); }}
            className={`py-2 px-3 rounded-xl text-xs font-bold font-orbitron transition flex items-center justify-center gap-1.5 ${
              activeTab === 'REACT_NATIVE'
                ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-900/40'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>React Native (Expo)</span>
          </button>

          <button
            onClick={() => { setActiveTab('FLUTTER'); sounds.playStatAdd(); }}
            className={`py-2 px-3 rounded-xl text-xs font-bold font-orbitron transition flex items-center justify-center gap-1.5 ${
              activeTab === 'FLUTTER'
                ? 'bg-teal-600 text-slate-950 font-black shadow-md shadow-teal-900/40'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Flutter (Riverpod)</span>
          </button>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-y-auto rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-300">
          {/* DATABASE SCHEMA */}
          {activeTab === 'DATABASE' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-cyan-400 font-bold pb-2 border-b border-slate-800">
                <span>SQLITE / WATERMELONDB LOCAL PERSISTENCE SCHEMA</span>
                <button
                  onClick={() => handleCopy(ARCHITECTURE_DATA.databaseSchema)}
                  className="flex items-center gap-1 text-cyan-300 hover:underline cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied SQL' : 'Copy Schema'}
                </button>
              </div>
              <pre className="overflow-x-auto whitespace-pre leading-relaxed text-slate-300">
                {ARCHITECTURE_DATA.databaseSchema}
              </pre>
            </div>
          )}

          {/* UI SCREEN FLOW */}
          {activeTab === 'UI_FLOW' && (
            <div className="space-y-4 font-rajdhani">
              <div className="text-xs text-purple-400 font-bold pb-2 border-b border-slate-800 font-orbitron">
                SOLO LEVELING GAMIFIED APP SCREEN FLOW
              </div>
              <div className="grid gap-3">
                {ARCHITECTURE_DATA.uiScreensAndUserFlow.map((flow) => (
                  <div key={flow.step} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-500/40 flex items-center justify-center font-bold text-purple-300 text-sm shrink-0 font-orbitron">
                      {flow.step}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white font-orbitron">{flow.name}</h4>
                      <p className="text-xs text-slate-300 mt-1">{flow.description}</p>
                      <div className="mt-2 text-[11px] text-cyan-400 font-mono">
                        Next Transition → {flow.next}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REACT NATIVE CODE */}
          {activeTab === 'REACT_NATIVE' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-blue-400 font-bold pb-2 border-b border-slate-800">
                <span>REACT NATIVE / EXPO + ZUSTAND CORE CODE</span>
                <button
                  onClick={() => handleCopy(ARCHITECTURE_DATA.reactNativeStarterCode)}
                  className="flex items-center gap-1 text-blue-300 hover:underline cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied Code' : 'Copy Code'}
                </button>
              </div>
              <pre className="overflow-x-auto whitespace-pre leading-relaxed text-slate-300">
                {ARCHITECTURE_DATA.reactNativeStarterCode}
              </pre>
            </div>
          )}

          {/* FLUTTER CODE */}
          {activeTab === 'FLUTTER' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-teal-400 font-bold pb-2 border-b border-slate-800">
                <span>FLUTTER + RIVERPOD + GOROUTER CODE</span>
                <button
                  onClick={() => handleCopy(ARCHITECTURE_DATA.flutterStarterCode)}
                  className="flex items-center gap-1 text-teal-300 hover:underline cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied Code' : 'Copy Code'}
                </button>
              </div>
              <pre className="overflow-x-auto whitespace-pre leading-relaxed text-slate-300">
                {ARCHITECTURE_DATA.flutterStarterCode}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
