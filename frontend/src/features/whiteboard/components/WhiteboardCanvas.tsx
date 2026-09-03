'use client';

import { useCanvasEngine } from '../hooks/useCanvasEngine';
import { useAutoSave } from '../hooks/useAutoSave';
import { WhiteboardToolbar } from './WhiteboardToolbar';
import { AiPanel } from './AiPanel';
import { LayerPanel } from './LayerPanel';
import { ShortcutsPanel } from './ShortcutsPanel';
import { Minimap } from './Minimap';
import { useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';
import { Layers, ArrowLeft, Cloud, CloudRain, RefreshCw, AlertCircle, CheckCircle2, Info, X, Trash2, Copy, Group, Ungroup } from 'lucide-react';
import { worldToScreenShape } from '../lib/canvas-utils';

interface WhiteboardCanvasProps {
  whiteboardId: string | null;
  title: string;
  onBack?: () => void;
}

export function WhiteboardCanvas({ whiteboardId, title, onBack }: WhiteboardCanvasProps) {
  const engine = useCanvasEngine();
  const [aiOpen, setAiOpen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Load saved whiteboard data on mount / change
  useEffect(() => {
    if (!whiteboardId) return;
    const loadBoard = async () => {
      try {
        const res = await api.get<{ whiteboard: any }>(`/api/whiteboards/${whiteboardId}`);
        const boardData = res.whiteboard.data || {};
        if (boardData.shapes) engine.setShapes(boardData.shapes);
        if (boardData.viewport) engine.setViewport(boardData.viewport);
        if (boardData.layers) engine.setLayers(boardData.layers);
      } catch (err) {
        console.error('Failed to load whiteboard:', err);
      }
    };
    loadBoard();
  }, [whiteboardId]);

  // Debounced auto-save (3 seconds delay)
  const saveStatus = useAutoSave(
    whiteboardId,
    engine.shapes,
    engine.viewport,
    engine.layers,
    title
  );

  const handleExportPng = useCallback(() => {
    const canvas = engine.canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${title.toLowerCase().replace(/\s+/g, '_') || 'whiteboard'}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }, [engine.canvasRef, title]);

  const handleExportJson = useCallback(() => {
    const data = JSON.stringify({ shapes: engine.shapes, viewport: engine.viewport, layers: engine.layers }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${title.toLowerCase().replace(/\s+/g, '_') || 'whiteboard'}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [engine.shapes, engine.viewport, engine.layers, title]);

  const handleImportJson = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (data.shapes) engine.setShapes(data.shapes);
          if (data.viewport) engine.setViewport(data.viewport);
          if (data.layers) engine.setLayers(data.layers);
        } catch {
          engine.showToast('Invalid JSON file. Please check the file format.', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [engine.setShapes, engine.setViewport, engine.setLayers, engine.showToast]);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] border border-border rounded-[10px] overflow-hidden bg-white shadow-sm relative">
      {/* Top Header bar with Back button, Title and Save status */}
      <div className="bg-muted/30 border-b border-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 hover:bg-muted rounded-[8px] transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
              title="Back to List"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <span className="font-semibold text-sm text-foreground">{title}</span>
          
          {/* Cloud Auto-save indicator */}
          {whiteboardId && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground ml-4 bg-muted px-2 py-0.5 rounded-[10px] font-medium">
              {saveStatus === 'saving' && (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin text-primary" />
                  <span>Saving...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <Cloud className="w-3 h-3 text-green-500" />
                  <span className="text-green-600">Saved to Cloud</span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <CloudRain className="w-3 h-3 text-destructive" />
                  <span className="text-destructive">Save Error</span>
                </>
              )}
              {saveStatus === 'idle' && (
                <>
                  <Cloud className="w-3 h-3 text-muted-foreground" />
                  <span>Synced</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <WhiteboardToolbar
        tool={engine.tool}
        onSetTool={engine.setTool}
        fillColor={engine.fillColor}
        onSetFillColor={engine.setFillColor}
        strokeColor={engine.strokeColor}
        onSetStrokeColor={engine.setStrokeColor}
        strokeWidth={engine.strokeWidth}
        onSetStrokeWidth={engine.setStrokeWidth}
        fontSize={engine.fontSize}
        onSetFontSize={engine.setFontSize}
        onUndo={engine.undo}
        onRedo={engine.redo}
        onClear={engine.clearCanvas}
        onExportPng={handleExportPng}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onGroupSelected={engine.groupSelected}
        onUngroupSelected={engine.ungroupSelected}
        onToggleShortcuts={() => setShortcutsOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 relative overflow-hidden">
          <canvas
            ref={engine.canvasRef}
            className="absolute inset-0"
            onMouseDown={engine.onMouseDown}
            onMouseMove={engine.onMouseMove}
            onMouseUp={engine.onMouseUp}
            onMouseLeave={engine.onMouseUp}
            onWheel={engine.onWheel}
            onDoubleClick={engine.onDoubleClick}
            onContextMenu={e => e.preventDefault()}
          />

          {/* Floating Selection Action Bar — appears when shape(s) are selected */}
          {engine.selectedIds.length > 0 && !engine.editingId && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-white border border-border shadow-lg rounded-[10px] px-2 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
              <span className="text-[10px] font-semibold text-muted-foreground px-1 border-r border-border mr-1">
                {engine.selectedIds.length} selected
              </span>
              <button
                onClick={engine.duplicateSelected}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                title="Duplicate (Ctrl+D)"
              >
                <Copy className="w-3.5 h-3.5" />
                Duplicate
              </button>
              {engine.selectedIds.length >= 2 && (
                <button
                  onClick={engine.groupSelected}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  title="Group (Ctrl+G)"
                >
                  <Group className="w-3.5 h-3.5" />
                  Group
                </button>
              )}
              {engine.shapes.some(s => engine.selectedIds.includes(s.id) && s.groupId) && (
                <button
                  onClick={engine.ungroupSelected}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  title="Ungroup (Ctrl+Shift+G)"
                >
                  <Ungroup className="w-3.5 h-3.5" />
                  Ungroup
                </button>
              )}
              <div className="w-px h-4 bg-border mx-1" />
              <button
                onClick={engine.deleteSelected}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                title="Delete selected (Delete / Backspace)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          )}

          {/* Minimap Overlay component */}
          <Minimap
            shapes={engine.shapes}
            viewport={engine.viewport}
            onSetViewport={engine.setViewport}
            parentCanvas={engine.canvasRef.current}
          />

          {/* Status info bar */}
          <div className="absolute bottom-2 left-2 flex gap-3 text-[10px] text-muted-foreground bg-white/80 px-2 py-1 rounded border border-border/50 pointer-events-none font-medium">
            <span>{engine.tool.toUpperCase()}</span>
            <span>{engine.cursorPos.x}, {engine.cursorPos.y}</span>
            <span>{engine.zoomPercent}%</span>
          </div>

          {/* Absolute positioned Layers toggle button */}
          <button
            onClick={() => setLayersOpen(!layersOpen)}
            className={`absolute bottom-2 right-2 z-20 p-2 rounded-full border shadow-sm transition-all cursor-pointer ${
              layersOpen
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-white text-muted-foreground border-border hover:text-foreground'
            }`}
            title="Toggle Layers"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Absolute positioned inline editing textarea */}
          {engine.editingId && (
            (() => {
              const editingShape = engine.shapes.find(s => s.id === engine.editingId);
              if (!editingShape) return null;
              const s = worldToScreenShape(editingShape, engine.viewport);
              return (
                <textarea
                  value={engine.editingText}
                  onChange={e => engine.setEditingText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      engine.finishTextEditing(true);
                    } else if (e.key === 'Escape') {
                      engine.finishTextEditing(false);
                    }
                  }}
                  onBlur={() => engine.finishTextEditing(true)}
                  className="absolute z-40 bg-white border-2 border-primary rounded p-1 text-center font-sans resize-none focus:outline-none focus:ring-1 focus:ring-primary shadow-lg"
                  style={{
                    left: `${s.x}px`,
                    top: `${s.y}px`,
                    width: `${s.w}px`,
                    height: `${s.h}px`,
                    fontSize: `${editingShape.fontSize * engine.viewport.zoom}px`,
                    lineHeight: 1.3,
                    fontFamily: editingShape.fontFamily || 'Arial',
                  }}
                  autoFocus
                />
              );
            })()
          )}
        </div>

        {/* Sidebar layers management panel */}
        {layersOpen && (
          <LayerPanel
            layers={engine.layers}
            activeLayerId={engine.activeLayerId}
            onSelectLayer={engine.setActiveLayerId}
            onAddLayer={engine.addLayer}
            onRemoveLayer={engine.removeLayer}
            onToggleVisibility={engine.toggleLayerVisibility}
            onToggleLock={engine.toggleLayerLock}
            onReorderLayers={engine.reorderLayers}
          />
        )}

        <AiPanel
          isOpen={aiOpen}
          onToggle={() => setAiOpen(!aiOpen)}
          shapes={engine.shapes}
          onAddShapes={engine.addShapes}
        />
      </div>

      {/* Shortcuts overlay panel */}
      <ShortcutsPanel isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      {/* Toast Notification */}
      {engine.toast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-white border border-border shadow-lg rounded-[10px] px-4 py-3 animate-in fade-in slide-in-from-top-4 duration-300">
          {engine.toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
          ) : engine.toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
          )}
          <span className="text-sm font-medium text-foreground">{engine.toast.message}</span>
          <button
            onClick={engine.clearToast}
            className="ml-2 p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
