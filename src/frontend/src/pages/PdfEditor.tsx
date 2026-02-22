import { useState } from 'react';
import FileUploader from '../components/FileUploader';
import EditorToolbar from '../components/EditorToolbar';
import PdfCanvas from '../components/PdfCanvas';
import { FileDown } from 'lucide-react';

export type EditorTool = 'select' | 'text' | 'highlight' | 'rectangle' | 'circle' | 'line' | 'signature';

export default function PdfEditor() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [activeTool, setActiveTool] = useState<EditorTool>('select');
  const [saving, setSaving] = useState(false);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
  };

  const handleSave = async () => {
    if (!uploadedFile) return;

    setSaving(true);
    // Placeholder for saving edited PDF
    setTimeout(() => {
      setSaving(false);
    }, 2000);
  };

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src="/assets/generated/icon-edit-pdf.dim_64x64.png"
              alt="Edit PDF"
              className="w-20 h-20"
            />
          </div>
          <h1 className="text-4xl font-bold">PDF Editor</h1>
          <p className="text-lg text-muted-foreground">
            Add annotations, highlights, shapes, and signatures to your PDF
          </p>
        </div>

        {!uploadedFile ? (
          <div className="bg-card border border-border rounded-xl p-8">
            <FileUploader
              accept=".pdf"
              onFileSelect={handleFileUpload}
              maxSize={50 * 1024 * 1024}
              label="Upload PDF to Edit"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <EditorToolbar activeTool={activeTool} onToolChange={setActiveTool} />
            
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <PdfCanvas file={uploadedFile} activeTool={activeTool} />
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setUploadedFile(null)}
                className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FileDown className="h-5 w-5 inline mr-2" />
                {saving ? 'Saving...' : 'Save & Download'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
