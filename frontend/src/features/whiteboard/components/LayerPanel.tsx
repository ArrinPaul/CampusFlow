'use client';

import { Eye, EyeOff, Lock, Unlock, Trash2, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import { Layer } from '../hooks/useCanvasEngine';
import { memo } from 'react';

interface LayerPanelProps {
  layers: Layer[];
  activeLayerId: string;
  onSelectLayer: (id: string) => void;
  onAddLayer: () => void;
  onRemoveLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onReorderLayers: (layers: Layer[]) => void;
}

export const LayerPanel = memo(function LayerPanel({
  layers,
  activeLayerId,
  onSelectLayer,
  onAddLayer,
  onRemoveLayer,
  onToggleVisibility,
  onToggleLock,
  onReorderLayers,
}: LayerPanelProps) {
  
  const moveLayer = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= layers.length) return;
    
    const reordered = [...layers];
    const temp = reordered[index];
    reordered[index] = reordered[newIndex];
    reordered[newIndex] = temp;
    onReorderLayers(reordered);
  };

  return (
    <div className="w-64 border-l border-border bg-white flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-sm">Layers</h3>
        <button
          onClick={() => onAddLayer()}
          className="p-1 hover:bg-muted rounded-[6px] transition-colors cursor-pointer text-primary"
          title="Add Layer"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {layers.map((layer, index) => {
          const isActive = layer.id === activeLayerId;
          return (
            <div
              key={layer.id}
              onClick={() => onSelectLayer(layer.id)}
              className={`flex items-center justify-between p-2 rounded-[8px] border text-xs cursor-pointer transition-all ${
                isActive
                  ? 'bg-primary/5 border-primary text-primary font-medium'
                  : 'border-transparent hover:bg-muted text-muted-foreground'
              }`}
            >
              <span className="truncate max-w-[100px]">{layer.name}</span>
              
              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => onToggleVisibility(layer.id)}
                  className="p-1 hover:bg-muted rounded-[4px] cursor-pointer"
                  title={layer.visible ? 'Hide' : 'Show'}
                >
                  {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-destructive" />}
                </button>
                
                <button
                  onClick={() => onToggleLock(layer.id)}
                  className="p-1 hover:bg-muted rounded-[4px] cursor-pointer"
                  title={layer.locked ? 'Unlock' : 'Lock'}
                >
                  {layer.locked ? <Lock className="w-3.5 h-3.5 text-destructive" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>

                <div className="flex flex-col">
                  <button
                    onClick={() => moveLayer(index, 'up')}
                    disabled={index === 0}
                    className="hover:bg-muted rounded-[2px] disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-2.5 h-2.5" />
                  </button>
                  <button
                    onClick={() => moveLayer(index, 'down')}
                    disabled={index === layers.length - 1}
                    className="hover:bg-muted rounded-[2px] disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-2.5 h-2.5" />
                  </button>
                </div>

                <button
                  onClick={() => onRemoveLayer(layer.id)}
                  disabled={layers.length <= 1}
                  className="p-1 hover:bg-destructive/10 hover:text-destructive rounded-[4px] disabled:opacity-30 cursor-pointer"
                  title="Delete Layer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
