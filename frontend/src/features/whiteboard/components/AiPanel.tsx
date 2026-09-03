'use client';

import { useState, memo } from 'react';
import { Bot, Sparkles, Code, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { Shape, createShape, genId } from '../lib/shapes';
import { TEXT_TO_DIAGRAM_PROMPT, CANVAS_TO_CODE_PROMPT } from '../lib/ai-prompts';
import { serializeCanvasForAI } from '../lib/canvas-utils';

interface AiPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  shapes: Shape[];
  onAddShapes: (shapes: Shape[]) => void;
}

type TabId = 'text-to-diagram' | 'canvas-to-code';

export const AiPanel = memo(function AiPanel({ isOpen, onToggle, shapes, onAddShapes }: AiPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('text-to-diagram');
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTextToDiagram = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setOutput('');

    try {
      const res = await api.post<{ reply: string }>('/api/ai/chat', {
        messages: [
          { role: 'system', content: TEXT_TO_DIAGRAM_PROMPT },
          { role: 'user', content: prompt },
        ],
      });

      const jsonStr = res.reply;
      setOutput(jsonStr);

      let data;
      try {
        data = JSON.parse(jsonStr);
      } catch {
        const match = jsonStr.match(/\{[\s\S]*\}/);
        if (match) data = JSON.parse(match[0]);
        else throw new Error('No valid JSON in AI response');
      }

      const idMap: Record<string, string> = {};
      const newShapes: Shape[] = [];

      if (data.nodes) {
        for (const node of data.nodes) {
          const id = genId();
          idMap[node.id] = id;
          const typeMap: Record<string, Shape['type']> = {
            diamond: 'diamond', ellipse: 'ellipse', sticky: 'sticky', text: 'text',
          };
          const shapeType = typeMap[node.type] || 'rect';
          const fillColor = node.type === 'diamond' ? '#fff3cd'
            : node.type === 'ellipse' ? '#d4efdf'
            : node.type === 'sticky' ? '#ffeaa7' : '#ffffff';

          newShapes.push(createShape(shapeType, {
            id, x: node.x || 400, y: node.y || 100,
            width: shapeType === 'sticky' ? 160 : shapeType === 'diamond' ? 160 : 180,
            height: shapeType === 'sticky' ? 160 : shapeType === 'diamond' ? 110 : 80,
            text: node.label || '', fill: fillColor, stroke: '#333333', strokeWidth: 2, fontSize: 14,
          }));
        }
      }

      if (data.edges) {
        for (const edge of data.edges) {
          if (idMap[edge.from] && idMap[edge.to]) {
            newShapes.push(createShape('arrow', {
              startShapeId: idMap[edge.from], endShapeId: idMap[edge.to],
              text: edge.label || '', stroke: '#555555', strokeWidth: 2,
            }));
          }
        }
      }

      if (newShapes.length > 0) onAddShapes(newShapes);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate diagram');
    } finally {
      setLoading(false);
    }
  };

  const handleCanvasToCode = async () => {
    setLoading(true);
    setError('');
    setOutput('');

    try {
      const serialized = serializeCanvasForAI(shapes);
      const res = await api.post<{ reply: string }>('/api/ai/chat', {
        messages: [
          { role: 'system', content: CANVAS_TO_CODE_PROMPT },
          { role: 'user', content: `Here is the canvas content:\n\n${serialized}` },
        ],
      });
      setOutput(res.reply);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to analyze canvas');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-50 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:opacity-90 transition-opacity cursor-pointer"
        title="Open AI Panel"
      >
        <Bot className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="w-[340px] border-l border-border bg-white flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          AI Assistant
        </h3>
        <button onClick={onToggle} className="p-1 hover:bg-muted rounded cursor-pointer">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('text-to-diagram')}
          className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'text-to-diagram'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Text → Diagram
        </button>
        <button
          onClick={() => setActiveTab('canvas-to-code')}
          className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'canvas-to-code'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Canvas → Code
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'text-to-diagram' ? (
          <>
            <p className="text-xs text-muted-foreground">
              Describe a workflow or process and AI will generate a diagram on the canvas.
            </p>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. User signup flow: enter email, verify code, create password, redirect to dashboard..."
              className="w-full h-32 px-3 py-2 border border-border rounded-[8px] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={handleTextToDiagram}
              disabled={loading || !prompt.trim()}
              className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-[8px] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate Diagram
            </button>
          </>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              AI reads your canvas shapes and connections, then generates code or a task plan.
            </p>
            <div className="px-3 py-2 bg-muted/30 border border-border rounded-[8px] text-xs text-muted-foreground">
              {shapes.length} shape{shapes.length !== 1 ? 's' : ''} on canvas
            </div>
            <button
              onClick={handleCanvasToCode}
              disabled={loading || shapes.length === 0}
              className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-[8px] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Code className="w-4 h-4" />}
              Analyze Canvas
            </button>
          </>
        )}

        {error && (
          <div className="px-3 py-2 bg-destructive/10 border border-destructive/20 rounded-[8px] text-xs text-destructive">
            {error}
          </div>
        )}

        {output && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Output</p>
            <pre className="px-3 py-2 bg-muted/30 border border-border rounded-[8px] text-xs overflow-x-auto whitespace-pre-wrap max-h-[400px] overflow-y-auto">
              {output}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
});
