import { useState } from 'react';
import FileUploader from '../components/FileUploader';
import EditorToolbar from '../components/EditorToolbar';
import PdfCanvas from '../components/PdfCanvas';
import { Download, Loader2 } from 'lucide-react';

export type EditorTool = 'select' | 'text' | 'highlight' | 'draw' | 'signature';

export default function PdfEditor() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [activeTool, setActiveTool] = useState<EditorTool>('select');
  const [saving, setSaving] = useState(false);

  const handleFileSelect = (file: File) => {
    setPdfFile(file);
  };

  const handleSave = async () => {
    if (!pdfFile) return;

    setSaving(true);
    
    // Simulate save operation
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(pdfFile);
      link.download = `edited-${pdfFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSaving(false);
    }, 1000);
  };

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src="/assets/generated/icon-edit-pdf.dim_64x64.png"
              alt="Edit PDF"
              className="w-16 h-16"
            />
          </div>
          <h1 className="text-4xl font-bold">PDF Editor</h1>
          <p className="text-lg text-muted-foreground">
            Add annotations, highlights, and signatures to your PDF
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 space-y-6">
          {!pdfFile ? (
            <FileUploader
              accept=".pdf,application/pdf"
              onFileSelect={handleFileSelect}
              maxSize={50 * 1024 * 1024}
              label="Upload PDF to Edit"
            />
          ) : (
            <>
              <EditorToolbar
                activeTool={activeTool}
                onToolChange={setActiveTool}
              />

              <PdfCanvas file={pdfFile} activeTool={activeTool} />

              <div className="flex justify-center gap-4 pt-4 border-t border-border">
                <button
                  onClick={() => setPdfFile(null)}
                  className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-accent transition-colors"
                >
                  Upload Different PDF
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Save Edited PDF
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="bg-muted/30 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-lg">Available Tools</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span><strong>Text:</strong> Add text annotations anywhere on the page</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span><strong>Highlight:</strong> Highlight important sections</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span><strong>Draw:</strong> Draw shapes and freehand annotations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span><strong>Signature:</strong> Add your signature to the document</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
