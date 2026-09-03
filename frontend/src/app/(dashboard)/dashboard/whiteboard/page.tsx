'use client';

import { useState, useEffect } from 'react';
import { useWhiteboards } from '@/features/whiteboard/hooks/useWhiteboards';
import { WhiteboardList } from '@/features/whiteboard/components/WhiteboardList';
import { WhiteboardCanvas } from '@/features/whiteboard/components/WhiteboardCanvas';
import { PenTool, Loader2 } from 'lucide-react';

export default function WhiteboardPage() {
  const {
    whiteboards,
    loading,
    fetchWhiteboards,
    createWhiteboard,
    updateWhiteboard,
    deleteWhiteboard,
  } = useWhiteboards();

  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);

  // Custom Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('New Whiteboard');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchWhiteboards();
  }, [fetchWhiteboards]);

  const activeBoard = whiteboards.find(w => w.id === activeBoardId);

  const handleCreateBoard = () => {
    setNewBoardTitle('New Whiteboard');
    setIsCreateModalOpen(true);
  };

  const submitCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = newBoardTitle.trim() || 'Untitled Whiteboard';
    const newBoard = await createWhiteboard(cleanTitle);
    if (newBoard) {
      setActiveBoardId(newBoard.id);
    }
    setIsCreateModalOpen(false);
  };

  const handleRenameBoard = async (id: string, newTitle: string) => {
    await updateWhiteboard(id, newTitle);
  };

  const handleDeleteBoard = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteBoard = async () => {
    if (!deleteConfirmId) return;
    const success = await deleteWhiteboard(deleteConfirmId);
    if (success && activeBoardId === deleteConfirmId) {
      setActiveBoardId(null);
    }
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-4 h-full relative">
      {!activeBoardId ? (
        <div className="max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
          <div className="flex items-center justify-between flex-shrink-0 mb-6">
            <h1 className="text-2xl font-bold text-foreground">Whiteboard</h1>
          </div>
          {loading && whiteboards.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 pb-6">
              <WhiteboardList
                whiteboards={whiteboards}
                onSelectBoard={setActiveBoardId}
                onCreateBoard={handleCreateBoard}
                onDeleteBoard={handleDeleteBoard}
                onRenameBoard={handleRenameBoard}
              />
            </div>
          )}
        </div>
      ) : (
        <WhiteboardCanvas
          whiteboardId={activeBoardId}
          title={activeBoard?.title || 'Untitled Whiteboard'}
          onBack={() => {
            setActiveBoardId(null);
            fetchWhiteboards(); // Refresh list to update dates
          }}
        />
      )}

      {/* Create Whiteboard In-App Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-[12px] border border-border shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h2 className="text-lg font-bold text-foreground">Create New Whiteboard</h2>
            </div>
            
            <form onSubmit={submitCreateBoard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Whiteboard Title</label>
                <input
                  type="text"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  placeholder="e.g. System Architecture Diagram"
                  className="w-full px-3 py-2 border border-border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 justify-end border-t border-border pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-border hover:bg-muted text-muted-foreground rounded-[10px] text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-[10px] text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation In-App Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-[12px] border border-border shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h2 className="text-lg font-bold text-foreground">Delete Whiteboard</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to delete "{whiteboards.find(w => w.id === deleteConfirmId)?.title || 'this whiteboard'}"? This action is permanent and cannot be undone.
            </p>
            <div className="flex gap-3 justify-end border-t border-border pt-4 mt-6">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-border hover:bg-muted text-muted-foreground rounded-[10px] text-sm font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteBoard}
                className="px-4 py-2 bg-destructive text-white rounded-[10px] text-sm font-medium hover:opacity-90 transition-colors cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
