import React, { useState } from 'react';
import { Storage } from '../../utils/storage';
import { sounds } from '../../utils/soundEffects';
import { Download, Upload, RotateCcw, Check, X, ShieldAlert, FileText, ArrowLeft } from 'lucide-react';

interface BackupModalProps {
  onClose: () => void;
  onRefreshData: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ onClose, onRefreshData }) => {
  const [jsonText, setJsonText] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExport = () => {
    sounds.playStatAdd();
    const backupJson = Storage.exportFullBackup();
    setJsonText(backupJson);
    setMsg({ type: 'success', text: 'Backup JSON generated. Copy or save file offline.' });
  };

  const handleDownloadFile = () => {
    sounds.playStatAdd();
    const backupJson = Storage.exportFullBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solo_leveling_offline_save_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg({ type: 'success', text: 'Backup file saved to your device.' });
  };

  const handleImport = () => {
    if (!jsonText.trim()) {
      setMsg({ type: 'error', text: 'Please paste valid JSON state.' });
      sounds.playWarning();
      return;
    }

    const success = Storage.importBackup(jsonText);
    if (success) {
      sounds.playLevelUp();
      setMsg({ type: 'success', text: 'State restored successfully from offline backup!' });
      setTimeout(() => {
        onRefreshData();
        onClose();
      }, 800);
    } else {
      sounds.playWarning();
      setMsg({ type: 'error', text: 'Failed to parse JSON backup. Format invalid.' });
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all offline progress? This will reset your stats to Level 1.')) {
      sounds.playWarning();
      Storage.resetAllData();
      onRefreshData();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-lg system-window rounded-2xl p-6 relative border border-cyan-500/50">
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/40 mb-4">
          <button
            onClick={() => { sounds.playStatAdd(); onClose(); }}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs font-bold font-orbitron text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-orbitron font-bold tracking-widest text-cyan-400 uppercase">
              OFFLINE BACKUP
            </span>
          </div>

          <button
            onClick={() => { sounds.playStatAdd(); onClose(); }}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {msg && (
          <div className={`p-3 rounded-xl text-xs font-rajdhani mb-4 flex items-center gap-2 ${
            msg.type === 'success' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-red-950 text-red-300 border border-red-500/40'
          }`}>
            {msg.text}
          </div>
        )}

        <div className="space-y-4 text-xs font-rajdhani">
          <p className="text-slate-300">
            This application functions <strong>100% offline</strong>. All user attributes, 30-day hunter progress, completed chess tactics, and inventory are securely saved in your browser’s local storage.
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex-1 py-2.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black font-orbitron text-xs transition flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" /> Generate Backup
            </button>
            <button
              onClick={handleDownloadFile}
              className="flex-1 py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold font-orbitron text-xs border border-cyan-500/40 transition flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Download .JSON
            </button>
          </div>

          <div>
            <label className="block text-slate-400 font-mono text-[11px] mb-1">
              Backup JSON Payload / Restore Paste:
            </label>
            <textarea
              rows={4}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="Paste backup JSON string here to restore progress..."
              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleImport}
              className="py-2 px-4 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold font-orbitron text-xs transition flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" /> Restore Backup
            </button>

            <button
              onClick={handleReset}
              className="py-2 px-3 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 text-xs font-bold transition flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
