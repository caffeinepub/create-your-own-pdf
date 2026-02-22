import { Link } from '@tanstack/react-router';
import ToolCard from '../components/ToolCard';

export default function Home() {
  const tools = [
    {
      icon: '/assets/generated/icon-pdf-to-image.dim_64x64.png',
      title: 'PDF to Image',
      description: 'Convert each page of your PDF into high-quality images',
      path: '/pdf-to-image',
    },
    {
      icon: '/assets/generated/icon-image-to-pdf.dim_64x64.png',
      title: 'Image to PDF',
      description: 'Combine multiple images into a single PDF document',
      path: '/image-to-pdf',
    },
    {
      icon: '/assets/generated/icon-doc-to-pdf.dim_64x64.png',
      title: 'Document to PDF',
      description: 'Convert DOCX, TXT, and RTF files to PDF format',
      path: '/doc-to-pdf',
    },
    {
      icon: '/assets/generated/icon-pdf-to-doc.dim_64x64.png',
      title: 'PDF to Document',
      description: 'Extract text from PDF and convert to editable formats',
      path: '/pdf-to-doc',
    },
    {
      icon: '/assets/generated/icon-split-pdf.dim_64x64.png',
      title: 'Split PDF',
      description: 'Split your PDF into multiple files by page ranges',
      path: '/split-pdf',
    },
    {
      icon: '/assets/generated/icon-merge-pdf.dim_64x64.png',
      title: 'Merge PDF',
      description: 'Combine multiple PDF files into a single document',
      path: '/merge-pdf',
    },
    {
      icon: '/assets/generated/icon-unlock-pdf.dim_64x64.png',
      title: 'Unlock PDF',
      description: 'Remove password protection from encrypted PDFs',
      path: '/unlock-pdf',
    },
    {
      icon: '/assets/generated/icon-edit-pdf.dim_64x64.png',
      title: 'Edit PDF',
      description: 'Add annotations, highlights, shapes, and signatures',
      path: '/edit-pdf',
    },
    {
      icon: '/assets/generated/translate-icon.dim_128x128.png',
      title: 'PDF Translator',
      description: 'Convert PDFs between languages while preserving layout',
      path: '/pdf-translator',
    },
  ];

  return (
    <div className="w-full">
      <section
        className="relative w-full py-24 md:py-32 bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/generated/hero-bg.dim_1920x600.png)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              Create your own PDF
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              Professional PDF tools for all your document needs. Convert, edit, merge, split, and more.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Tool</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select from our comprehensive suite of PDF manipulation tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool) => (
              <ToolCard key={tool.path} {...tool} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Why Choose Us?</h2>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="font-semibold text-lg">Fast & Efficient</h3>
                <p className="text-sm text-muted-foreground">
                  Process your documents quickly with our optimized tools
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="font-semibold text-lg">Secure & Private</h3>
                <p className="text-sm text-muted-foreground">
                  Your files are processed securely and never stored permanently
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="font-semibold text-lg">Easy to Use</h3>
                <p className="text-sm text-muted-foreground">
                  Intuitive interface designed for everyone
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
