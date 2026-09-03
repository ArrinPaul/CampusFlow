'use client';

import {
  MousePointer2, Square, RectangleHorizontal, Circle, Diamond,
  Type, ArrowRight, StickyNote, Undo2, Redo2, Trash2,
  Download, Upload, Save, Minus, Pen, Image as ImageIcon,
  Group, Ungroup, HelpCircle,
} from 'lucide-react';
import { ToolId, TOOL_LIST, COLORS } from '../lib/shapes';
import { memo } from 'react';

interface ToolbarProps {
  tool: ToolId;
  onSetTool: (t: ToolId) => void;
  fillColor: string;
  onSetFillColor: (c: string) => void;
  strokeColor: string;
  onSetStrokeColor: (c: string) => void;
  strokeWidth: number;
  onSetStrokeWidth: (w: number) => void;
  fontSize: number;
  onSetFontSize: (s: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onExportPng: () => void;
  onExportJson: () => void;
  onImportJson: () => void;
  onGroupSelected: () => void;
  onUngroupSelected: () => void;
  onToggleShortcuts: () => void;
}

const TOOL_ICONS: Record<string, React.ReactNode> = {
  select: <MousePointer2 className="w-4 h-4" />,
  pen: <Pen className="w-4 h-4" />,
  rect: <Square className="w-4 h-4" />,
  rrect: <RectangleHorizontal className="w-4 h-4" />,
  ellipse: <Circle className="w-4 h-4" />,
  diamond: <Diamond className="w-4 h-4" />,
  text: <Type className="w-4 h-4" />,
  arrow: <ArrowRight className="w-4 h-4" />,
  sticky: <StickyNote className="w-4 h-4" />,
  image: <ImageIcon className="w-4 h-4" />,
};

export const WhiteboardToolbar = memo(function WhiteboardToolbar({
  tool, onSetTool, fillColor, onSetFillColor, strokeColor, onSetStrokeColor,
  strokeWidth, onSetStrokeWidth, fontSize, onSetFontSize,
  onUndo, onRedo, onClear, onExportPng, onExportJson, onImportJson,
  onGroupSelected, onUngroupSelected, onToggleShortcuts,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-white border-b border-border flex-wrap">
      <div className="flex items-center gap-1">
        {TOOL_LIST.map(t => (
          <button
            key={t.id}
            onClick={() => onSetTool(t.id as ToolId)}
            title={`${t.label} (${t.key})`}
            className={`p-2 rounded-[6px] transition-colors cursor-pointer ${
              tool === t.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {TOOL_ICONS[t.id]}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-border mx-2" />

      <div className="flex items-center gap-2">
        <label className="text-[10px] text-muted-foreground font-medium">Fill</label>
        <input
          type="color"
          value={fillColor}
          onChange={e => onSetFillColor(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer border border-border"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-[10px] text-muted-foreground font-medium">Stroke</label>
        <input
          type="color"
          value={strokeColor}
          onChange={e => onSetStrokeColor(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer border border-border"
        />
      </div>

      <div className="flex items-center gap-2">
        <Minus className="w-3 h-3 text-muted-foreground" />
        <input
          type="range"
          min={1}
          max={20}
          value={strokeWidth}
          onChange={e => onSetStrokeWidth(Number(e.target.value))}
          className="w-16 accent-primary"
        />
        <span className="text-[10px] text-muted-foreground w-4">{strokeWidth}</span>
      </div>

      <div className="w-px h-6 bg-border mx-2" />

      <div className="flex items-center gap-2">
        <label className="text-[10px] text-muted-foreground font-medium">Font</label>
        <input
          type="range"
          min={10}
          max={48}
          value={fontSize}
          onChange={e => onSetFontSize(Number(e.target.value))}
          className="w-16 accent-primary"
        />
        <span className="text-[10px] text-muted-foreground w-4">{fontSize}</span>
      </div>

      <div className="w-px h-6 bg-border mx-2" />

      <div className="flex items-center gap-0.5">
        <div className="grid grid-cols-8 gap-0.5">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => onSetFillColor(c)}
              onContextMenu={e => { e.preventDefault(); onSetStrokeColor(c); }}
              className="w-4 h-4 rounded-[10px] border border-border/50 hover:scale-125 transition-transform cursor-pointer"
              style={{ background: c }}
              title={`Left: fill | Right: stroke\n${c}`}
            />
          ))}
        </div>
      </div>

      <div className="w-px h-6 bg-border mx-2" />

      <div className="flex items-center gap-1">
        <button onClick={onUndo} title="Undo (Ctrl+Z)" className="p-2 rounded-[6px] text-muted-foreground hover:bg-muted cursor-pointer">
          <Undo2 className="w-4 h-4" />
        </button>
        <button onClick={onRedo} title="Redo (Ctrl+Y)" className="p-2 rounded-[6px] text-muted-foreground hover:bg-muted cursor-pointer">
          <Redo2 className="w-4 h-4" />
        </button>
        <button onClick={onClear} title="Clear canvas" className="p-2 rounded-[6px] text-muted-foreground hover:bg-muted hover:text-destructive cursor-pointer">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-border mx-2" />

      <div className="flex items-center gap-1">
        <button onClick={onGroupSelected} title="Group shapes (Ctrl+G)" className="p-2 rounded-[6px] text-muted-foreground hover:bg-muted cursor-pointer">
          <Group className="w-4 h-4" />
        </button>
        <button onClick={onUngroupSelected} title="Ungroup shapes (Ctrl+Shift+G)" className="p-2 rounded-[6px] text-muted-foreground hover:bg-muted cursor-pointer">
          <Ungroup className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-border mx-2" />

      <div className="flex items-center gap-1">
        <button onClick={onExportPng} title="Export PNG" className="p-2 rounded-[6px] text-muted-foreground hover:bg-muted cursor-pointer">
          <Download className="w-4 h-4" />
        </button>
        <button onClick={onExportJson} title="Save JSON" className="p-2 rounded-[6px] text-muted-foreground hover:bg-muted cursor-pointer">
          <Save className="w-4 h-4" />
        </button>
        <button onClick={onImportJson} title="Load JSON" className="p-2 rounded-[6px] text-muted-foreground hover:bg-muted cursor-pointer">
          <Upload className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-border mx-2" />

      <div className="flex items-center gap-1">
        <button onClick={onToggleShortcuts} title="Keyboard Shortcuts" className="p-2 rounded-[6px] text-muted-foreground hover:bg-muted cursor-pointer">
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});
