import re
import os

filepath = r'F:\Project\Hackathon\frontend\src\app\(dashboard)\dashboard\tasks\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add imports
imports = """import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
"""
content = content.replace('import { api } from "@/lib/api";', imports + 'import { api } from "@/lib/api";')

# 2. Replace New Task button
content = re.sub(
    r'<button\s*onClick=\{handleOpenCreateModal\}\s*className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-\[10px\] hover:opacity-90 transition-standard cursor-pointer"\s*>\s*<Plus className="w-4 h-4" />\s*New Task\s*</button>',
    '<Button onClick={handleOpenCreateModal}><Plus className="w-4 h-4 mr-2" /> New Task</Button>',
    content
)

content = re.sub(
    r'<button\s*onClick=\{handleOpenCreateModal\}\s*className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-\[10px\] hover:opacity-90 transition-standard cursor-pointer"\s*>\s*<Plus className="w-4 h-4" />\s*Create Task\s*</button>',
    '<Button onClick={handleOpenCreateModal}><Plus className="w-4 h-4 mr-2" /> Create Task</Button>',
    content
)

# 3. Form Inputs
content = content.replace(
    'className="w-full px-3 py-2 border border-border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-ring"',
    'className="w-full"'
)
content = re.sub(
    r'<input\s+type="text"\s+value=\{title\}',
    r'<Input type="text" value={title}',
    content
)
content = re.sub(
    r'<input\s+type="text"\s+value=\{subject\}',
    r'<Input type="text" value={subject}',
    content
)
content = re.sub(
    r'<input\s+type="datetime-local"\s+value=\{deadline\}',
    r'<Input type="datetime-local" value={deadline}',
    content
)
content = re.sub(
    r'<input\s+type="datetime-local"\s+value=\{reminderTime\}',
    r'<Input type="datetime-local" value={reminderTime}',
    content
)

# 4. Modal -> Dialog
old_modal_start = """      {/* Task Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-[12px] border border-border shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h2 className="text-lg font-bold text-foreground">
                {isEditing ? "Edit Task" : "Create New Task"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-accent rounded-full text-muted-foreground hover:text-foreground transition-standard cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>"""
new_modal_start = """      {/* Task Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Task" : "Create New Task"}</DialogTitle>
          </DialogHeader>"""
content = content.replace(old_modal_start, new_modal_start)

# End of form
old_form_buttons = """              <div className="flex gap-3 justify-end border-t border-border pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border text-foreground font-medium rounded-[10px] hover:bg-accent transition-standard cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-[10px] hover:opacity-90 transition-standard cursor-pointer disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isEditing ? "Save Changes" : "Create Task"}
                </button>
              </div>"""
new_form_buttons = """              <DialogFooter className="mt-6 border-t border-border pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                  {isEditing ? "Save Changes" : "Create Task"}
                </Button>
              </DialogFooter>"""
content = content.replace(old_form_buttons, new_form_buttons)

old_modal_end = """            </form>
          </div>
        </div>
      )}"""
new_modal_end = """            </form>
        </DialogContent>
      </Dialog>"""
content = content.replace(old_modal_end, new_modal_end)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
