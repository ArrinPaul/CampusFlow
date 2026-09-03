'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, Calendar, FileText, Check, X } from 'lucide-react';
import { Whiteboard } from '../hooks/useWhiteboards';

interface WhiteboardListProps {
  whiteboards: Whiteboard[];
  onSelectBoard: (id: string) => void;
  onCreateBoard: () => void;
  onDeleteBoard: (id: string) => void;
  onRenameBoard: (id: string, title: string) => void;
}

export function WhiteboardList({
  whiteboards,
  onSelectBoard,
  onCreateBoard,
  onDeleteBoard,
  onRenameBoard,
}: WhiteboardListProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');

  const startRename = (wb: Whiteboard, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(wb.id);
    setRenameText(wb.title);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(null);
    setRenameText('');
  };

  const saveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (renameText.trim()) {
      onRenameBoard(id, renameText.trim());
    }
    setRenamingId(null);
    setRenameText('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">My Whiteboards</h2>
          <p className="text-xs text-muted-foreground mt-1">Create or manage visual diagram workspaces</p>
        </div>
        <button
          onClick={onCreateBoard}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-[10px] text-sm font-medium hover:opacity-90 transition-all cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Whiteboard
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Create new card */}
        <div
          onClick={onCreateBoard}
          className="h-44 border-2 border-dashed border-border hover:border-primary/50 bg-[#FCFBFA]/50 rounded-[10px] flex flex-col items-center justify-center gap-3 cursor-pointer group transition-all"
        >
          <div className="p-3 bg-muted group-hover:bg-primary/10 rounded-full transition-colors">
            <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
          </div>
          <span className="text-sm font-medium text-muted-foreground group-hover:text-primary">Create Whiteboard</span>
        </div>

        {/* Existing cards */}
        {whiteboards.map((wb) => {
          const isRenaming = renamingId === wb.id;
          const dateStr = new Date(wb.updated_at).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });

          return (
            <div
              key={wb.id}
              onClick={() => !isRenaming && onSelectBoard(wb.id)}
              className="h-44 border border-border bg-[#FCFBFA] hover:shadow-md rounded-[10px] p-4 flex flex-col justify-between cursor-pointer group relative transition-all"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-start justify-between">
                  <div className="p-2 bg-primary/10 text-primary rounded-[8px]">
                    <FileText className="w-5 h-5" />
                  </div>
                  
                  {/* Action buttons hover display */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!isRenaming && (
                      <>
                        <button
                          onClick={(e) => startRename(wb, e)}
                          className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-[6px] transition-colors"
                          title="Rename"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteBoard(wb.id);
                          }}
                          className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-[6px] transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isRenaming ? (
                  <div className="flex items-center gap-1 mt-2" onClick={e => e.stopPropagation()}>
                    <input
                      type="text"
                      value={renameText}
                      onChange={(e) => setRenameText(e.target.value)}
                      className="flex-1 min-w-0 px-2 py-1 border border-primary rounded-[6px] text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                      autoFocus
                    />
                    <button
                      onClick={(e) => saveRename(wb.id, e)}
                      className="p-1 bg-green-50 text-green-600 border border-green-200 rounded-[4px]"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={cancelRename}
                      className="p-1 bg-destructive/10 text-destructive border border-destructive/20 rounded-[4px]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <h3 className="font-semibold text-sm text-foreground truncate mt-2">{wb.title}</h3>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground border-t border-border/50 pt-2.5 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                <span>Updated {dateStr}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
