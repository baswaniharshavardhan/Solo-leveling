import React from 'react';
import { InventoryItem, UserProfile } from '../../types';
import { sounds } from '../../utils/soundEffects';
import { Package, Heart, Sparkles, Key, Scroll, X, Shield, ArrowLeft } from 'lucide-react';

interface InventoryModalProps {
  inventory: InventoryItem[];
  profile: UserProfile;
  onUseItem: (itemId: string) => void;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  inventory,
  profile,
  onUseItem,
  onClose,
}) => {
  const getItemIcon = (iconName: string) => {
    switch (iconName) {
      case 'Heart': return <Heart className="w-5 h-5 text-rose-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-cyan-400" />;
      case 'Key': return <Key className="w-5 h-5 text-amber-400" />;
      case 'Scroll': return <Scroll className="w-5 h-5 text-purple-400" />;
      default: return <Package className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getRarityBadge = (rarity: InventoryItem['rarity']) => {
    switch (rarity) {
      case 'Legendary': return 'bg-amber-950 text-amber-300 border-amber-500/50';
      case 'Epic': return 'bg-purple-950 text-purple-300 border-purple-500/50';
      case 'Rare': return 'bg-blue-950 text-blue-300 border-blue-500/50';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const handleUse = (itemId: string) => {
    sounds.playQuestComplete();
    onUseItem(itemId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
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
            <Package className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-orbitron font-bold tracking-widest text-cyan-400 uppercase">
              HUNTER INVENTORY
            </span>
          </div>

          <button
            onClick={() => { sounds.playStatAdd(); onClose(); }}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {inventory.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center shrink-0">
                  {getItemIcon(item.icon)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{item.name}</h4>
                    <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${getRarityBadge(item.rarity)}`}>
                      {item.rarity}
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      x{item.quantity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-rajdhani mt-0.5">
                    {item.description}
                  </p>
                  <p className="text-[10px] text-cyan-300 font-mono mt-0.5">
                    Effect: {item.effectText}
                  </p>
                </div>
              </div>

              <button
                disabled={item.quantity <= 0}
                onClick={() => handleUse(item.id)}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 disabled:pointer-events-none text-slate-950 text-xs font-black font-orbitron transition whitespace-nowrap"
              >
                USE ITEM
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
