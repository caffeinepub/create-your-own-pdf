import { MousePointer, Type, Highlighter, PenTool, Pencil } from 'lucide-react';
import type { EditorTool } from '../pages/PdfEditor';

interface EditorToolbarProps {
  activeTool: EditorTool;
  onToolChange: (tool: EditorTool) => void;
}

export default function EditorToolbar({ activeTool, onToolChange }: EditorToolbarProps) {
  const tools: { id: EditorTool; icon: React.ReactNode; label: string }[] = [
    { id: 'select', icon: <MousePointer className="h-5 w-5" />, label: 'Select' },
    { id: 'text', icon: <Type className="h-5 w-5" />, label: 'Text' },
    { id: 'highlight', icon: <Highlighter className="h-5 w-5" />, label: 'Highlight' },
    { id: 'draw', icon: <Pencil className="h-5 w-5" />, label: 'Draw' },
    { id: 'signature', icon: <PenTool className="h-5 w-5" />, label: 'Signature' },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex flex-wrap gap-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTool === tool.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-background border border-border hover:bg-accent hover:border-primary/50'
            }`}
          >
            {tool.icon}
            <span className="hidden sm:inline">{tool.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
